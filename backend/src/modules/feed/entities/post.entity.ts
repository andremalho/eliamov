import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Activity } from '../../activities/entities/activity.entity';

export type PostType = 'workout' | 'free' | 'achievement';
export type CyclePhaseTag =
  | 'follicular'
  | 'ovulatory'
  | 'luteal'
  | 'menstrual'
  | null;

@Entity('feed_posts')
export class Post {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'uuid' })
  academyId: string;

  @Column({
    type: 'enum',
    enum: ['workout', 'free', 'achievement'],
    default: 'free',
  })
  postType: PostType;

  @Column({ type: 'text', nullable: true })
  content: string;

  @Column('text', { array: true, default: '{}' })
  mediaUrls: string[];

  @Column({ type: 'uuid', nullable: true })
  workoutId: string;

  @Column({
    type: 'enum',
    enum: ['follicular', 'ovulatory', 'luteal', 'menstrual'],
    nullable: true,
  })
  cyclePhase: CyclePhaseTag;

  @Column({ type: 'int', default: 0 })
  likesCount: number;

  @Column({ type: 'int', default: 0 })
  commentsCount: number;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'userId' })
  user?: User;

  @ManyToOne(() => Activity, { eager: false, nullable: true })
  @JoinColumn({ name: 'workoutId' })
  workout?: Activity;
}
