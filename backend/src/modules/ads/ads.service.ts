import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ad } from './entities/ads.entity';
import { CreateAdsDto } from './dto/create-ads.dto';

@Injectable()
export class AdsService {
  constructor(
    @InjectRepository(Ad) private readonly repo: Repository<Ad>,
  ) {}

  findAllActive() {
    return this.repo.find({
      where: { isActive: true },
      order: { createdAt: 'DESC' },
    });
  }

  findAll() {
    return this.repo.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: string) {
    const ad = await this.repo.findOne({ where: { id } });
    if (!ad) throw new NotFoundException();
    return ad;
  }

  create(dto: CreateAdsDto) {
    return this.repo.save(this.repo.create(dto as any));
  }

  async update(id: string, dto: Partial<Ad>) {
    const ad = await this.repo.findOne({ where: { id } });
    if (!ad) throw new NotFoundException();
    Object.assign(ad, dto);
    return this.repo.save(ad);
  }

  async trackClick(id: string) {
    const ad = await this.repo.findOne({ where: { id } });
    if (!ad) throw new NotFoundException();
    ad.clicks += 1;
    return this.repo.save(ad);
  }

  async remove(id: string) {
    const ad = await this.repo.findOne({ where: { id } });
    if (!ad) throw new NotFoundException();
    await this.repo.delete(id);
    return { ok: true };
  }
}
