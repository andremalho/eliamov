import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TrainingPlan } from './entities/training.entity';
import { CreateTrainingDto } from './dto/create-training.dto';

@Injectable()
export class TrainingService {
  constructor(
    @InjectRepository(TrainingPlan) private readonly repo: Repository<TrainingPlan>,
  ) {}

  findAllForUser(userId: string) {
    return this.repo.find({ where: { userId }, order: { createdAt: 'DESC' } });
  }

  async findOneForUser(userId: string, id: string) {
    const record = await this.repo.findOne({ where: { id, userId } });
    if (!record) throw new NotFoundException();
    return record;
  }

  createForUser(userId: string, dto: CreateTrainingDto) {
    return this.repo.save(this.repo.create({ ...dto, userId } as any));
  }

  async updateForUser(userId: string, id: string, dto: Partial<TrainingPlan>) {
    const record = await this.repo.findOne({ where: { id, userId } });
    if (!record) throw new NotFoundException();
    return this.repo.update(id, dto as any);
  }

  async removeForUser(userId: string, id: string) {
    const record = await this.repo.findOne({ where: { id, userId } });
    if (!record) throw new NotFoundException();
    await this.repo.delete(id);
    return { ok: true };
  }
}
