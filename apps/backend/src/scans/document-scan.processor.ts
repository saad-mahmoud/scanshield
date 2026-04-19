import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { Job } from 'bullmq';
import { Repository } from 'typeorm';
import { Document } from '../entities/document.entity';
import { Finding } from '../entities/finding.entity';
import { WorkflowStatus } from '../entities/workflow-status.enum';
import { DOCUMENT_QUEUE } from '../queue/queue.constants';
import { scanContent } from './scan-patterns';

@Processor(DOCUMENT_QUEUE)
@Injectable()
export class DocumentScanProcessor extends WorkerHost {
  private readonly logger = new Logger(DocumentScanProcessor.name);

  constructor(
    @InjectRepository(Document)
    private readonly documents: Repository<Document>,
  ) {
    super();
  }

  async process(job: Job<{ documentId: string }>): Promise<void> {
    const { documentId } = job.data;
    const maxAttempts = job.opts.attempts ?? 3;

    try {
      await this.documents.manager.transaction(async (manager) => {
        const doc = await manager.findOne(Document, { where: { id: documentId } });
        if (!doc) {
          throw new Error(`Document not found: ${documentId}`);
        }

        await manager.update(Document, { id: documentId }, { status: WorkflowStatus.Processing });

        await manager
          .createQueryBuilder()
          .delete()
          .from(Finding)
          .where('documentId = :id', { id: documentId })
          .execute();

        const matches = scanContent(doc.content);

        for (const m of matches) {
          await manager.save(
            Finding,
            manager.create(Finding, {
              document: { id: documentId },
              type: m.type,
              value: m.value,
              position: m.position,
            }),
          );
        }

        await manager.update(Document, { id: documentId }, { status: WorkflowStatus.Done });
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error(`Scan failed for ${documentId} (attempt ${job.attemptsMade + 1}/${maxAttempts}): ${message}`);

      // No more retries after this failure — mark document failed.
      if (job.attemptsMade + 1 >= maxAttempts) {
        await this.documents.update({ id: documentId }, { status: WorkflowStatus.Failed });
      }

      throw err;
    }
  }
}
