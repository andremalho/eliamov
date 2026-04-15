import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid') id: string;

  @Index()
  @Column({ type: 'uuid', nullable: true }) userId: string;

  @Column({ nullable: true }) userName: string;

  @Column() action: string;

  @Column() resource: string;

  @Column({ type: 'uuid', nullable: true }) resourceId: string;

  @Column({ nullable: true }) details: string;

  @Column({ nullable: true }) method: string;

  @Column({ nullable: true }) path: string;

  @Column({ type: 'uuid', nullable: true }) tenantId: string;

  @CreateDateColumn() createdAt: Date;
}
