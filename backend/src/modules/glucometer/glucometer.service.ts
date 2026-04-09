import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThanOrEqual, Repository } from 'typeorm';
import { GlucoseEntry } from './entities/glucometer.entity';
import { CreateGlucometerDto, GlucoseContext } from './dto/create-glucometer.dto';

@Injectable()
export class GlucometerService {
  constructor(
    @InjectRepository(GlucoseEntry) private readonly repo: Repository<GlucoseEntry>,
  ) {}

  findAllForUser(userId: string) {
    return this.repo.find({
      where: { userId },
      order: { measuredAt: 'DESC' },
      take: 60,
    });
  }

  createForUser(userId: string, dto: CreateGlucometerDto) {
    return this.repo.save(
      this.repo.create({
        userId,
        measuredAt: new Date(dto.measuredAt),
        value: dto.value,
        context: dto.context,
        notes: dto.notes,
        alertTriggered: this.shouldAlert(dto.value, dto.context),
      }),
    );
  }

  async removeForUser(userId: string, id: string) {
    const found = await this.repo.findOne({ where: { id, userId } });
    if (!found) throw new NotFoundException();
    await this.repo.delete(id);
    return { ok: true };
  }

  async summary(userId: string) {
    const since = new Date();
    since.setDate(since.getDate() - 14);

    const entries = await this.repo.find({
      where: { userId, measuredAt: MoreThanOrEqual(since) },
    });

    if (entries.length === 0) {
      return { count: 0, avg: null, min: null, max: null, alerts: 0 };
    }

    const values = entries.map((e) => e.value);
    return {
      count: entries.length,
      avg: Math.round(values.reduce((a, b) => a + b, 0) / values.length),
      min: Math.min(...values),
      max: Math.max(...values),
      alerts: entries.filter((e) => e.alertTriggered).length,
    };
  }

  private shouldAlert(value: number, context: GlucoseContext): boolean {
    if (context === 'fasting' || context === 'bedtime') {
      return value < 70 || value > 100;
    }
    if (context === 'post_meal_1h' || context === 'post_meal_2h') {
      return value > 140;
    }
    return value < 70 || value > 180;
  }
}
