import { Entity, PrimaryGeneratedColumn, Column, Index, CreateDateColumn } from 'typeorm';

@Entity({ name: 'mental_health_patterns' })
@Index(['userId', 'createdAt'])
export class MentalHealthPatternEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ type: 'uuid' }) userId: string;
  @Column({ type: 'numeric', precision: 5, scale: 2, nullable: true }) avgPhq9Score: number | null;
  @Column({ type: 'numeric', precision: 5, scale: 2, nullable: true }) avgGad7Score: number | null;
  @Column({ type: 'numeric', precision: 5, scale: 2, nullable: true }) avgPss10Score: number | null;
  @Column({ type: 'numeric', precision: 5, scale: 2, nullable: true }) lutealPhq9Avg: number | null;
  @Column({ type: 'numeric', precision: 5, scale: 2, nullable: true }) follicularPhq9Avg: number | null;
  @Column({ type: 'numeric', precision: 5, scale: 2, nullable: true }) lutealGad7Avg: number | null;
  @Column({ type: 'numeric', precision: 5, scale: 2, nullable: true }) follicularGad7Avg: number | null;
  @Column({ type: 'boolean', default: false }) pmddSuspected: boolean;
  @Column({ type: 'boolean', default: false }) generalDepressionSuspected: boolean;
  @Column({ type: 'boolean', default: false }) generalAnxietySuspected: boolean;
  @Column({ type: 'enum', enum: ['stable', 'luteal_exacerbation', 'pmdd_pattern', 'generalized_depression', 'generalized_anxiety', 'mixed', 'needs_clinical_review'], default: 'stable' })
  overallPattern: string;
  @Column({ type: 'text' }) patientSummary: string;
  @Column({ type: 'text' }) clinicianSummary: string;
  @Column({ type: 'int' }) analyzedAssessmentCount: number;

  @Column({ type: 'enum', enum: ['improving', 'stable', 'worsening', 'insufficient_data'], default: 'insufficient_data' })
  phq9Trend: 'improving' | 'stable' | 'worsening' | 'insufficient_data';

  @Column({ type: 'enum', enum: ['improving', 'stable', 'worsening', 'insufficient_data'], default: 'insufficient_data' })
  gad7Trend: 'improving' | 'stable' | 'worsening' | 'insufficient_data';

  @Column({ type: 'numeric', precision: 5, scale: 2, nullable: true }) phq9TrendSlope: number | null;
  @Column({ type: 'numeric', precision: 5, scale: 2, nullable: true }) gad7TrendSlope: number | null;
  @Column({ type: 'numeric', precision: 5, scale: 2, nullable: true }) adherenceScore: number | null;
  @Column({ type: 'int', nullable: true }) suggestedNextAssessmentDays: number | null;
  @Column({ type: 'boolean', default: false }) clinicianAlertRequired: boolean;
  @Column({ type: 'varchar', length: 60, nullable: true }) clinicianAlertReason: string | null;

  @CreateDateColumn() createdAt: Date;
}
