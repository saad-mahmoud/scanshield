import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from 'express';
import { Repository } from 'typeorm';
import { ApiKey } from '../entities/api-key.entity';
import { hashApiKey } from './api-key.util';

@Injectable()
export class ApiKeyAuthGuard implements CanActivate {
  constructor(
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
      throw new UnauthorizedException('Missing API key');
    }

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
}
