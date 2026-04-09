import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('teleconsult_sessions')
export class TeleconsultSession {
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

  @Column({ nullable: true })
  meetingUrl: string;

  @Column({
    type: 'enum',
    enum: ['scheduled', 'in_progress', 'completed', 'cancelled'],
    default: 'scheduled',
  })
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'text', nullable: true })
  summary: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
