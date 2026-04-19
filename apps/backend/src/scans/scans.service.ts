import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document } from '../entities/document.entity';
import { Finding } from '../entities/finding.entity';
import { WorkflowStatus } from '../entities/workflow-status.enum';

@Injectable()
export class ScansService {
  constructor(
    @InjectRepository(Document)
    private readonly documents: Repository<Document>,
    @InjectRepository(Finding)
    private readonly findings: Repository<Finding>,
  ) {}

  async list(userId: string): Promise<
    Array<{
      id: string;
      name: string;
      status: WorkflowStatus;
      createdAt: string;
    }>
  > {
    const rows = await this.documents.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
    });
    return rows.map((d) => ({
      id: d.id,
      name: d.name,
      status: d.status,
      createdAt: d.createdAt.toISOString(),
    }));
  }

  async getScan(
    id: string,
    userId: string,
  ): Promise<{
    id: string;
    name: string;
    status: WorkflowStatus;
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
      status: doc.status,
    };

    if (doc.status !== WorkflowStatus.Done) {
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
