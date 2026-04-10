import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('calendar_connections')
export class CalendarConnection {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({
    type: 'enum',
    enum: ['google', 'microsoft', 'ical'],
    default: 'google',
  })
  provider: 'google' | 'microsoft' | 'ical';

  @Column({ nullable: true })
  accessToken: string;

  @Column({ nullable: true })
  refreshToken: string;

  @Column({ type: 'timestamp', nullable: true })
  expiresAt: Date;

  @Column({ nullable: true })
  calendarId: string;

  @Column({ nullable: true })
  syncToken: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: true })
  syncWorkouts: boolean;

  @Column({ default: true })
  syncAppointments: boolean;

  @Column({ default: false })
  syncCyclePredictions: boolean;

  @Column({ default: true })
  syncChallenges: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
