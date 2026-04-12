import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('pregnancy_weeks')
export class PregnancyWeek {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  pregnancyId: string;

  @Column({ type: 'int' })
  weekNumber: number;

  @Column({ type: 'float', nullable: true })
  weightKg: number;

  @Column({ type: 'jsonb', nullable: true })
  symptoms: string[];

  @Column({ type: 'int', nullable: true })
  moodScore: number; // 1-5

  @Column({ type: 'int', nullable: true })
  energyScore: number; // 1-5

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;
}
