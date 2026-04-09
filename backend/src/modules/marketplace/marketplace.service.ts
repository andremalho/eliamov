import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MarketplaceItem } from './entities/marketplace.entity';
import { CreateMarketplaceDto } from './dto/create-marketplace.dto';

@Injectable()
export class MarketplaceService {
  constructor(
    @InjectRepository(MarketplaceItem) private readonly repo: Repository<MarketplaceItem>,
  ) {}

  findAll() { return this.repo.find(); }
  findOne(id: string) { return this.repo.findOne({ where: { id } }); }
  create(dto: CreateMarketplaceDto) { return this.repo.save(this.repo.create(dto as any)); }
  update(id: string, dto: Partial<MarketplaceItem>) { return this.repo.update(id, dto as any); }
  remove(id: string) { return this.repo.delete(id); }
}
