import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
} from 'typeorm';

@Entity('glucose_entries')
export class GlucoseEntry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'timestamp' })
  measuredAt: Date;

  @Column({ type: 'int' })
  value: number;

  @Column({
    type: 'enum',
    enum: ['fasting', 'post_meal_1h', 'post_meal_2h', 'bedtime', 'exercise_before', 'exercise_after'],
  })
  context:
    | 'fasting'
    | 'post_meal_1h'
    | 'post_meal_2h'
    | 'bedtime'
    | 'exercise_before'
    | 'exercise_after';

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ default: false })
  alertTriggered: boolean;
}
