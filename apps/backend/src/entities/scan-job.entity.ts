import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Document } from './document.entity';
import { WorkflowStatus } from './workflow-status.enum';

@Entity('scan_jobs')
export class ScanJob {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Document, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'documentId' })
  document: Document;

  @Column({
    type: 'enum',
    enum: WorkflowStatus,
    enumName: 'workflow_status_enum',
  })
  status: WorkflowStatus;

  @Column('int', { default: 0 })
  attempts: number;
}
