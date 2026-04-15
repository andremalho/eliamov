import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { DailyLogEntity } from './entities/daily-log.entity';
import { UpsertDailyLogDto } from './dto/upsert-daily-log.dto';
import { CycleEntry } from '../cycle/entities/cycle.entity';

@Injectable()
export class DailyLogService {
  constructor(
    @InjectRepository(DailyLogEntity) private readonly repo: Repository<DailyLogEntity>,
    @InjectRepository(CycleEntry) private readonly cycleRepo: Repository<CycleEntry>,
  ) {}

  async upsert(userId: string, dto: UpsertDailyLogDto): Promise<DailyLogEntity> {
    const cycle = await this.cycleRepo.findOne({ where: { userId }, order: { startDate: 'DESC' } });
    let cyclePhase = 'unknown';
    let cycleDay: number | null = null;

    if (cycle) {
      const start = new Date(cycle.startDate);
      const logDay = new Date(dto.logDate);
      const diffDays = Math.floor((logDay.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays >= 0) {
        cycleDay = diffDays + 1;
        cyclePhase = cycle.phase ?? this.inferPhase(cycleDay, cycle.cycleLength ?? 28);
      }
    }

    const existing = await this.repo.findOne({ where: { userId, logDate: dto.logDate } });
    if (existing) {
      Object.assign(existing, { ...dto, cyclePhase, cycleDay });
      return this.repo.save(existing);
    }
    return this.repo.save(this.repo.create({ ...dto, userId, cyclePhase, cycleDay }));
  }

  async findByDate(userId: string, date: string): Promise<DailyLogEntity | null> {
    return this.repo.findOne({ where: { userId, logDate: date } });
  }

  async findRange(userId: string, from: string, to: string): Promise<DailyLogEntity[]> {
    return this.repo.find({ where: { userId, logDate: Between(from, to) as any }, order: { logDate: 'ASC' } });
  }

  async findLast30(userId: string): Promise<DailyLogEntity[]> {
    const to = new Date().toISOString().split('T')[0];
    const from = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];
    return this.findRange(userId, from, to);
  }

  private inferPhase(day: number, cycleLength: number): string {
    if (day <= 5) return 'menstrual';
    if (day <= 13) return 'follicular';
    if (day <= 16) return 'ovulatory';
    if (day <= cycleLength) return 'luteal';
    return 'unknown';
  }
}
