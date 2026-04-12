import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('lab_results')
export class LabResult {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'date' })
  examDate: Date;

  @Column({ nullable: true })
  labName: string;

  @Column({ nullable: true })
  reportFileUrl: string;

  @Column({ type: 'jsonb', nullable: true })
  values: Record<
    string,
    {
      value: number;
      unit: string;
      refMin?: number;
      refMax?: number;
      status?: 'normal' | 'low' | 'high' | 'critical';
    }
  >;

  @Column({ type: 'text', nullable: true })
  aiAnalysis: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;
}
