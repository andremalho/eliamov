import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum ActivityType {
  RUN = 'run',
  RIDE = 'ride',
  WALK = 'walk',
  SWIM = 'swim',
  HIKE = 'hike',
  WORKOUT = 'workout',
  YOGA = 'yoga',
  OTHER = 'other',
}

@Entity('activities')
export class Activity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ nullable: true })
  provider: string;

  @Column({ nullable: true })
  externalId: string;

  @Column({ type: 'enum', enum: ActivityType, default: ActivityType.WORKOUT })
  type: ActivityType;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'timestamp' })
  startedAt: Date;

  @Column({ type: 'int' })
  duration: number;

  @Column({ type: 'float', nullable: true })
  distance: number;

  @Column({ type: 'int', nullable: true })
  calories: number;

  @Column({ type: 'int', nullable: true })
  avgHeartRate: number;

  @Column({ type: 'int', nullable: true })
  maxHeartRate: number;

  @Column({ type: 'float', nullable: true })
  elevationGain: number;

  @Column({ type: 'text', nullable: true })
  polyline: string;

  @Column({ nullable: true })
  mapImageUrl: string;

  @Column({ type: 'float', nullable: true })
  startLat: number;

  @Column({ type: 'float', nullable: true })
  startLng: number;

  @Column({ default: false })
  isPublic: boolean;

  @Column({ nullable: true, unique: true })
  shareToken: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
