import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('training_plans')
export class TrainingPlan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'date' })
  weekStart: Date;

  @Column({ type: 'date' })
  weekEnd: Date;

  @Column({ default: false })
  generatedByAi: boolean;

  @Column({ nullable: true })
  cyclePhase: string;

  @Column({ type: 'int', nullable: true })
  moodScore: number;

  @Column({ type: 'int', nullable: true })
  wearableReadiness: number;

  @Column({ type: 'jsonb', nullable: true })
  planJson: any;

  @CreateDateColumn()
  createdAt: Date;
}
