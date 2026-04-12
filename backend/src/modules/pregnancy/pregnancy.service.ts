import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pregnancy } from './entities/pregnancy.entity';
import { PregnancyWeek } from './entities/pregnancy-week.entity';
import { CreatePregnancyDto } from './dto/create-pregnancy.dto';
import { LogWeekDto } from './dto/log-week.dto';

@Injectable()
export class PregnancyService {
  constructor(
    @InjectRepository(Pregnancy) private readonly pregnancyRepo: Repository<Pregnancy>,
    @InjectRepository(PregnancyWeek) private readonly weekRepo: Repository<PregnancyWeek>,
  ) {}

  async create(userId: string, dto: CreatePregnancyDto) {
    const dum = new Date(dto.lastMenstrualDate);
    const dpp = new Date(dum.getTime() + 280 * 24 * 60 * 60 * 1000); // DUM + 280 days

    const now = new Date();
    const diffMs = now.getTime() - dum.getTime();
    const currentWeek = Math.max(1, Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000)));

    const pregnancy = this.pregnancyRepo.create({
      userId,
      lastMenstrualDate: dum,
      estimatedDueDate: dpp,
      currentWeek,
      prePregnancyWeight: dto.prePregnancyWeight ?? null,
      notes: dto.notes ?? null,
    });

    return this.pregnancyRepo.save(pregnancy);
  }

  async getActive(userId: string) {
    const pregnancy = await this.pregnancyRepo.findOne({
      where: { userId, status: 'active' },
    });
    if (!pregnancy) throw new NotFoundException('No active pregnancy found');

    // Recalculate current week
    const dum = new Date(pregnancy.lastMenstrualDate);
    const now = new Date();
    const diffMs = now.getTime() - dum.getTime();
    pregnancy.currentWeek = Math.max(1, Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000)));
    await this.pregnancyRepo.save(pregnancy);

    const weeks = await this.weekRepo.find({
      where: { pregnancyId: pregnancy.id },
      order: { weekNumber: 'ASC' },
    });

    return { ...pregnancy, weekLogs: weeks };
  }

  async logWeek(userId: string, pregnancyId: string, dto: LogWeekDto) {
    const pregnancy = await this.pregnancyRepo.findOne({
      where: { id: pregnancyId, userId, status: 'active' },
    });
    if (!pregnancy) throw new NotFoundException('Pregnancy not found');

    if (dto.weightKg) {
      pregnancy.currentWeight = dto.weightKg;
      await this.pregnancyRepo.save(pregnancy);
    }

    const weekLog = this.weekRepo.create({
      pregnancyId,
      weekNumber: dto.weekNumber,
      weightKg: dto.weightKg ?? null,
      symptoms: dto.symptoms ?? null,
      moodScore: dto.moodScore ?? null,
      energyScore: dto.energyScore ?? null,
      notes: dto.notes ?? null,
    });

    return this.weekRepo.save(weekLog);
  }

  getWeekInfo(weekNumber: number) {
    const trimester = weekNumber <= 12 ? 1 : weekNumber <= 27 ? 2 : 3;

    const babyDevelopment: Record<number, string> = {
      1: 'Fertilization and implantation beginning',
      4: 'Embryo is about the size of a poppy seed',
      8: 'All major organs are forming; about the size of a raspberry',
      12: 'Fully formed fingers and toes; about the size of a lime',
      16: 'Baby can make facial expressions; about the size of an avocado',
      20: 'You may feel baby move (quickening); about the size of a banana',
      24: 'Lungs developing; about the size of an ear of corn',
      28: 'Eyes can open and close; about the size of an eggplant',
      32: 'Practicing breathing movements; about the size of a squash',
      36: 'Most babies are head-down; about the size of a papaya',
      40: 'Full term; about the size of a watermelon',
    };

    const closestWeek = Object.keys(babyDevelopment)
      .map(Number)
      .reduce((prev, curr) =>
        Math.abs(curr - weekNumber) < Math.abs(prev - weekNumber) ? curr : prev,
      );

    const exerciseByTrimester: Record<number, string[]> = {
      1: [
        'Light walking 20-30 minutes daily',
        'Pelvic floor exercises (Kegels)',
        'Gentle stretching and yoga',
        'Swimming or water aerobics',
        'Nausea management: small frequent meals, ginger, vitamin B6',
      ],
      2: [
        'Safe strength training with moderate weights',
        'Swimming and water aerobics',
        'Walking 30 minutes daily',
        'Prenatal yoga',
        'Avoid exercises lying flat on back after week 16',
      ],
      3: [
        'Breathing exercises and relaxation techniques',
        'Birth preparation exercises',
        'Posture-focused exercises',
        'Gentle walking',
        'Pelvic floor strengthening',
        'Avoid high-impact activities',
      ],
    };

    const nutritionByTrimester: Record<number, string[]> = {
      1: [
        'Folic acid 400-800mcg daily',
        'Iron-rich foods',
        'Small frequent meals for nausea',
        'Stay hydrated (8-10 glasses water)',
      ],
      2: [
        'Increase calcium intake (1000mg/day)',
        'Omega-3 fatty acids (DHA)',
        'Increase caloric intake by ~340 kcal/day',
        'Iron supplementation as needed',
      ],
      3: [
        'Increase caloric intake by ~450 kcal/day',
        'Continue calcium and iron',
        'Vitamin K rich foods',
        'Fiber for digestive comfort',
      ],
    };

    return {
      week: weekNumber,
      trimester,
      babySize: babyDevelopment[closestWeek],
      exerciseRecs: exerciseByTrimester[trimester],
      nutritionTips: nutritionByTrimester[trimester],
      reference: 'ACOG Committee Opinion No. 804: Physical Activity and Exercise During Pregnancy and the Postpartum Period',
    };
  }
}
