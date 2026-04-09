import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('courses')
export class Course {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  instructorId: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  price: number;

  @Column({ type: 'jsonb', nullable: true })
  modules: any;

  @Column({ default: false })
  isPublished: boolean;

  @Column({ type: 'uuid', nullable: true })
  tenantId: string;

  @CreateDateColumn()
  createdAt: Date;
}
