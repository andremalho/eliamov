import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Unique,
} from 'typeorm';

export type ReactionType = 'heart' | 'fire' | 'muscle';

@Entity('feed_post_reactions')
@Unique(['postId', 'userId', 'reaction'])
export class PostReaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  postId: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'enum', enum: ['heart', 'fire', 'muscle'] })
  reaction: ReactionType;

  @CreateDateColumn()
  createdAt: Date;
}
