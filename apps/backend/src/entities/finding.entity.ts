import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Document } from './document.entity';
import { FindingType } from './finding-type.enum';

@Entity('findings')
export class Finding {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Document, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'documentId' })
  document: Document;

  @Column({
    type: 'enum',
    enum: FindingType,
    enumName: 'finding_type_enum',
  })
  type: FindingType;

  @Column('text')
  value: string;

  @Column('int')
  position: number;
}
