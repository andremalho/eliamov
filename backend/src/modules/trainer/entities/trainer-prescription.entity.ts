import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('trainer_prescriptions')
export class TrainerPrescription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  trainerId: string;

  @Column({ type: 'uuid' })
  studentId: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'jsonb', nullable: true })
  workoutPlan: any;

  @Column('date', { array: true, nullable: true })
  scheduledDates: string[];

  @Column({
    type: 'enum',
    enum: ['pending', 'done', 'skipped'],
    default: 'pending',
  })
  status: 'pending' | 'done' | 'skipped';

  @Column({ type: 'uuid', nullable: true })
  completedActivityId: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'trainerId' })
  trainer?: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'studentId' })
  student?: User;
}
