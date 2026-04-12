import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('fertility_logs')
export class FertilityLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'date' })
  date: Date;

  @Column({ type: 'float', nullable: true })
  basalTemp: number; // celsius, 2 decimals

  @Column({
    type: 'enum',
    enum: ['negative', 'low', 'high', 'peak'],
    nullable: true,
  })
  lhResult: 'negative' | 'low' | 'high' | 'peak'; // LH test strip

  @Column({
    type: 'enum',
    enum: ['dry', 'sticky', 'creamy', 'watery', 'egg_white'],
    nullable: true,
  })
  cervicalMucus: 'dry' | 'sticky' | 'creamy' | 'watery' | 'egg_white';

  @Column({ type: 'int', nullable: true })
  cervixPosition: number; // 1-3 (low/mid/high)

  @Column({ type: 'boolean', nullable: true })
  intercourse: boolean;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;
}
