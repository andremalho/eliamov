import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('weight_entries')
export class WeightEntry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'date' })
  date: Date;

  @Column({ type: 'float' })
  weight: number;

  @Column({ type: 'float', nullable: true })
  waist: number;

  @Column({ type: 'float', nullable: true })
  hip: number;

  @Column({ type: 'float', nullable: true })
  bodyFat: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;
}
