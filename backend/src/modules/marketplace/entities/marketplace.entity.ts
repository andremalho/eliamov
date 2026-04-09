import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
} from 'typeorm';

@Entity('marketplace_items')
export class MarketplaceItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  sellerId: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  price: number;

  @Column({ nullable: true })
  imageUrl: string;

  @Column({
    type: 'enum',
    enum: ['clothing', 'supplements', 'equipment', 'professional_service'],
    default: 'clothing',
  })
  category: 'clothing' | 'supplements' | 'equipment' | 'professional_service';

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'uuid', nullable: true })
  tenantId: string;
}
