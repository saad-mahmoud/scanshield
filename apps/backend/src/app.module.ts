import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApiKeysAliasController } from './api-keys-alias.controller';
import { AuthModule } from './auth/auth.module';
import { createTypeOrmOptions } from './database/typeorm.config';
import { ScansModule } from './scans/scans.module';

@Module({
  controllers: [ApiKeysAliasController],
  imports: [
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST ?? 'localhost',
        port: Number(process.env.REDIS_PORT ?? 6379),
      },
    }),
    TypeOrmModule.forRootAsync({
      useFactory: () => createTypeOrmOptions(),
    }),
    AuthModule,
    ScansModule,
  ],
})
export class AppModule {}
