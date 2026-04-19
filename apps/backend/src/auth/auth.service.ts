import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { Repository } from 'typeorm';
import { ApiKey } from '../entities/api-key.entity';
import { User } from '../entities/user.entity';
import { hashApiKey } from './api-key.util';
import type { LoginDto } from './dto/login.dto';
import type { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly users: Repository<User>,
    @InjectRepository(ApiKey)
    private readonly apiKeys: Repository<ApiKey>,
    private readonly jwt: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<{ accessToken: string }> {
    const existing = await this.users.findOne({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException('Email already registered');
    }
    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.users.save(
      this.users.create({ email: dto.email, passwordHash }),
    );
    return { accessToken: await this.signUser(user.id) };
  }

  async login(dto: LoginDto): Promise<{ accessToken: string }> {
    const user = await this.users.findOne({ where: { email: dto.email } });
    if (!user || !(await bcrypt.compare(dto.password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid email or password');
    }
    return { accessToken: await this.signUser(user.id) };
  }

  private async signUser(userId: string): Promise<string> {
    return this.jwt.signAsync({ sub: userId });
  }

  async createApiKey(userId: string): Promise<{
    id: string;
    apiKey: string;
    keyPrefix: string;
    createdAt: string;
  }> {
    const plainKey = `sk_${randomBytes(24).toString('base64url')}`;
    const keyHash = hashApiKey(plainKey);
    const keyPrefix = `${plainKey.slice(0, 12)}…`;

    const row = await this.apiKeys.save(
      this.apiKeys.create({
        keyHash,
        keyPrefix,
        user: { id: userId },
      }),
    );

    return {
      id: row.id,
      apiKey: plainKey,
      keyPrefix: row.keyPrefix ?? keyPrefix,
      createdAt: row.createdAt.toISOString(),
    };
  }

  async listApiKeys(userId: string): Promise<
    Array<{ id: string; keyPrefix: string | null; createdAt: string }>
  > {
    const rows = await this.apiKeys.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
    });
    return rows.map((k) => ({
      id: k.id,
      keyPrefix: k.keyPrefix,
      createdAt: k.createdAt.toISOString(),
    }));
  }

  async revokeApiKey(userId: string, keyId: string): Promise<void> {
    const key = await this.apiKeys.findOne({
      where: { id: keyId, user: { id: userId } },
    });
    if (!key) {
      throw new NotFoundException();
    }
    await this.apiKeys.remove(key);
  }
}
