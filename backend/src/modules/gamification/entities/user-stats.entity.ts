import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn } from 'typeorm';

@Entity('user_stats')
export class UserStats {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ type: 'uuid', unique: true }) userId: string;
  @Column({ type: 'int', default: 0 }) xp: number;
  @Column({ type: 'int', default: 1 }) level: number;
  @Column({ type: 'int', default: 0 }) currentStreak: number;
  @Column({ type: 'int', default: 0 }) longestStreak: number;
  @Column({ type: 'date', nullable: true }) lastActiveDate: Date;
  @Column({ type: 'int', default: 0 }) totalWorkouts: number;
  @Column({ type: 'int', default: 0 }) totalCheckins: number;
  @Column({ type: 'int', default: 0 }) totalPosts: number;
  @Column('text', { array: true, default: '{}' }) badges: string[];
  @UpdateDateColumn() updatedAt: Date;
}
