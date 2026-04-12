import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('menopause_logs')
export class MenopauseLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'date' })
  date: Date;

  @Column({ type: 'int', nullable: true })
  hotFlashCount: number;

  @Column({ type: 'int', nullable: true })
  hotFlashIntensity: number; // 1-5

  @Column({ type: 'int', nullable: true })
  sleepQuality: number; // 1-5

  @Column({ type: 'int', nullable: true })
  moodScore: number; // 1-5

  @Column({ type: 'boolean', default: false })
  vaginalDryness: boolean;

  @Column({ type: 'boolean', default: false })
  jointPain: boolean;

  @Column({ type: 'boolean', default: false })
  nightSweats: boolean;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;
}
