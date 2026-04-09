import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CycleEntry } from './entities/cycle.entity';
import { CreateCycleDto } from './dto/create-cycle.dto';

type Phase = 'menstrual' | 'follicular' | 'ovulatory' | 'luteal';

@Injectable()
export class CycleService {
  constructor(
    @InjectRepository(CycleEntry) private readonly repo: Repository<CycleEntry>,
  ) {}

  findAllForUser(userId: string) {
    return this.repo.find({
      where: { userId },
      order: { startDate: 'DESC' },
    });
  }

  async createForUser(userId: string, dto: CreateCycleDto) {
    const cycleLength = dto.cycleLength ?? 28;
    const periodLength = dto.periodLength ?? 5;
    const start = new Date(dto.startDate);
    const predictedNextStart = new Date(start);
    predictedNextStart.setDate(predictedNextStart.getDate() + cycleLength);

    const entry = this.repo.create({
      userId,
      startDate: dto.startDate as any,
      endDate: dto.endDate as any,
      cycleLength,
      periodLength,
      predictedNextStart: predictedNextStart.toISOString().slice(0, 10) as any,
      phase: this.computePhase(0, cycleLength, periodLength),
    });
    return this.repo.save(entry);
  }

  async removeForUser(userId: string, id: string) {
    const found = await this.repo.findOne({ where: { id, userId } });
    if (!found) throw new NotFoundException();
    await this.repo.delete(id);
    return { ok: true };
  }

  async getCurrentPhase(userId: string) {
    const last = await this.repo.findOne({
      where: { userId },
      order: { startDate: 'DESC' },
    });

    if (!last) {
      return {
        phase: null as Phase | null,
        dayOfCycle: null as number | null,
        nextStart: null as string | null,
        message: 'Nenhum ciclo registrado ainda.',
      };
    }

    const cycleLength = last.cycleLength ?? 28;
    const periodLength = last.periodLength ?? 5;
    const start = new Date(last.startDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    start.setHours(0, 0, 0, 0);

    const diffDays = Math.floor(
      (today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
    );
    const dayOfCycle = (diffDays % cycleLength) + 1;
    const phase = this.computePhase(dayOfCycle - 1, cycleLength, periodLength);

    const cyclesElapsed = Math.floor(diffDays / cycleLength);
    const nextStart = new Date(start);
    nextStart.setDate(nextStart.getDate() + (cyclesElapsed + 1) * cycleLength);

    return {
      phase,
      dayOfCycle,
      nextStart: nextStart.toISOString().slice(0, 10),
      cycleLength,
      periodLength,
    };
  }

  private computePhase(dayIndex: number, cycleLength: number, periodLength: number): Phase {
    if (dayIndex < periodLength) return 'menstrual';
    const ovulationDay = cycleLength - 14;
    if (dayIndex < ovulationDay - 1) return 'follicular';
    if (dayIndex <= ovulationDay + 1) return 'ovulatory';
    return 'luteal';
  }
}
