import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('family_links')
export class FamilyLink {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  companionId: string;

  @Column({ type: 'uuid' })
  memberId: string;

  @Column({
    type: 'jsonb',
    default: '{"viewWorkouts":true,"viewGoals":true,"viewFeed":false}',
  })
  permissions: {
    viewWorkouts: boolean;
    viewGoals: boolean;
    viewFeed: boolean;
  };

  @Column({
    type: 'enum',
    enum: ['pending', 'active', 'revoked'],
    default: 'pending',
  })
  status: 'pending' | 'active' | 'revoked';

  @CreateDateColumn()
  invitedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  acceptedAt: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'companionId' })
  companion?: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'memberId' })
  member?: User;
}
