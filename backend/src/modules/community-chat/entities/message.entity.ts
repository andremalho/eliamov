import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export type MediaType = 'image' | 'video' | 'none';

@Entity('community_messages')
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  communityId: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'text', nullable: true })
  content: string;

  @Column({ nullable: true })
  mediaUrl: string;

  @Column({
    type: 'enum',
    enum: ['image', 'video', 'none'],
    default: 'none',
  })
  mediaType: MediaType;

  @Column({ type: 'uuid', nullable: true })
  replyToId: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'userId' })
  user?: User;
}
