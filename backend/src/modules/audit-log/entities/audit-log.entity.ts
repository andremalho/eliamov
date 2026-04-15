import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid') id: string;

  @Index()
  @Column({ type: 'uuid', nullable: true }) userId: string;

  @Column({ nullable: true }) userName: string;

  @Column() action: string; // 'CREATE' | 'UPDATE' | 'DELETE'

  @Column() resource: string; // 'article', 'recipe', 'user', etc.

  @Column({ type: 'uuid', nullable: true }) resourceId: string;

  @Column({ nullable: true }) details: string;

  @Column({ nullable: true }) method: string; // HTTP method

  @Column({ nullable: true }) path: string; // request path

  @Column({ type: 'uuid', nullable: true }) tenantId: string;

  @CreateDateColumn() createdAt: Date;
}
