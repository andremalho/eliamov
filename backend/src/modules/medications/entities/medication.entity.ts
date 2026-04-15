import {
  Entity, PrimaryGeneratedColumn, Column,
  Index, CreateDateColumn, UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'medications' })
@Index(['userId', 'active'])
@Index(['userId', 'startDate'])
export class MedicationEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ type: 'uuid' }) userId: string;
  @Column({ type: 'varchar', length: 150 }) name: string;
  @Column({ type: 'enum', enum: ['hormonal_contraceptive', 'hormonal_iud', 'thyroid', 'antidepressant', 'anxiolytic', 'progesterone', 'other'] })
  category: 'hormonal_contraceptive' | 'hormonal_iud' | 'thyroid' | 'antidepressant' | 'anxiolytic' | 'progesterone' | 'other';
  @Column({ type: 'varchar', length: 80, nullable: true }) dose: string | null;
  @Column({ type: 'varchar', length: 80, nullable: true }) frequency: string | null;
  @Column({ type: 'date' }) startDate: string;
  @Column({ type: 'date', nullable: true }) endDate: string | null;
  @Column({ type: 'boolean', default: true }) active: boolean;
  @Column({ type: 'text', nullable: true }) notes: string | null;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
