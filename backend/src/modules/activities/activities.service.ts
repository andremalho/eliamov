import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomBytes } from 'crypto';
import { Activity } from './entities/activity.entity';
import { CreateActivityDto } from './dto/create-activity.dto';
import { PaginationDto, paginate } from '../../common/pagination.dto';

@Injectable()
export class ActivitiesService {
  constructor(
    @InjectRepository(Activity)
    private readonly repo: Repository<Activity>,
  ) {}

  async findAllForUser(userId: string, pagination: PaginationDto) {
    const { page = 1, limit = 20 } = pagination;
    const [data, total] = await this.repo.findAndCount({
      where: { userId },
      order: { startedAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return paginate(data, total, page, limit);
  }

  async findOneForUser(userId: string, id: string) {
    const record = await this.repo.findOne({ where: { id, userId } });
    if (!record) throw new NotFoundException();
    return record;
  }

  async findByShareToken(token: string) {
    const record = await this.repo.findOne({
      where: { shareToken: token, isPublic: true },
    });
    if (!record) throw new NotFoundException();
    return record;
  }

  createForUser(userId: string, dto: CreateActivityDto) {
    const shareToken = randomBytes(16).toString('hex');
    return this.repo.save(
      this.repo.create({ ...dto, userId, shareToken } as any),
    );
  }

  async updateForUser(userId: string, id: string, dto: Partial<Activity>) {
    const record = await this.repo.findOne({ where: { id, userId } });
    if (!record) throw new NotFoundException();
    await this.repo.update(id, dto as any);
    return this.repo.findOne({ where: { id } });
  }

  async removeForUser(userId: string, id: string) {
    const record = await this.repo.findOne({ where: { id, userId } });
    if (!record) throw new NotFoundException();
    await this.repo.delete(id);
    return { ok: true };
  }
}
