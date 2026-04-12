import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PerformanceLog } from './entities/performance-log.entity';
import { CreatePerformanceLogDto } from './dto/create-performance-log.dto';

@Injectable()
export class AthleteService {
  constructor(
    @InjectRepository(PerformanceLog)
    private repo: Repository<PerformanceLog>,
  ) {}

  async logPerformance(userId: string, dto: CreatePerformanceLogDto) {
    const log = this.repo.create({ userId, ...dto } as any);
    return this.repo.save(log);
  }

  async getDashboard(userId: string) {
    const logs = await this.repo.find({
      where: { userId },
      order: { date: 'DESC' },
      take: 7,
    });
    const acwr = await this.getACWR(userId);

    // Calculate readiness score (simple heuristic)
    const latest = logs[0];
    let readiness: number | null = null;
    if (latest) {
      const factors: number[] = [];
      if (latest.sleepScore != null) factors.push(latest.sleepScore / 100);
      if (latest.hrv != null) factors.push(Math.min(latest.hrv / 80, 1));
      if (latest.fatigueScore != null)
        factors.push((6 - latest.fatigueScore) / 5);
      if (latest.vigorScore != null) factors.push(latest.vigorScore / 5);
      if (latest.moodScore != null) factors.push(latest.moodScore / 5);
      if (factors.length > 0) {
        readiness = Math.round(
          (factors.reduce((s, f) => s + f, 0) / factors.length) * 100,
        );
      }
    }

    return { logs, acwr, readiness };
  }

  async getACWR(userId: string) {
    const logs = await this.repo.find({
      where: { userId },
      order: { date: 'DESC' },
      take: 28,
    });
    if (logs.length < 7)
      return { acwr: null, risk: 'insufficient_data', acute: 0, chronic: 0 };

    const acute =
      logs.slice(0, 7).reduce((s, l) => s + (l.trainingLoad ?? 0), 0) / 7;
    const chronic =
      logs.reduce((s, l) => s + (l.trainingLoad ?? 0), 0) / logs.length;
    const acwr = chronic > 0 ? +(acute / chronic).toFixed(2) : 0;

    let risk = 'optimal';
    if (acwr < 0.8) risk = 'undertrained';
    else if (acwr > 1.5) risk = 'high_injury_risk';
    else if (acwr > 1.3) risk = 'elevated';

    return {
      acwr,
      risk,
      acute: +acute.toFixed(0),
      chronic: +chronic.toFixed(0),
    };
  }
}
