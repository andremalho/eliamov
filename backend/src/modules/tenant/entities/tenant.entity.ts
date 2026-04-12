import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('tenants')
export class Tenant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column({ nullable: true })
  logoUrl: string;

  @Column({ nullable: true })
  accentColor: string; // hex color for i-dot

  @Column({ nullable: true })
  primaryColor: string;

  @Column({ nullable: true })
  slogan: string;

  @Column({ nullable: true })
  customDomain: string;

  @Column({ nullable: true })
  domain: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
