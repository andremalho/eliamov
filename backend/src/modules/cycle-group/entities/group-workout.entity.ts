import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('group_workouts')
export class GroupWorkout {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  creatorId: string;

  @Column({ type: 'uuid' })
  tenantId: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: ['menstrual', 'follicular', 'ovulatory', 'luteal'],
  })
  phase: string;

  @Column('uuid', { array: true })
  participantIds: string[];

  @Column({ type: 'uuid', nullable: true })
  feedPostId: string;

  @Column({ type: 'timestamp', nullable: true })
  scheduledAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}
