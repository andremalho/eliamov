import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export interface ExerciseLog {
  name: string;
  sets: { reps?: number; weight?: number; duration?: number; completed: boolean }[];
}

@Entity('workout_logs')
export class WorkoutLog {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ type: 'uuid' }) userId: string;
  @Column() workoutName: string;
  @Column() phase: string;
  @Column({ type: 'int' }) durationSeconds: number;
  @Column({ type: 'int', nullable: true }) rpe: number;
  @Column({ type: 'jsonb', default: [] }) exercises: ExerciseLog[];
  @Column({ type: 'text', nullable: true }) notes: string;
  @CreateDateColumn() completedAt: Date;
}
