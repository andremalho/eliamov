import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('performance_logs')
export class PerformanceLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'date' })
  date: Date;

  @Column({ type: 'float', nullable: true })
  hrv: number; // ms

  @Column({ type: 'float', nullable: true })
  restingHR: number; // bpm

  @Column({ type: 'float', nullable: true })
  basalTemp: number; // celsius

  @Column({ type: 'int', nullable: true })
  sleepScore: number; // 0-100

  @Column({ type: 'int', nullable: true })
  sleepHours: number; // hours x10

  @Column({ type: 'int', nullable: true })
  rpe: number; // 1-10

  @Column({ type: 'int', nullable: true })
  trainingLoad: number; // sRPE x duration

  @Column({ type: 'int', nullable: true })
  fatigueScore: number; // POMS 1-5

  @Column({ type: 'int', nullable: true })
  vigorScore: number; // POMS 1-5

  @Column({ type: 'int', nullable: true })
  moodScore: number; // 1-5

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;
}
