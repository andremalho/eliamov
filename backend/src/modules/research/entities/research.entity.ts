import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('research_data')
export class ResearchData {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  ageGroup: string;

  @Column({ type: 'float', nullable: true })
  bmi: number;

  @Column({ nullable: true })
  fitnessGoal: string;

  @Column('simple-array', { nullable: true })
  healthConditions: string[];

  @Column({ type: 'jsonb', nullable: true })
  cycleData: any;

  @Column({ type: 'jsonb', nullable: true })
  moodData: any;

  @Column({ type: 'jsonb', nullable: true })
  trainingData: any;

  @Column({ type: 'jsonb', nullable: true })
  wearableData: any;

  @Column({ type: 'jsonb', nullable: true })
  glucoseData: any;

  @Column({ type: 'jsonb', nullable: true })
  bpData: any;

  @Column({ nullable: true })
  region: string;

  @CreateDateColumn()
  createdAt: Date;
}
