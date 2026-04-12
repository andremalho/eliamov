import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TrainingPlan } from './entities/training.entity';
import { CreateTrainingDto } from './dto/create-training.dto';
import { WORKOUT_LIBRARY, WorkoutTemplate } from './workout-library';
import { CycleEntry } from '../cycle/entities/cycle.entity';

@Injectable()
export class TrainingService {
  constructor(
    @InjectRepository(TrainingPlan) private readonly repo: Repository<TrainingPlan>,
    @InjectRepository(CycleEntry) private readonly cycleRepo: Repository<CycleEntry>,
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

  async getTodayWorkout(userId: string) {
    // Determine current cycle phase
    const entry = await this.cycleRepo.findOne({
      where: { userId },
      order: { startDate: 'DESC' },
    });

    let phase: 'menstrual' | 'follicular' | 'ovulatory' | 'luteal' = 'follicular'; // default
    let dayOfCycle: number | null = null;

    if (entry) {
      const cycleLength = entry.cycleLength ?? 28;
      const periodLength = entry.periodLength ?? 5;
      const start = new Date(entry.startDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      start.setHours(0, 0, 0, 0);
      const diff = Math.floor(
        (today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
      );
      const dayIndex = diff % cycleLength;
      dayOfCycle = dayIndex + 1;

      if (dayIndex < periodLength) phase = 'menstrual';
      else if (dayIndex < cycleLength - 14 - 1) phase = 'follicular';
      else if (dayIndex <= cycleLength - 14 + 1) phase = 'ovulatory';
      else phase = 'luteal';
    }

    // Get workouts for this phase
    const workouts = WORKOUT_LIBRARY.filter((w) => w.phase === phase);
    // Pick one based on day of week (rotate)
    const dayOfWeek = new Date().getDay();
    const workout = workouts[dayOfWeek % workouts.length];

    return {
      phase,
      dayOfCycle,
      workout,
      allForPhase: workouts,
      alert:
        phase === 'ovulatory'
          ? 'Risco ligamentar aumentado. Aquecimento prolongado recomendado.'
          : null,
    };
  }

  getLibrary(): WorkoutTemplate[] {
    return WORKOUT_LIBRARY;
  }

  getLibraryByPhase(phase: string): WorkoutTemplate[] {
    return WORKOUT_LIBRARY.filter((w) => w.phase === phase);
  }
}
