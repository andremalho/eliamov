import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { Challenge } from './challenge.entity';
import { User } from '../../users/entities/user.entity';

@Entity('challenge_participants')
@Unique(['challengeId', 'userId'])
export class ChallengeParticipant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  challengeId: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'float', default: 0 })
  currentProgress: number;

  @Column({ type: 'boolean', default: false })
  notified50: boolean;

  @Column({ type: 'boolean', default: false })
  notified100: boolean;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date;

  @Column({ type: 'date', nullable: true })
  lastActivityDate: Date;

  @Column({ type: 'int', default: 0 })
  currentStreak: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Challenge, { eager: false })
  @JoinColumn({ name: 'challengeId' })
  challenge?: Challenge;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'userId' })
  user?: User;
}
