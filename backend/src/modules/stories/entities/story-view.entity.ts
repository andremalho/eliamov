import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Unique,
} from 'typeorm';

@Entity('story_views')
@Unique(['storyId', 'viewerId'])
export class StoryView {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  storyId: string;

  @Column({ type: 'uuid' })
  viewerId: string;

  @CreateDateColumn({ name: 'viewedAt' })
  viewedAt: Date;
}
