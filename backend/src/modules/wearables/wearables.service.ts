import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WearableConnection } from './entities/wearable-connection.entity';
import { WearableData } from './entities/wearable-data.entity';
import { CreateWearablesDto } from './dto/create-wearables.dto';

@Injectable()
export class WearablesService {
  constructor(
    @InjectRepository(WearableConnection) private readonly connRepo: Repository<WearableConnection>,
    @InjectRepository(WearableData) private readonly dataRepo: Repository<WearableData>,
  ) {}

  findAllForUser(userId: string) {
    return this.connRepo.find({ where: { userId } });
  }

  async findOneForUser(userId: string, id: string) {
    const record = await this.connRepo.findOne({ where: { id, userId } });
    if (!record) throw new NotFoundException();
    return record;
  }

  createForUser(userId: string, dto: CreateWearablesDto) {
    return this.connRepo.save(this.connRepo.create({ ...dto, userId } as any));
  }

  async updateForUser(userId: string, id: string, dto: Partial<WearableConnection>) {
    const record = await this.connRepo.findOne({ where: { id, userId } });
    if (!record) throw new NotFoundException();
    return this.connRepo.update(id, dto as any);
  }

  async removeForUser(userId: string, id: string) {
    const record = await this.connRepo.findOne({ where: { id, userId } });
    if (!record) throw new NotFoundException();
    await this.connRepo.delete(id);
    return { ok: true };
  }

  listDataForUser(userId: string) {
    return this.dataRepo.find({ where: { userId }, order: { recordedAt: 'DESC' } });
  }
}
