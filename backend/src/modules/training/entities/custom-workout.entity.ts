import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('custom_workouts')
export class CustomWorkout {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() name: string;
  @Column({ type: 'enum', enum: ['menstrual', 'follicular', 'ovulatory', 'luteal'], default: 'follicular' })
  phase: string;
  @Column({ default: 'strength' }) type: string;
  @Column({ type: 'int', default: 30 }) duration: number;
  @Column({ type: 'enum', enum: ['low', 'moderate', 'high', 'max'], default: 'moderate' })
  intensity: string;
  @Column({ default: '5-7' }) rpe: string;
  @Column({ type: 'jsonb', default: [] })
  exercises: { name: string; sets?: number; reps?: string; duration?: string; rest?: string; notes?: string }[];
  @Column({ type: 'text', nullable: true }) description: string;
  @Column({ nullable: true }) reference: string;
  @Column({ type: 'uuid', nullable: true }) academyId: string;
  @Column({ type: 'uuid' }) createdBy: string;
  @CreateDateColumn() createdAt: Date;
}
