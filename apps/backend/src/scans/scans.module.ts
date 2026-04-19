import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { DocumentsModule } from '../documents/documents.module';
import { Document } from '../entities/document.entity';
import { Finding } from '../entities/finding.entity';
import { ScanJob } from '../entities/scan-job.entity';
import { QueueModule } from '../queue/queue.module';
import { DocumentScanProcessor } from './document-scan.processor';
import { ScansController } from './scans.controller';
import { ScansService } from './scans.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ScanJob, Document, Finding]),
    QueueModule,
    DocumentsModule,
    AuthModule,
  ],
  controllers: [ScansController],
  providers: [DocumentScanProcessor, ScansService],
})
export class ScansModule {}
