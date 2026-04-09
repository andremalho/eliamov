import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('appointments')
export class Appointment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'uuid' })
  professionalId: string;

  @Column({ type: 'timestamp' })
  scheduledAt: Date;

  @Column({ type: 'int', default: 30 })
  duration: number;

  @Column({
    type: 'enum',
    enum: ['in_person', 'teleconsult'],
    default: 'teleconsult',
  })
  type: 'in_person' | 'teleconsult';

  @Column({
    type: 'enum',
    enum: ['scheduled', 'confirmed', 'cancelled', 'completed'],
    default: 'scheduled',
  })
  status: 'scheduled' | 'confirmed' | 'cancelled' | 'completed';

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ nullable: true })
  meetingUrl: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
