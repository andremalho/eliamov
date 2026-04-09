import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('nutrition_entries')
export class NutritionEntry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'date' })
  date: Date;

  @Column({
    type: 'enum',
    enum: ['breakfast', 'lunch', 'dinner', 'snack'],
    default: 'lunch',
  })
  meal: 'breakfast' | 'lunch' | 'dinner' | 'snack';

  @Column()
  description: string;

  @Column({ type: 'int', nullable: true })
  calories: number;

  @Column({ type: 'float', nullable: true })
  protein: number;

  @Column({ type: 'float', nullable: true })
  carbs: number;

  @Column({ type: 'float', nullable: true })
  fat: number;

  @Column({ type: 'float', nullable: true })
  fiber: number;

  @Column({ type: 'float', nullable: true })
  water: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;
}
