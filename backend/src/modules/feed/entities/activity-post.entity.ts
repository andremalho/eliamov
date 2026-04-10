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

@Entity('activity_posts')
export class ActivityPost {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'uuid' })
  tenantId: string;

  @Column({ type: 'uuid', nullable: true })
  activityId: string;

  @Column({ type: 'text', nullable: true })
  content: string;

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
  @JoinColumn({ name: 'activityId' })
  activity?: Activity;
}
