import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('community_posts')
export class CommunityPost {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  authorId: string;

  @Column()
  title: string;

  @Column({ type: 'text' })
  body: string;

  @Column({
    type: 'enum',
    enum: ['post', 'question', 'tip'],
    default: 'post',
  })
  type: 'post' | 'question' | 'tip';

  @Column({ type: 'uuid', nullable: true })
  parentId: string;

  @Column({ type: 'int', default: 0 })
  likes: number;

  @Column({ type: 'int', default: 0 })
  replies: number;

  @Column({ type: 'uuid', nullable: true })
  tenantId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
