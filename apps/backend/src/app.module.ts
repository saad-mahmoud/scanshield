import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { createTypeOrmOptions } from './database/typeorm.config';
import { DocumentsModule } from './documents/documents.module';
import { ScansModule } from './scans/scans.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    BullModule.forRootAsync({
      useFactory: () => ({
        connection: {
          host: process.env.REDIS_HOST ?? 'localhost',
          port: Number(process.env.REDIS_PORT ?? 6379),
        },
      }),
    }),
    TypeOrmModule.forRootAsync({
      useFactory: () => createTypeOrmOptions(),
    }),
    AuthModule,
    UsersModule,
    DocumentsModule,
    ScansModule,
  ],
})
export class AppModule {}
