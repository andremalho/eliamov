import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { WellnessProgram } from './programs.entity';

@Entity('program_enrollments')
export class ProgramEnrollment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'uuid' })
  programId: string;

  @ManyToOne(() => WellnessProgram, { eager: true })
  @JoinColumn({ name: 'programId' })
  program: WellnessProgram;

  @Column({ type: 'timestamp', default: () => 'now()' })
  startedAt: Date;

  @Column({ type: 'int', default: 1 })
  currentWeek: number;

  @Column({
    type: 'enum',
    enum: ['active', 'paused', 'completed', 'abandoned'],
    default: 'active',
  })
  status: 'active' | 'paused' | 'completed' | 'abandoned';

  @Column({ type: 'jsonb', nullable: true })
  progress: Record<string, any> | null;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
