import { Entity, PrimaryGeneratedColumn, Column, Index, CreateDateColumn } from 'typeorm';

@Entity({ name: 'hormonal_insights' })
@Index(['userId', 'createdAt'])
export class HormonalInsightEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ type: 'uuid' }) userId: string;
  @Column({ type: 'int' }) analyzedCycleCount: number;
  @Column({ type: 'numeric', precision: 6, scale: 2, nullable: true }) avgCycleLength: number | null;
  @Column({ type: 'numeric', precision: 6, scale: 2, nullable: true }) cycleVariability: number | null;
  @Column({ type: 'numeric', precision: 6, scale: 2, nullable: true }) cycleTrendSlope: number | null;
  @Column({ type: 'numeric', precision: 5, scale: 2, default: 0 }) aubRiskScore: number;
  @Column({ type: 'numeric', precision: 5, scale: 2, default: 0 }) perimenopauseScore: number;
  @Column({ type: 'varchar', length: 30 }) aubRiskLevel: 'low' | 'moderate' | 'high';
  @Column({ type: 'varchar', length: 60 }) hormonalStatus: 'stable' | 'possible_anovulatory_pattern' | 'possible_perimenopause_transition' | 'needs_clinical_review';
  @Column({ type: 'text' }) patientSummary: string;
  @Column({ type: 'text' }) clinicianSummary: string;
  @Column({ type: 'jsonb', default: () => "'{}'::jsonb" }) rawMetrics: Record<string, unknown>;
  @CreateDateColumn() createdAt: Date;
}
