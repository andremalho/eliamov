import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('menopause_profiles')
export class MenopauseProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', unique: true })
  userId: string;

  @Column({
    type: 'enum',
    enum: ['perimenopause', 'menopause', 'postmenopause'],
    default: 'perimenopause',
  })
  stage: 'perimenopause' | 'menopause' | 'postmenopause';

  @Column({ type: 'int', nullable: true })
  ageAtOnset: number;

  @Column({ type: 'boolean', default: false })
  onHRT: boolean; // hormone replacement therapy

  @Column({ type: 'jsonb', nullable: true })
  symptoms: string[];

  @Column({ type: 'int', nullable: true })
  mrsScore: number; // Menopause Rating Scale

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
