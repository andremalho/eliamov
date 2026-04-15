import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ContentCategory } from '../../content/entities/content-category.entity';

export type CyclePhaseFilter = 'follicular' | 'ovulatory' | 'luteal' | 'menstrual' | 'all';

export interface RecipeIngredient {
  name: string;
  quantity: string;
  unit: string;
}

export interface RecipeMacros {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
}

@Entity('recipes')
export class Recipe {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() title: string;
  @Column({ type: 'text', nullable: true }) summary: string;
  @Column({ type: 'text' }) instructions: string;
  @Column({ type: 'jsonb', default: [] }) ingredients: RecipeIngredient[];
  @Column({ type: 'jsonb', nullable: true }) macros: RecipeMacros;
  @Column({ nullable: true }) coverImageUrl: string;
  @Column({ type: 'int', default: 0 }) prepTimeMinutes: number;
  @Column({ type: 'int', default: 0 }) cookTimeMinutes: number;
  @Column({ type: 'int', default: 1 }) servings: number;
  @Column({ type: 'text', array: true, default: '{}' }) dietaryRestrictions: string[];
  @Column({ type: 'uuid' }) authorId: string;
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
