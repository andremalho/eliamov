import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('cycle_entries')
export class CycleEntry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date', nullable: true })
  endDate: Date;

  @Column({ type: 'int', nullable: true })
  cycleLength: number;

  @Column({ type: 'int', nullable: true })
  periodLength: number;

  @Column({
    type: 'enum',
    enum: ['menstrual', 'follicular', 'ovulatory', 'luteal'],
    nullable: true,
  })
  phase: 'menstrual' | 'follicular' | 'ovulatory' | 'luteal';

  @Column({ type: 'date', nullable: true })
  predictedNextStart: Date;

  @Column({ type: 'boolean', default: true })
  menstruates: boolean;

  @Column({
    type: 'enum',
    enum: ['hormonal_iud', 'continuous_pill', 'surgery', 'other', null],
    nullable: true,
  })
  amenorrheaReason: 'hormonal_iud' | 'continuous_pill' | 'surgery' | 'other' | null;

  @Column({
    type: 'enum',
    enum: ['mirena', 'kyleena', null],
    nullable: true,
  })
  iudType: 'mirena' | 'kyleena' | null;

  @Column({ type: 'varchar', length: 120, nullable: true })
  continuousPillName: string | null;

  @Column({
    type: 'enum',
    enum: ['subtotal_hysterectomy', 'total_hysterectomy', 'total_hysterectomy_oophorectomy', 'other_surgery', null],
    nullable: true,
  })
  surgeryType: 'subtotal_hysterectomy' | 'total_hysterectomy' | 'total_hysterectomy_oophorectomy' | 'other_surgery' | null;

  @Column({ type: 'varchar', length: 200, nullable: true })
  surgeryOtherDescription: string | null;

  @Column({ type: 'varchar', length: 200, nullable: true })
  amenorrheaOtherDescription: string | null;

  @CreateDateColumn()
  createdAt: Date;
}
