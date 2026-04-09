import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('chat_messages')
export class ChatMessage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({
    type: 'enum',
    enum: ['user', 'professional', 'ai'],
    default: 'user',
  })
  sender: 'user' | 'professional' | 'ai';

  @Column({ type: 'uuid', nullable: true })
  professionalId: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'uuid', nullable: true })
  conversationId: string;

  @Column({ default: false })
  read: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
