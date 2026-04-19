import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { WorkflowStatus } from './workflow-status.enum';

@Entity('documents')
export class Document {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('text')
  content: string;

  @Column({
    type: 'enum',
    enum: WorkflowStatus,
    enumName: 'workflow_status_enum',
  })
  status: WorkflowStatus;

  @CreateDateColumn()
  createdAt: Date;
}
