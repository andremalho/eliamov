import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Unique } from 'typeorm';

@Entity('user_saved_content')
@Unique(['userId', 'contentType', 'contentId'])
export class UserSavedContent {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ type: 'uuid' }) userId: string;
  @Column({ type: 'enum', enum: ['article', 'video'] }) contentType: 'article' | 'video';
  @Column({ type: 'uuid' }) contentId: string;
  @CreateDateColumn({ name: 'savedAt' }) savedAt: Date;
}
