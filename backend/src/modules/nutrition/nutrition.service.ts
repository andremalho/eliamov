import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NutritionEntry } from './entities/nutrition.entity';
import { CreateNutritionDto } from './dto/create-nutrition.dto';

@Injectable()
export class NutritionService {
  constructor(
    @InjectRepository(NutritionEntry) private readonly repo: Repository<NutritionEntry>,
  ) {}

  findAllForUser(userId: string) {
    return this.repo.find({ where: { userId }, order: { date: 'DESC', createdAt: 'DESC' } });
  }

  async findOneForUser(userId: string, id: string) {
    const record = await this.repo.findOne({ where: { id, userId } });
    if (!record) throw new NotFoundException();
    return record;
  }

  createForUser(userId: string, dto: CreateNutritionDto) {
    return this.repo.save(this.repo.create({ ...dto, userId } as any));
  }

  async updateForUser(userId: string, id: string, dto: Partial<NutritionEntry>) {
    const record = await this.repo.findOne({ where: { id, userId } });
    if (!record) throw new NotFoundException();
    Object.assign(record, dto);
    return this.repo.save(record);
  }

  async removeForUser(userId: string, id: string) {
    const record = await this.repo.findOne({ where: { id, userId } });
    if (!record) throw new NotFoundException();
    await this.repo.delete(id);
    return { ok: true };
  }
}
