import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('weight_loss_assessments')
export class WeightLossAssessment {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ type: 'uuid' }) userId: string;
  @Column({ type: 'uuid', nullable: true }) tenantId: string;
  @Column({ type: 'int' }) age: number;
  @Column({ type: 'enum', enum: ['M', 'F'] }) biologicalSex: 'M' | 'F';
  @Column({ type: 'decimal', precision: 5, scale: 2 }) weightKg: number;
  @Column({ type: 'decimal', precision: 5, scale: 2 }) heightCm: number;
  @Column({ type: 'decimal', precision: 4, scale: 3 }) activityFactor: number;
  @Column({ type: 'decimal', precision: 5, scale: 2 }) targetWeightKg: number;
  @Column({ type: 'int' }) deadlineMonths: number;
  @Column({ type: 'enum', enum: ['none', 'dm2', 'hypertension', 'metabolic_syndrome', 'pcos'], default: 'none' })
  comorbidity: 'none' | 'dm2' | 'hypertension' | 'metabolic_syndrome' | 'pcos';
  @Column({ type: 'decimal', precision: 5, scale: 2 }) bmi: number;
  @Column({ type: 'decimal', precision: 7, scale: 2 }) tmb: number;
  @Column({ type: 'decimal', precision: 7, scale: 2 }) tdee: number;
  @Column({ type: 'int' }) dailyCalorieGoal: number;
  @Column({ type: 'int' }) caloricDeficit: number;
  @Column({ type: 'decimal', precision: 5, scale: 1 }) proteinG: number;
  @Column({ type: 'decimal', precision: 5, scale: 1 }) carbsG: number;
  @Column({ type: 'decimal', precision: 5, scale: 1 }) fatsG: number;
  @Column({ type: 'decimal', precision: 4, scale: 2 }) estimatedWeeklyLossKg: number;
  @Column({ type: 'int' }) estimatedWeeksToGoal: number;
  @Column({ type: 'jsonb', nullable: true }) weeklyPlan: any;
  @Column({ type: 'jsonb', nullable: true }) comorbidityProtocol: any;
  @Column({ type: 'uuid', nullable: true }) wellnessProgramId: string;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
