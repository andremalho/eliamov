import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
} from 'typeorm';

@Entity('wearable_data')
export class WearableData {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column()
  device: string;

  @Column({ type: 'timestamp' })
  recordedAt: Date;

  @Column({ type: 'int', nullable: true })
  heartRate: number;

  @Column({ type: 'float', nullable: true })
  hrv: number;

  @Column({ type: 'float', nullable: true })
  spo2: number;

  @Column({ type: 'int', nullable: true })
  calories: number;

  @Column({ type: 'int', nullable: true })
  sleepScore: number;

  @Column({ type: 'int', nullable: true })
  deepSleepMinutes: number;

  @Column({ type: 'int', nullable: true })
  remSleepMinutes: number;

  @Column({ type: 'int', nullable: true })
  readinessScore: number;

  @Column({ type: 'int', nullable: true })
  stressLevel: number;

  @Column({ type: 'int', nullable: true })
  steps: number;

  @Column({ type: 'int', nullable: true })
  systolic: number;

  @Column({ type: 'int', nullable: true })
  diastolic: number;
}
