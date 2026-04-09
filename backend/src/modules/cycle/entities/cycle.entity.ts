import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('cycle_entries')
export class CycleEntry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date', nullable: true })
  endDate: Date;

  @Column({ type: 'int', nullable: true })
  cycleLength: number;

  @Column({ type: 'int', nullable: true })
  periodLength: number;

  @Column({
    type: 'enum',
    enum: ['menstrual', 'follicular', 'ovulatory', 'luteal'],
    nullable: true,
  })
  phase: 'menstrual' | 'follicular' | 'ovulatory' | 'luteal';

  @Column({ type: 'date', nullable: true })
  predictedNextStart: Date;

  @CreateDateColumn()
  createdAt: Date;
}
