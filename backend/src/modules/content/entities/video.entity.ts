import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ContentCategory } from './content-category.entity';
import { CyclePhaseFilter } from './article.entity';

@Entity('videos')
export class Video {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() title: string;
  @Column({ type: 'text', nullable: true }) description: string;
  @Column() videoUrl: string;
  @Column({ nullable: true }) thumbnailUrl: string;
  @Column({ type: 'int', default: 0 }) durationSeconds: number;
  @Column({ type: 'uuid', nullable: true }) categoryId: string;
  @Column({ type: 'enum', enum: ['follicular', 'ovulatory', 'luteal', 'menstrual', 'all'], default: 'all' })
  cyclePhase: CyclePhaseFilter;
  @Column({ type: 'timestamp', nullable: true }) publishedAt: Date;
  @Column({ type: 'uuid', nullable: true }) academyId: string;
  @CreateDateColumn() createdAt: Date;

  @ManyToOne(() => ContentCategory, { eager: false, nullable: true })
  @JoinColumn({ name: 'categoryId' })
  category?: ContentCategory;
}
