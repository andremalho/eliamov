import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('notifications')
export class Notifications {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  body: string;

  @Column({
    type: 'enum',
    enum: ['info', 'warning', 'reminder'],
    default: 'info',
  })
  type: 'info' | 'warning' | 'reminder';

  @Column({ default: false })
  read: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
