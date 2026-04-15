import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('challenges')
export class Challenge {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  tenantId: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: ['workout_count', 'duration', 'streak'],
    default: 'workout_count',
  })
  goalType: 'workout_count' | 'duration' | 'streak';

  @Column({ type: 'int' })
  goalValue: number;

  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date' })
  endDate: Date;

  @Column({ default: true })
  isActive: boolean;

  @Column({
    type: 'enum',
    enum: ['individual', 'team'],
    default: 'individual',
  })
  goalMode: 'individual' | 'team';

  @Column({ type: 'uuid', nullable: true })
  creatorId: string;

  @CreateDateColumn()
  createdAt: Date;
}
