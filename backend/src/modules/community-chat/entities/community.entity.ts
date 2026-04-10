import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

export type CommunityType = 'private' | 'public' | 'cycle_auto';

@Entity('communities')
export class Community {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  academyId: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true })
  coverImageUrl: string;

  @Column({
    type: 'enum',
    enum: ['private', 'public', 'cycle_auto'],
    default: 'public',
  })
  type: CommunityType;

  @Column({ type: 'uuid' })
  createdBy: string;

  @Column({ type: 'int', default: 0 })
  membersCount: number;

  @Column({ nullable: true })
  cyclePhase: string; // for cycle_auto type

  @CreateDateColumn()
  createdAt: Date;
}
