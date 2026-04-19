import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { Queue } from 'bullmq';
import { Repository } from 'typeorm';
import { Document } from '../entities/document.entity';
import { WorkflowStatus } from '../entities/workflow-status.enum';
import { DOCUMENT_QUEUE } from '../queue/queue.constants';
import type { CreateDocumentDto } from './dto/create-document.dto';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(Document)
    private readonly documents: Repository<Document>,
    @InjectQueue(DOCUMENT_QUEUE)
    private readonly documentQueue: Queue,
  ) {}

  async create(dto: CreateDocumentDto): Promise<{ documentId: string; status: WorkflowStatus }> {
    const doc = this.documents.create({
      name: dto.name,
      content: dto.content,
      status: WorkflowStatus.Queued,
    });
    await this.documents.save(doc);

    await this.documentQueue.add('scan', { documentId: doc.id }, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 2000 },
    });

    return { documentId: doc.id, status: doc.status };
  }
}
