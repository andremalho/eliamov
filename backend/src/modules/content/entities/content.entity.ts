import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('contents')
export class Content {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  authorId: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  body: string;

  @Column({ nullable: true })
  videoUrl: string;

  @Column({ nullable: true })
  thumbnailUrl: string;

  @Column({
    type: 'enum',
    enum: ['article', 'video', 'tip'],
    default: 'article',
  })
  type: 'article' | 'video' | 'tip';

  @Column({ type: 'int', default: 0 })
  likes: number;

  @Column({ type: 'uuid', nullable: true })
  tenantId: string;

  @Column({ type: 'timestamp', nullable: true })
  publishedAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}
