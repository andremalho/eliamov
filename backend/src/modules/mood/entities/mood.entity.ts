import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('mood_entries')
export class MoodEntry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'date' })
  date: Date;

  @Column({ type: 'int' })
  energy: number;

  @Column({ type: 'int' })
  mood: number;

  @Column({ type: 'float', nullable: true })
  sleepHours: number;

  @Column({ default: false })
  pain: boolean;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;
}
