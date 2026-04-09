import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThanOrEqual, Repository } from 'typeorm';
import { MoodEntry } from './entities/mood.entity';
import { CreateMoodDto } from './dto/create-mood.dto';

@Injectable()
export class MoodService {
  constructor(
    @InjectRepository(MoodEntry) private readonly repo: Repository<MoodEntry>,
  ) {}

  findAllForUser(userId: string) {
    return this.repo.find({
      where: { userId },
      order: { date: 'DESC' },
      take: 60,
    });
  }

  createForUser(userId: string, dto: CreateMoodDto) {
    return this.repo.save(
      this.repo.create({
        userId,
        date: dto.date as any,
        energy: dto.energy,
        mood: dto.mood,
        sleepHours: dto.sleepHours,
        pain: dto.pain ?? false,
        notes: dto.notes,
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
    since.setDate(since.getDate() - 7);
    const sinceIso = since.toISOString().slice(0, 10);

    const entries = await this.repo.find({
      where: { userId, date: MoreThanOrEqual(sinceIso as any) },
    });

    if (entries.length === 0) {
      return {
        count: 0,
        avgEnergy: null,
        avgMood: null,
        avgSleep: null,
        painDays: 0,
      };
    }

    const sum = entries.reduce(
      (acc, e) => ({
        energy: acc.energy + e.energy,
        mood: acc.mood + e.mood,
        sleep: acc.sleep + (e.sleepHours ?? 0),
        sleepCount: acc.sleepCount + (e.sleepHours != null ? 1 : 0),
        pain: acc.pain + (e.pain ? 1 : 0),
      }),
      { energy: 0, mood: 0, sleep: 0, sleepCount: 0, pain: 0 },
    );

    return {
      count: entries.length,
      avgEnergy: +(sum.energy / entries.length).toFixed(1),
      avgMood: +(sum.mood / entries.length).toFixed(1),
      avgSleep: sum.sleepCount > 0 ? +(sum.sleep / sum.sleepCount).toFixed(1) : null,
      painDays: sum.pain,
    };
  }
}
