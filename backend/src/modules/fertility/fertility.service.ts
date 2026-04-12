import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { FertilityLog } from './entities/fertility-log.entity';
import { CycleEntry } from '../cycle/entities/cycle.entity';
import { LogFertilityDto } from './dto/log-fertility.dto';

@Injectable()
export class FertilityService {
  constructor(
    @InjectRepository(FertilityLog)
    private readonly logRepo: Repository<FertilityLog>,
    @InjectRepository(CycleEntry)
    private readonly cycleRepo: Repository<CycleEntry>,
  ) {}

  async logDay(userId: string, dto: LogFertilityDto) {
    // Upsert: one entry per date per user
    const existing = await this.logRepo.findOne({
      where: { userId, date: new Date(dto.date) },
    });

    if (existing) {
      Object.assign(existing, {
        basalTemp: dto.basalTemp ?? existing.basalTemp,
        lhResult: dto.lhResult ?? existing.lhResult,
        cervicalMucus: dto.cervicalMucus ?? existing.cervicalMucus,
        cervixPosition: dto.cervixPosition ?? existing.cervixPosition,
        intercourse: dto.intercourse ?? existing.intercourse,
        notes: dto.notes ?? existing.notes,
      });
      return this.logRepo.save(existing);
    }

    const log = this.logRepo.create({
      userId,
      date: new Date(dto.date),
      basalTemp: dto.basalTemp ?? null,
      lhResult: dto.lhResult ?? null,
      cervicalMucus: dto.cervicalMucus ?? null,
      cervixPosition: dto.cervixPosition ?? null,
      intercourse: dto.intercourse ?? null,
      notes: dto.notes ?? null,
    });

    return this.logRepo.save(log);
  }

  async getLogs(userId: string) {
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    return this.logRepo.find({
      where: { userId, date: MoreThanOrEqual(sixtyDaysAgo) },
      order: { date: 'ASC' },
    });
  }

  async getFertileWindow(userId: string) {
    // 1. Get recent cycle data for average cycle length
    const cycles = await this.cycleRepo.find({
      where: { userId },
      order: { startDate: 'DESC' },
      take: 6,
    });

    const avgCycleLength =
      cycles.length > 0
        ? Math.round(
            cycles.reduce((sum, c) => sum + (c.cycleLength ?? 28), 0) /
              cycles.length,
          )
        : 28;

    // 2. Get fertility logs for BBT and LH analysis
    const logs = await this.getLogs(userId);

    // 3. Detect ovulation from LH peak
    const lhPeakLog = logs
      .filter((l) => l.lhResult === 'peak')
      .sort(
        (a, b) =>
          new Date(b.date).getTime() - new Date(a.date).getTime(),
      )[0];

    // 4. Detect BBT shift (0.2-0.5C rise sustained for 3+ days)
    const bbtShiftDay = this.detectBBTShift(logs);

    // 5. Estimate ovulation day
    let estimatedOvulation: Date | null = null;

    if (lhPeakLog) {
      // LH peak = ovulation in 24-36h
      estimatedOvulation = new Date(lhPeakLog.date);
      estimatedOvulation.setDate(estimatedOvulation.getDate() + 1);
    } else if (bbtShiftDay) {
      // BBT shift confirms ovulation happened the day before the shift
      estimatedOvulation = new Date(bbtShiftDay);
      estimatedOvulation.setDate(estimatedOvulation.getDate() - 1);
    } else if (cycles.length > 0) {
      // Fallback: estimate from cycle length (ovulation ~14 days before next period)
      const lastCycle = cycles[0];
      const cycleStart = new Date(lastCycle.startDate);
      const ovDay = avgCycleLength - 14;
      estimatedOvulation = new Date(cycleStart);
      estimatedOvulation.setDate(estimatedOvulation.getDate() + ovDay);
    }

    if (!estimatedOvulation) {
      return {
        estimatedOvulation: null,
        fertileWindowStart: null,
        fertileWindowEnd: null,
        avgCycleLength,
        confidence: 'low',
        method: 'insufficient_data',
        reference:
          'ASRM Practice Committee Opinion on Fertility Awareness-Based Methods',
      };
    }

    // Fertile window: 5 days before ovulation + day of + 1 day after
    const fertileStart = new Date(estimatedOvulation);
    fertileStart.setDate(fertileStart.getDate() - 5);

    const fertileEnd = new Date(estimatedOvulation);
    fertileEnd.setDate(fertileEnd.getDate() + 1);

    const confidence = lhPeakLog && bbtShiftDay
      ? 'high'
      : lhPeakLog || bbtShiftDay
        ? 'medium'
        : 'low';

    const methods: string[] = [];
    if (lhPeakLog) methods.push('lh_peak');
    if (bbtShiftDay) methods.push('bbt_shift');
    if (!lhPeakLog && !bbtShiftDay) methods.push('calendar');

    return {
      estimatedOvulation: estimatedOvulation.toISOString().split('T')[0],
      fertileWindowStart: fertileStart.toISOString().split('T')[0],
      fertileWindowEnd: fertileEnd.toISOString().split('T')[0],
      avgCycleLength,
      confidence,
      method: methods.join('+'),
      reference:
        'ASRM Practice Committee Opinion on Fertility Awareness-Based Methods',
    };
  }

  async getChart(userId: string) {
    const logs = await this.getLogs(userId);

    const bbtData = logs
      .filter((l) => l.basalTemp != null)
      .map((l) => ({
        date: l.date,
        temp: l.basalTemp,
      }));

    const lhData = logs
      .filter((l) => l.lhResult != null)
      .map((l) => ({
        date: l.date,
        result: l.lhResult,
      }));

    const mucusData = logs
      .filter((l) => l.cervicalMucus != null)
      .map((l) => ({
        date: l.date,
        mucus: l.cervicalMucus,
      }));

    const intercourseData = logs
      .filter((l) => l.intercourse === true)
      .map((l) => ({ date: l.date }));

    // Calculate coverline (average of 6 lowest temps before shift)
    let coverline: number | null = null;
    if (bbtData.length >= 6) {
      const sortedTemps = [...bbtData]
        .map((d) => d.temp)
        .sort((a, b) => a - b);
      const lowest6 = sortedTemps.slice(0, 6);
      coverline =
        Math.round(
          (lowest6.reduce((s, t) => s + t, 0) / lowest6.length) * 100,
        ) / 100;
    }

    return {
      bbt: bbtData,
      lh: lhData,
      mucus: mucusData,
      intercourse: intercourseData,
      coverline,
    };
  }

  /**
   * Detect BBT thermal shift: sustained rise of 0.2-0.5C for 3+ consecutive days
   * above the previous 6 temperatures.
   * Returns the date of the first elevated temperature, or null.
   */
  private detectBBTShift(logs: FertilityLog[]): Date | null {
    const temps = logs
      .filter((l) => l.basalTemp != null)
      .sort(
        (a, b) =>
          new Date(a.date).getTime() - new Date(b.date).getTime(),
      );

    if (temps.length < 9) return null; // need at least 6 baseline + 3 elevated

    for (let i = 6; i <= temps.length - 3; i++) {
      const baseline =
        temps.slice(i - 6, i).reduce((s, t) => s + t.basalTemp, 0) / 6;

      const shift = temps.slice(i, i + 3);
      const allElevated = shift.every(
        (t) => t.basalTemp - baseline >= 0.2 && t.basalTemp - baseline <= 0.5,
      );

      if (allElevated) {
        return new Date(shift[0].date);
      }
    }

    return null;
  }
}
