import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('stories')
export class Story {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'uuid' })
  academyId: string;

  @Column()
  mediaUrl: string;

  @Column({ type: 'enum', enum: ['image', 'video'], default: 'image' })
  mediaType: 'image' | 'video';

  @Column({ nullable: true })
  thumbnailUrl: string;

  @Column({ nullable: true })
  mediaKey: string; // R2 object key for cleanup

  @Column({
    type: 'enum',
    enum: ['follicular', 'ovulatory', 'luteal', 'menstrual'],
    nullable: true,
  })
  cyclePhase: string;

  @Column({ nullable: true })
  moodTag: string;

  @Column({ type: 'int', nullable: true })
  duration: number; // seconds for video

  @Column({ type: 'int', default: 0 })
  viewsCount: number;

  @Column({ type: 'timestamp' })
  expiresAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  deletedAt: Date;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'userId' })
  user?: User;
}
