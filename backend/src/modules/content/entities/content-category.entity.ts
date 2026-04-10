import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('content_categories')
export class ContentCategory {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ unique: true }) name: string;
  @Column({ unique: true }) slug: string; // 'ciclo', 'treino', 'nutricao', 'saude-mental'
  @CreateDateColumn() createdAt: Date;
}
