import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('lab_exams')
export class LabExam {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column()
  examType: string;

  @Column({ type: 'date' })
  examDate: Date;

  @Column({ type: 'date', nullable: true })
  resultDate: Date;

  @Column({ nullable: true })
  fileUrl: string;

  @Column({
    type: 'enum',
    enum: ['pending', 'completed', 'reviewed'],
    default: 'pending',
  })
  status: 'pending' | 'completed' | 'reviewed';

  @Column({ type: 'text', nullable: true })
  aiAnalysis: string;

  @Column({
    type: 'enum',
    enum: ['normal', 'attention', 'critical'],
    default: 'normal',
  })
  alertLevel: 'normal' | 'attention' | 'critical';

  @CreateDateColumn()
  createdAt: Date;
}
