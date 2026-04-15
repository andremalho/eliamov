import {
  Entity, PrimaryGeneratedColumn, Column,
  Index, CreateDateColumn,
} from 'typeorm';

@Entity({ name: 'daily_logs' })
@Index(['userId', 'logDate'], { unique: true })
export class DailyLogEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ type: 'uuid' }) userId: string;
  @Column({ type: 'date' }) logDate: string;
  @Column({ type: 'enum', enum: ['menstrual','follicular','ovulatory','luteal','unknown'], default: 'unknown' }) cyclePhase: string;
  @Column({ type: 'int', nullable: true }) cycleDay: number | null;

  @Column({ type: 'int', nullable: true }) energyLevel: number | null;
  @Column({ type: 'int', nullable: true }) moodScore: number | null;
  @Column({ type: 'int', nullable: true }) libido: number | null;
  @Column({ type: 'int', nullable: true }) sleepQuality: number | null;
  @Column({ type: 'int', nullable: true }) sleepHours: number | null;

  @Column({ type: 'int', nullable: true }) pelvicPain: number | null;
  @Column({ type: 'int', nullable: true }) headache: number | null;
  @Column({ type: 'int', nullable: true }) bloating: number | null;
  @Column({ type: 'int', nullable: true }) breastTenderness: number | null;
  @Column({ type: 'int', nullable: true }) backPain: number | null;
  @Column({ type: 'int', nullable: true }) nausea: number | null;

  @Column({ type: 'int', nullable: true }) anxiety: number | null;
  @Column({ type: 'int', nullable: true }) irritability: number | null;
  @Column({ type: 'int', nullable: true }) concentration: number | null;

  @Column({ type: 'boolean', default: false }) spotting: boolean;
  @Column({ type: 'boolean', default: false }) hotFlashes: boolean;
  @Column({ type: 'boolean', default: false }) nightSweats: boolean;

  @Column({ type: 'text', nullable: true }) notes: string | null;
  @CreateDateColumn() createdAt: Date;
}
