import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('mental_health_assessments')
export class MentalHealthAssessment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'date' })
  date: Date;

  @Column({ type: 'enum', enum: ['phq9', 'gad7'] })
  type: 'phq9' | 'gad7';

  @Column('int', { array: true })
  answers: number[]; // 0-3 per question

  @Column({ type: 'int' })
  totalScore: number;

  @Column({ nullable: true })
  severity: string;

  @CreateDateColumn()
  createdAt: Date;
}
