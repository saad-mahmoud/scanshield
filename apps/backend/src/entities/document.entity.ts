import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { RiskLevel } from './risk-level.enum';
import { User } from './user.entity';
import { WorkflowStatus } from './workflow-status.enum';

@Entity('documents')
export class Document {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

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

  @Column({
    type: 'enum',
    enum: RiskLevel,
    enumName: 'risk_level_enum',
    default: RiskLevel.Clean,
  })
  riskLevel: RiskLevel;

  @CreateDateColumn()
  createdAt: Date;
}
