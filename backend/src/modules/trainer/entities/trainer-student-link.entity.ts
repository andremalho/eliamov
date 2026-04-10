import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('trainer_student_links')
export class TrainerStudentLink {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  trainerId: string;

  @Column({ type: 'uuid' })
  studentId: string;

  @Column({ type: 'uuid' })
  academyId: string;

  @Column({
    type: 'jsonb',
    default: '{"viewWorkouts":true,"viewProgress":true,"viewCycleData":false}',
  })
  permissions: {
    viewWorkouts: boolean;
    viewProgress: boolean;
    viewCycleData: boolean;
  };

  @Column({
    type: 'enum',
    enum: ['pending', 'active', 'revoked'],
    default: 'pending',
  })
  status: 'pending' | 'active' | 'revoked';

  @CreateDateColumn()
  invitedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  acceptedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  revokedAt: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'trainerId' })
  trainer?: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'studentId' })
  student?: User;
}
