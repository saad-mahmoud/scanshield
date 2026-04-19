import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import type { Request } from 'express';
import { Repository } from 'typeorm';
import { ApiKey } from '../entities/api-key.entity';
import { User } from '../entities/user.entity';
import { hashApiKey } from './api-key.util';
import { resolveJwtUser } from './resolve-jwt-user';

/**
 * Accepts either a JWT (browser session) or an API key (`sk_…`) for automation.
 */
@Injectable()
export class ScanAuthGuard implements CanActivate {
  constructor(
    private readonly jwt: JwtService,
    @InjectRepository(User)
    private readonly users: Repository<User>,
    @InjectRepository(ApiKey)
    private readonly apiKeys: Repository<ApiKey>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid Authorization header');
    }
    const token = authHeader.slice('Bearer '.length).trim();
    if (!token) {
      throw new UnauthorizedException('Missing credentials');
    }

    if (token.startsWith('sk_')) {
      const keyHash = hashApiKey(token);
      const record = await this.apiKeys.findOne({
        where: { keyHash },
        relations: ['user'],
      });
      if (!record?.user) {
        throw new UnauthorizedException('Invalid API key');
      }
      request.user = record.user;
      return true;
    }

    request.user = await resolveJwtUser(this.jwt, this.users, token);
    return true;
  }
}
