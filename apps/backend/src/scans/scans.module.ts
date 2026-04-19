import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { Document } from '../entities/document.entity';
import { Finding } from '../entities/finding.entity';
import { DOCUMENT_QUEUE } from '../queue/queue.constants';
import { DocumentScanProcessor } from './document-scan.processor';
import { ScansController } from './scans.controller';
import { ScansService } from './scans.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Document, Finding]),
    BullModule.registerQueue({
      name: DOCUMENT_QUEUE,
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
      },
    }),
    AuthModule,
  ],
  controllers: [ScansController],
  providers: [DocumentScanProcessor, ScansService],
})
export class ScansModule {}
