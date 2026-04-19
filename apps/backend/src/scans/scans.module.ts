import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Document } from '../entities/document.entity';
import { ScanJob } from '../entities/scan-job.entity';
import { QueueModule } from '../queue/queue.module';
import { DocumentScanProcessor } from './document-scan.processor';

@Module({
  imports: [
    TypeOrmModule.forFeature([ScanJob, Document]),
    QueueModule,
  ],
  providers: [DocumentScanProcessor],
})
export class ScansModule {}
