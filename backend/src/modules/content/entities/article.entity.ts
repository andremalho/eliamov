import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ContentCategory } from './content-category.entity';

export type CyclePhaseFilter = 'follicular' | 'ovulatory' | 'luteal' | 'menstrual' | 'all';

@Entity('articles')
export class Article {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() title: string;
  @Column({ type: 'text', nullable: true }) summary: string;
  @Column({ type: 'text' }) body: string;
  @Column({ nullable: true }) coverImageUrl: string;
  @Column({ type: 'uuid' }) authorId: string;
  @Column({ type: 'uuid', nullable: true }) categoryId: string;
  @Column({ type: 'enum', enum: ['follicular', 'ovulatory', 'luteal', 'menstrual', 'all'], default: 'all' })
  cyclePhase: CyclePhaseFilter;
  @Column({ type: 'timestamp', nullable: true }) publishedAt: Date;
  @Column({ type: 'uuid', nullable: true }) academyId: string; // tenantId, null = global
  @CreateDateColumn() createdAt: Date;

  @ManyToOne(() => ContentCategory, { eager: false, nullable: true })
  @JoinColumn({ name: 'categoryId' })
  category?: ContentCategory;
}
