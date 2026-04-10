import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('community_invites')
export class CommunityInvite {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  communityId: string;

  @Column({ unique: true })
  code: string;

  @Column({ type: 'timestamp', nullable: true })
  expiresAt: Date;

  @Column({ type: 'int', default: 0 })
  usesCount: number;

  @Column({ type: 'int', nullable: true })
  maxUses: number;

  @CreateDateColumn()
  createdAt: Date;
}
