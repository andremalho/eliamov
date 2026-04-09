import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('nutrition_goals')
export class NutritionGoal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', unique: true })
  userId: string;

  @Column({ type: 'int' })
  dailyCalories: number;

  @Column({ type: 'float', nullable: true })
  dailyProtein: number;

  @Column({ type: 'float', nullable: true })
  dailyCarbs: number;

  @Column({ type: 'float', nullable: true })
  dailyFat: number;

  @Column({ type: 'float', nullable: true })
  dailyWater: number;

  @Column({
    type: 'enum',
    enum: ['weight_loss', 'maintenance', 'muscle_gain'],
    default: 'maintenance',
  })
  goal: 'weight_loss' | 'maintenance' | 'muscle_gain';

  @UpdateDateColumn()
  updatedAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}
