import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThanOrEqual, Repository } from 'typeorm';
import { BloodPressureEntry } from './entities/blood-pressure.entity';
import { CreateBloodPressureDto } from './dto/create-blood-pressure.dto';

@Injectable()
export class BloodPressureService {
  constructor(
    @InjectRepository(BloodPressureEntry)
    private readonly repo: Repository<BloodPressureEntry>,
  ) {}

  findAllForUser(userId: string) {
    return this.repo.find({
      where: { userId },
      order: { measuredAt: 'DESC' },
      take: 60,
    });
  }

  createForUser(userId: string, dto: CreateBloodPressureDto) {
    return this.repo.save(
      this.repo.create({
        userId,
        measuredAt: new Date(dto.measuredAt),
        systolic: dto.systolic,
        diastolic: dto.diastolic,
        heartRate: dto.heartRate,
        context: dto.context,
        notes: dto.notes,
        alertTriggered: dto.systolic >= 140 || dto.diastolic >= 90,
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
      return {
        count: 0,
        avgSystolic: null,
        avgDiastolic: null,
        avgHeartRate: null,
        alerts: 0,
      };
    }

    const sumS = entries.reduce((a, e) => a + e.systolic, 0);
    const sumD = entries.reduce((a, e) => a + e.diastolic, 0);
    const hrEntries = entries.filter((e) => e.heartRate != null);
    const sumHr = hrEntries.reduce((a, e) => a + (e.heartRate ?? 0), 0);

    return {
      count: entries.length,
      avgSystolic: Math.round(sumS / entries.length),
      avgDiastolic: Math.round(sumD / entries.length),
      avgHeartRate: hrEntries.length > 0 ? Math.round(sumHr / hrEntries.length) : null,
      alerts: entries.filter((e) => e.alertTriggered).length,
    };
  }
}
