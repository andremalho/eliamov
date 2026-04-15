import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { TrainingPlan } from './entities/training.entity';
import { CustomWorkout } from './entities/custom-workout.entity';
import { WorkoutLog } from './entities/workout-log.entity';
import { CreateTrainingDto } from './dto/create-training.dto';
import { CreateCustomWorkoutDto } from './dto/create-custom-workout.dto';
import { CreateWorkoutLogDto } from './dto/create-workout-log.dto';
import { WORKOUT_LIBRARY, WorkoutTemplate } from './workout-library';
import { CycleEntry } from '../cycle/entities/cycle.entity';

@Injectable()
export class TrainingService {
  constructor(
    @InjectRepository(TrainingPlan) private readonly repo: Repository<TrainingPlan>,
    @InjectRepository(CustomWorkout) private readonly customRepo: Repository<CustomWorkout>,
    @InjectRepository(WorkoutLog) private readonly logRepo: Repository<WorkoutLog>,
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
    return this.repo.save(this.repo.create({ ...dto, userId } as unknown as Partial<TrainingPlan>));
  }

  async updateForUser(userId: string, id: string, dto: Partial<TrainingPlan>) {
    const record = await this.repo.findOne({ where: { id, userId } });
    if (!record) throw new NotFoundException();
    return this.repo.update(id, dto);
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

  // --- Custom Workouts (admin-managed) ---
  findCustomWorkouts(tenantId?: string) {
    const where = tenantId ? [{ academyId: tenantId }, { academyId: IsNull() }] : {};
    return this.customRepo.find({ order: { createdAt: 'DESC' }, where });
  }

  async findCustomWorkoutById(id: string) {
    const record = await this.customRepo.findOneBy({ id });
    if (!record) throw new NotFoundException();
    return record;
  }

  createCustomWorkout(userId: string, dto: CreateCustomWorkoutDto) {
    return this.customRepo.save(this.customRepo.create({ ...dto, createdBy: userId } as Partial<CustomWorkout>));
  }

  async updateCustomWorkout(id: string, dto: Partial<CreateCustomWorkoutDto>) {
    const record = await this.customRepo.findOneBy({ id });
    if (!record) throw new NotFoundException();
    Object.assign(record, dto);
    return this.customRepo.save(record);
  }

  async removeCustomWorkout(id: string) {
    const record = await this.customRepo.findOneBy({ id });
    if (!record) throw new NotFoundException();
    await this.customRepo.delete(id);
    return { ok: true };
  }

  getFullLibrary(tenantId?: string) {
    return this.findCustomWorkouts(tenantId).then((custom) => ({
      builtin: WORKOUT_LIBRARY,
      custom,
    }));
  }

  // --- Workout Logs ---
  createWorkoutLog(userId: string, dto: CreateWorkoutLogDto) {
    return this.logRepo.save(this.logRepo.create({ ...dto, userId } as Partial<WorkoutLog>));
  }

  findWorkoutLogs(userId: string, page = 1, limit = 20) {
    return this.logRepo.findAndCount({
      where: { userId },
      order: { completedAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    }).then(([data, total]) => ({ data, total, page, limit, totalPages: Math.ceil(total / limit) }));
  }

  async getProgressStats(userId: string) {
    const logs = await this.logRepo.find({ where: { userId }, order: { completedAt: 'DESC' } });
    const totalWorkouts = logs.length;
    const totalMinutes = logs.reduce((sum, l) => sum + Math.round(l.durationSeconds / 60), 0);
    const avgRpe = totalWorkouts > 0
      ? +(logs.filter((l) => l.rpe != null).reduce((sum, l) => sum + (l.rpe ?? 0), 0) / Math.max(logs.filter((l) => l.rpe != null).length, 1)).toFixed(1)
      : 0;

    // Weekly trend (last 4 weeks)
    const weeklyData: { week: string; count: number; minutes: number }[] = [];
    for (let i = 0; i < 4; i++) {
      const end = new Date();
      end.setDate(end.getDate() - i * 7);
      const start = new Date(end);
      start.setDate(start.getDate() - 7);
      const weekLogs = logs.filter((l) => {
        const d = new Date(l.completedAt);
        return d >= start && d < end;
      });
      weeklyData.push({
        week: `S-${i}`,
        count: weekLogs.length,
        minutes: weekLogs.reduce((s, l) => s + Math.round(l.durationSeconds / 60), 0),
      });
    }

    return { totalWorkouts, totalMinutes, avgRpe, weeklyData: weeklyData.reverse(), recentLogs: logs.slice(0, 5) };
  }
}
