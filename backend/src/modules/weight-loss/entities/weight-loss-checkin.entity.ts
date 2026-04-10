import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('weight_loss_checkins')
export class WeightLossCheckin {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ type: 'uuid' }) assessmentId: string;
  @Column({ type: 'uuid' }) userId: string;
  @Column({ type: 'int' }) weekNumber: number;
  @Column({ type: 'decimal', precision: 5, scale: 2 }) weightKg: number;
  @Column({ type: 'int' }) adherencePercent: number;
  @Column({ type: 'text', nullable: true }) notes: string;
  @Column({ type: 'decimal', precision: 5, scale: 2 }) expectedWeightKg: number;
  @Column({ type: 'decimal', precision: 4, scale: 2 }) deltaFromExpected: number;
  @CreateDateColumn() createdAt: Date;
}
