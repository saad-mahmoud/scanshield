import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApiKey } from '../entities/api-key.entity';
import { User } from '../entities/user.entity';
import { ApiKeyAuthGuard } from './api-key-auth.guard';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, ApiKey])],
  controllers: [AuthController],
  providers: [AuthService, ApiKeyAuthGuard],
  exports: [ApiKeyAuthGuard],
})
export class AuthModule {}
