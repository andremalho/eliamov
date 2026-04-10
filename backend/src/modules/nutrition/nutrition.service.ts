import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { NutritionEntry } from './entities/nutrition.entity';
import { WeightEntry } from './entities/weight-entry.entity';
import { NutritionGoal } from './entities/nutrition-goal.entity';
import { BodyComposition } from './entities/body-composition.entity';
import { CreateNutritionDto } from './dto/create-nutrition.dto';
import { CreateWeightEntryDto } from './dto/create-weight-entry.dto';
import { CreateNutritionGoalDto } from './dto/create-nutrition-goal.dto';
import { CreateBodyCompositionDto } from './dto/create-body-composition.dto';
import { PaginationDto, paginate } from '../../common/pagination.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class NutritionService {
  constructor(
    @InjectRepository(NutritionEntry) private readonly repo: Repository<NutritionEntry>,
    @InjectRepository(WeightEntry) private readonly weightRepo: Repository<WeightEntry>,
    @InjectRepository(NutritionGoal) private readonly goalRepo: Repository<NutritionGoal>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(BodyComposition) private readonly bodyCompRepo: Repository<BodyComposition>,
  ) {}

  // ── existing CRUD ──────────────────────────────────────────────

  async findAllForUser(userId: string, pagination: PaginationDto) {
    const page = pagination.page ?? 1;
    const limit = pagination.limit ?? 20;
    const [data, total] = await this.repo.findAndCount({
      where: { userId },
      order: { date: 'DESC', createdAt: 'DESC' },
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

  createForUser(userId: string, dto: CreateNutritionDto) {
    return this.repo.save(this.repo.create({ ...dto, userId } as any));
  }

  async updateForUser(userId: string, id: string, dto: Partial<NutritionEntry>) {
    const record = await this.repo.findOne({ where: { id, userId } });
    if (!record) throw new NotFoundException();
    Object.assign(record, dto);
    return this.repo.save(record);
  }

  async removeForUser(userId: string, id: string) {
    const record = await this.repo.findOne({ where: { id, userId } });
    if (!record) throw new NotFoundException();
    await this.repo.delete(id);
    return { ok: true };
  }

  // ── daily / weekly summaries ───────────────────────────────────

  async dailySummary(userId: string, date: string) {
    const entries = await this.repo.find({
      where: { userId, date: date as any },
    });

    const totals = {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      water: 0,
      entries: entries.length,
    };

    for (const e of entries) {
      totals.calories += e.calories ?? 0;
      totals.protein += e.protein ?? 0;
      totals.carbs += e.carbs ?? 0;
      totals.fat += e.fat ?? 0;
      totals.water += e.water ?? 0;
    }

    const goal = await this.getGoal(userId);

    return { date, totals, goal };
  }

  async weekSummary(userId: string) {
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 6);

    const startDate = sevenDaysAgo.toISOString().slice(0, 10);
    const endDate = today.toISOString().slice(0, 10);

    const entries = await this.repo.find({
      where: {
        userId,
        date: Between(startDate as any, endDate as any),
      },
    });

    // Group by date
    const byDate: Record<string, { calories: number; protein: number; carbs: number; fat: number; water: number; count: number }> = {};

    for (const e of entries) {
      const d = typeof e.date === 'string' ? e.date : (e.date as Date).toISOString().slice(0, 10);
      if (!byDate[d]) {
        byDate[d] = { calories: 0, protein: 0, carbs: 0, fat: 0, water: 0, count: 0 };
      }
      byDate[d].calories += e.calories ?? 0;
      byDate[d].protein += e.protein ?? 0;
      byDate[d].carbs += e.carbs ?? 0;
      byDate[d].fat += e.fat ?? 0;
      byDate[d].water += e.water ?? 0;
      byDate[d].count += 1;
    }

    const days = Object.keys(byDate).sort();
    const daysWithData = days.length || 1;

    const averages = {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      water: 0,
    };

    for (const d of days) {
      averages.calories += byDate[d].calories;
      averages.protein += byDate[d].protein;
      averages.carbs += byDate[d].carbs;
      averages.fat += byDate[d].fat;
      averages.water += byDate[d].water;
    }

    averages.calories = Math.round(averages.calories / daysWithData);
    averages.protein = +(averages.protein / daysWithData).toFixed(1);
    averages.carbs = +(averages.carbs / daysWithData).toFixed(1);
    averages.fat = +(averages.fat / daysWithData).toFixed(1);
    averages.water = +(averages.water / daysWithData).toFixed(1);

    return {
      startDate,
      endDate,
      daysWithData,
      dailyBreakdown: byDate,
      averages,
    };
  }

  // ── weight tracking ────────────────────────────────────────────

  async listWeights(userId: string) {
    return this.weightRepo.find({
      where: { userId },
      order: { date: 'DESC' },
    });
  }

  async createWeight(userId: string, dto: CreateWeightEntryDto) {
    return this.weightRepo.save(this.weightRepo.create({ ...dto, userId }));
  }

  async removeWeight(userId: string, id: string) {
    const record = await this.weightRepo.findOne({ where: { id, userId } });
    if (!record) throw new NotFoundException();
    await this.weightRepo.delete(id);
    return { ok: true };
  }

  // ── nutrition goals ────────────────────────────────────────────

  async getGoal(userId: string): Promise<NutritionGoal> {
    const existing = await this.goalRepo.findOne({ where: { userId } });
    if (existing) return existing;

    // Auto-calculate default goal based on user profile
    const user = await this.userRepo.findOne({ where: { id: userId } });
    const defaults = this.calculateDefaultGoal(user);

    const goal = this.goalRepo.create({ userId, ...defaults });
    return this.goalRepo.save(goal);
  }

  async setGoal(userId: string, dto: CreateNutritionGoalDto): Promise<NutritionGoal> {
    let goal = await this.goalRepo.findOne({ where: { userId } });
    if (goal) {
      Object.assign(goal, dto);
    } else {
      goal = this.goalRepo.create({ ...dto, userId });
    }
    return this.goalRepo.save(goal);
  }

  // ── BMR / TDEE helpers (Mifflin-St Jeor, female) ──────────────

  private calculateDefaultGoal(user: User | null): Partial<NutritionGoal> {
    const weight = user?.weight ?? 65;
    const height = user?.height ?? 165;
    const age = user?.birthDate
      ? Math.floor(
          (Date.now() - new Date(user.birthDate).getTime()) / (1000 * 60 * 60 * 24 * 365.25),
        )
      : 30;

    // Mifflin-St Jeor (female): BMR = 10*weight + 6.25*height - 5*age - 161
    const bmr = 10 * weight + 6.25 * height - 5 * age - 161;

    // Activity multiplier based on fitnessLevel
    const activityMultipliers: Record<string, number> = {
      sedentary: 1.2,
      beginner: 1.375,
      intermediate: 1.55,
      advanced: 1.725,
    };
    const multiplier = activityMultipliers[user?.fitnessLevel ?? 'sedentary'] ?? 1.2;

    const tdee = Math.round(bmr * multiplier);

    // Map fitnessGoal to nutrition goal type and calorie adjustment
    let goalType: 'weight_loss' | 'maintenance' | 'muscle_gain' = 'maintenance';
    let dailyCalories = tdee;

    if (user?.fitnessGoal === 'weight_loss') {
      goalType = 'weight_loss';
      dailyCalories = Math.round(tdee * 0.8); // 20% deficit
    } else if (user?.fitnessGoal === 'strength') {
      goalType = 'muscle_gain';
      dailyCalories = Math.round(tdee * 1.1); // 10% surplus
    }

    // Macro split: protein 30%, carbs 40%, fat 30%
    const dailyProtein = +((dailyCalories * 0.3) / 4).toFixed(1); // 4 cal/g
    const dailyCarbs = +((dailyCalories * 0.4) / 4).toFixed(1);   // 4 cal/g
    const dailyFat = +((dailyCalories * 0.3) / 9).toFixed(1);     // 9 cal/g
    const dailyWater = 2.0; // liters

    return {
      dailyCalories,
      dailyProtein,
      dailyCarbs,
      dailyFat,
      dailyWater,
      goal: goalType,
    };
  }

  // ── body composition ──────────────────────────────────────────

  async listBodyCompositions(userId: string) {
    return this.bodyCompRepo.find({ where: { userId }, order: { date: 'DESC' } });
  }

  async createBodyComposition(userId: string, dto: CreateBodyCompositionDto) {
    return this.bodyCompRepo.save(this.bodyCompRepo.create({ ...dto, userId } as any));
  }

  async removeBodyComposition(userId: string, id: string) {
    const rec = await this.bodyCompRepo.findOneBy({ id, userId });
    if (!rec) throw new NotFoundException();
    await this.bodyCompRepo.delete(id);
    return { ok: true };
  }

  // ── evolution stats ───────────────────────────────────────────

  async getEvolution(userId: string) {
    const weights = await this.weightRepo.find({ where: { userId }, order: { date: 'ASC' } });
    const compositions = await this.bodyCompRepo.find({ where: { userId }, order: { date: 'ASC' } });
    const goal = await this.getGoal(userId);

    // Calculate positive highlights
    const highlights: { label: string; value: string; positive: boolean }[] = [];

    if (weights.length >= 2) {
      const first = Number(weights[0].weight);
      const last = Number(weights[weights.length - 1].weight);
      const diff = +(last - first).toFixed(1);
      const goalIsLoss = goal?.goal === 'weight_loss';
      highlights.push({
        label: 'Variacao de peso',
        value: `${diff > 0 ? '+' : ''}${diff} kg`,
        positive: goalIsLoss ? diff < 0 : diff > 0,
      });
    }

    if (compositions.length >= 2) {
      const firstFat = compositions.find(c => c.bodyFatPercent != null);
      const lastFat = [...compositions].reverse().find(c => c.bodyFatPercent != null);
      if (firstFat && lastFat && firstFat.id !== lastFat.id) {
        const diff = +(Number(lastFat.bodyFatPercent) - Number(firstFat.bodyFatPercent)).toFixed(1);
        highlights.push({
          label: 'Gordura corporal',
          value: `${diff > 0 ? '+' : ''}${diff}%`,
          positive: diff < 0,
        });
      }
      const firstMuscle = compositions.find(c => c.muscleMassKg != null);
      const lastMuscle = [...compositions].reverse().find(c => c.muscleMassKg != null);
      if (firstMuscle && lastMuscle && firstMuscle.id !== lastMuscle.id) {
        const diff = +(Number(lastMuscle.muscleMassKg) - Number(firstMuscle.muscleMassKg)).toFixed(1);
        highlights.push({
          label: 'Massa muscular',
          value: `${diff > 0 ? '+' : ''}${diff} kg`,
          positive: diff > 0,
        });
      }
    }

    // Streak: count weight entries as consistency metric
    highlights.push({
      label: 'Registros de peso',
      value: `${weights.length} medicoes`,
      positive: weights.length > 0,
    });

    return { weights, compositions, goal, highlights };
  }
}
