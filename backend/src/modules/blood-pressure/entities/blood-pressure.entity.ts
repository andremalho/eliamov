import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
} from 'typeorm';

@Entity('blood_pressure_entries')
export class BloodPressureEntry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'timestamp' })
  measuredAt: Date;

  @Column({ type: 'int' })
  systolic: number;

  @Column({ type: 'int' })
  diastolic: number;

  @Column({ type: 'int', nullable: true })
  heartRate: number;

  @Column({
    type: 'enum',
    enum: ['rest', 'post_exercise', 'morning', 'evening'],
  })
  context: 'rest' | 'post_exercise' | 'morning' | 'evening';

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ default: false })
  alertTriggered: boolean;
}
