import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TeleconsultSession } from './entities/teleconsult.entity';
import { CreateTeleconsultDto } from './dto/create-teleconsult.dto';

@Injectable()
export class TeleconsultService {
  constructor(
    @InjectRepository(TeleconsultSession) private readonly repo: Repository<TeleconsultSession>,
  ) {}

  findAllForUser(userId: string) {
    return this.repo.find({ where: { userId }, order: { scheduledAt: 'DESC' } });
  }

  async findOneForUser(userId: string, id: string) {
    const record = await this.repo.findOne({ where: { id, userId } });
    if (!record) throw new NotFoundException();
    return record;
  }

  createForUser(userId: string, dto: CreateTeleconsultDto) {
    return this.repo.save(this.repo.create({ ...dto, userId } as any));
  }

  async updateForUser(userId: string, id: string, dto: Partial<TeleconsultSession>) {
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
