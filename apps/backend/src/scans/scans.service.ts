import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { InjectRepository } from '@nestjs/typeorm';
import type { Queue } from 'bullmq';
import { Repository } from 'typeorm';
import { Document } from '../entities/document.entity';
import { Finding } from '../entities/finding.entity';
import { RiskLevel } from '../entities/risk-level.enum';
import { WorkflowStatus } from '../entities/workflow-status.enum';
import { DOCUMENT_QUEUE } from '../queue/queue.constants';

@Injectable()
export class ScansService {
  constructor(
    @InjectRepository(Document)
    private readonly documents: Repository<Document>,
    @InjectRepository(Finding)
    private readonly findings: Repository<Finding>,
    @InjectQueue(DOCUMENT_QUEUE)
    private readonly documentQueue: Queue,
  ) {}

  async list(userId: string, status?: WorkflowStatus): Promise<
    Array<{
      id: string;
      name: string;
      status: WorkflowStatus;
      riskLevel: RiskLevel;
      createdAt: string;
      findingsCount: number;
    }>
  > {
    const qb = this.documents
      .createQueryBuilder('document')
      .where('document.userId = :userId', { userId })
      .orderBy('document.createdAt', 'DESC');

    if (status) {
      qb.andWhere('document.status = :status', { status });
    }

    const rows = await qb.getMany();

    const out: Array<{
      id: string;
      name: string;
      status: WorkflowStatus;
      riskLevel: RiskLevel;
      createdAt: string;
      findingsCount: number;
    }> = [];

    for (const d of rows) {
      let findingsCount = 0;
      if (d.status === WorkflowStatus.Completed) {
        findingsCount = await this.findings.count({
          where: { document: { id: d.id } },
        });
      }
      out.push({
        id: d.id,
        name: d.name,
        status: d.status,
        riskLevel: d.riskLevel ?? RiskLevel.Clean,
        createdAt: d.createdAt.toISOString(),
        findingsCount,
      });
    }
    return out;
  }

  async create(
    userId: string,
    input: { name: string; content: string },
  ): Promise<{ documentId: string; id: string; status: WorkflowStatus }> {
    const doc = this.documents.create({
      name: input.name,
      content: input.content,
      status: WorkflowStatus.Queued,
      user: { id: userId },
    });
    await this.documents.save(doc);

    await this.documentQueue.add('scan', { documentId: doc.id });

    return {
      documentId: doc.id,
      id: doc.id,
      status: doc.status,
    };
  }

  async getScan(
    id: string,
    userId: string,
  ): Promise<{
    id: string;
    name: string;
    content: string;
    status: WorkflowStatus;
    riskLevel: RiskLevel;
    findings?: Array<{ type: string; value: string; position: number }>;
  }> {
    const doc = await this.documents.findOne({
      where: { id, user: { id: userId } },
    });

    if (!doc) {
      throw new NotFoundException();
    }

    const base = {
      id: doc.id,
      name: doc.name,
      content: doc.content,
      status: doc.status,
      riskLevel: doc.riskLevel ?? RiskLevel.Clean,
    };

    if (doc.status !== WorkflowStatus.Completed) {
      return base;
    }

    const rows = await this.findings.find({
      where: { document: { id: doc.id } },
      order: { position: 'ASC' },
    });

    return {
      ...base,
      findings: rows.map((f) => ({
        type: f.type,
        value: f.value,
        position: f.position,
      })),
    };
  }
}
