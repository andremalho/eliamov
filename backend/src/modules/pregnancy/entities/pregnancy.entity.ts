import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('pregnancies')
export class Pregnancy {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'date' })
  lastMenstrualDate: Date; // DUM

  @Column({ type: 'date' })
  estimatedDueDate: Date; // DPP

  @Column({ type: 'int' })
  currentWeek: number;

  @Column({
    type: 'enum',
    enum: ['active', 'delivered', 'loss'],
    default: 'active',
  })
  status: 'active' | 'delivered' | 'loss';

  @Column({ type: 'jsonb', nullable: true })
  symptoms: string[];

  @Column({ type: 'jsonb', nullable: true })
  appointments: any[];

  @Column({ type: 'float', nullable: true })
  prePregnancyWeight: number;

  @Column({ type: 'float', nullable: true })
  currentWeight: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
