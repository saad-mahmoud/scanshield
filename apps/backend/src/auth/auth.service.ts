import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { Repository } from 'typeorm';
import { ApiKey } from '../entities/api-key.entity';
import { User } from '../entities/user.entity';
import { hashApiKey } from './api-key.util';
import type { CreateApiKeyDto } from './dto/create-api-key.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly users: Repository<User>,
    @InjectRepository(ApiKey)
    private readonly apiKeys: Repository<ApiKey>,
  ) {}

  async createApiKey(dto: CreateApiKeyDto): Promise<{ apiKey: string }> {
    const user = await this.users.findOne({ where: { email: dto.email } });
    if (
      !user ||
      !(await bcrypt.compare(dto.password, user.passwordHash))
    ) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const plainKey = `sk_${randomBytes(24).toString('base64url')}`;
    const keyHash = hashApiKey(plainKey);

    await this.apiKeys.save(
      this.apiKeys.create({
        keyHash,
        user: { id: user.id },
      }),
    );

    return { apiKey: plainKey };
  }
}
