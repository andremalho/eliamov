import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
} from 'typeorm';

@Entity('consent_records')
export class ConsentRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({
    type: 'enum',
    enum: ['data_sharing', 'eliahealth_integration', 'research', 'marketing'],
  })
  consentType: 'data_sharing' | 'eliahealth_integration' | 'research' | 'marketing';

  @Column({ default: false })
  granted: boolean;

  @Column({ type: 'timestamp', nullable: true })
  grantedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  revokedAt: Date;

  @Column({ nullable: true })
  ipAddress: string;
}
