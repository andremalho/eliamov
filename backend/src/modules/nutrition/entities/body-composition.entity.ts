import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('body_compositions')
export class BodyComposition {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ type: 'uuid' }) userId: string;
  @Column({ type: 'date' }) date: Date;
  @Column({ type: 'enum', enum: ['bioimpedance', 'dexa', 'manual'], default: 'manual' })
  method: 'bioimpedance' | 'dexa' | 'manual';
  @Column({ type: 'float', nullable: true }) bodyFatPercent: number;
  @Column({ type: 'float', nullable: true }) muscleMassKg: number;
  @Column({ type: 'float', nullable: true }) boneMassKg: number;
  @Column({ type: 'float', nullable: true }) waterPercent: number;
  @Column({ type: 'float', nullable: true }) visceralFat: number;
  @Column({ type: 'float', nullable: true }) basalMetabolism: number;
  @Column({ nullable: true }) reportFileUrl: string; // uploaded PDF/image
  @Column({ type: 'text', nullable: true }) notes: string;
  @CreateDateColumn() createdAt: Date;
}
