import { Entity, PrimaryGeneratedColumn, Column, Index, CreateDateColumn } from 'typeorm';

@Entity({ name: 'mental_health_assessments' })
@Index(['userId', 'createdAt'])
@Index(['userId', 'assessmentType', 'createdAt'])
export class MentalHealthAssessmentEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'enum', enum: ['phq9', 'gad7', 'pss10', 'drsp', 'mrs'] })
  assessmentType: 'phq9' | 'gad7' | 'pss10' | 'drsp' | 'mrs';

  @Column({ type: 'jsonb' })
  answers: Record<string, number>;

  @Column({ type: 'int' })
  totalScore: number;

  @Column({ type: 'varchar', length: 40 })
  severityLevel: string;

  @Column({ type: 'enum', enum: ['menstrual', 'follicular', 'ovulatory', 'luteal', 'unknown'], default: 'unknown' })
  cyclePhaseAtAssessment: 'menstrual' | 'follicular' | 'ovulatory' | 'luteal' | 'unknown';

  @Column({ type: 'int', nullable: true })
  cycleDay: number | null;

  @Column({ type: 'text', nullable: true })
  clinicalNote: string | null;

  @Column({ type: 'jsonb', default: () => "'{}'::jsonb" })
  meta: Record<string, unknown>;

  @Column({ type: 'boolean', default: false })
  criticalAlertTriggered: boolean;

  @Column({ type: 'varchar', length: 20, nullable: true })
  criticalAlertReason: string | null;

  @CreateDateColumn()
  createdAt: Date;
}
