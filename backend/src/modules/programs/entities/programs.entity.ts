import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('wellness_programs')
export class WellnessProgram {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: ['training', 'nutrition', 'wellness', 'recovery'],
    default: 'wellness',
  })
  category: 'training' | 'nutrition' | 'wellness' | 'recovery';

  @Column({ type: 'int', default: 4 })
  durationWeeks: number;

  @Column({
    type: 'enum',
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner',
  })
  level: 'beginner' | 'intermediate' | 'advanced';

  @Column({ type: 'jsonb', nullable: true })
  phases: any;

  @Column({ default: false })
  cycleAware: boolean;

  @Column({ default: false })
  isPublished: boolean;

  @Column({ type: 'uuid', nullable: true })
  creatorId: string;

  @Column({ type: 'uuid', nullable: true })
  tenantId: string;

  @CreateDateColumn()
  createdAt: Date;
}
