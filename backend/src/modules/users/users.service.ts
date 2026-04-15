import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Response } from 'express';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CycleEntry } from '../cycle/entities/cycle.entity';
import { MedicationEntity } from '../medications/entities/medication.entity';
import { MentalHealthAssessmentEntity } from '../mental-health/entities/mental-health-assessment.entity';
import { DailyLogEntity } from '../daily-log/entities/daily-log.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly repo: Repository<User>,
    @InjectRepository(CycleEntry) private readonly cycleRepo: Repository<CycleEntry>,
    @InjectRepository(MedicationEntity) private readonly medRepo: Repository<MedicationEntity>,
    @InjectRepository(MentalHealthAssessmentEntity) private readonly assessmentRepo: Repository<MentalHealthAssessmentEntity>,
    @InjectRepository(DailyLogEntity) private readonly dailyLogRepo: Repository<DailyLogEntity>,
  ) {}

  findAll() {
    return this.repo.find();
  }

  findOne(id: string) {
    return this.repo.findOne({ where: { id } });
  }

  create(dto: CreateUserDto) {
    return this.repo.save(this.repo.create(dto as any));
  }

  update(id: string, dto: Partial<User>) {
    return this.repo.update(id, dto as any);
  }

  async updateProfile(id: string, dto: UpdateProfileDto) {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) throw new NotFoundException();

    const { profile: incomingProfile, markOnboardingComplete, ...flat } = dto;
    Object.assign(user, flat);

    if (incomingProfile) {
      user.profile = { ...(user.profile ?? {}), ...incomingProfile };
    }

    if (markOnboardingComplete) {
      user.onboardingCompletedAt = new Date();
    }

    await this.repo.save(user);
    const { password, ...rest } = user;
    return rest;
  }

  async exportUserData(userId: string, res: Response): Promise<void> {
    const [user, cycles, medications, assessments, logs] = await Promise.all([
      this.repo.findOne({ where: { id: userId } }),
      this.cycleRepo.find({ where: { userId }, order: { startDate: 'DESC' } }),
      this.medRepo.find({ where: { userId }, order: { startDate: 'DESC' } }),
      this.assessmentRepo.find({ where: { userId }, order: { createdAt: 'DESC' } }),
      this.dailyLogRepo.find({ where: { userId }, order: { logDate: 'DESC' } }),
    ]);

    const exportData = {
      exportedAt: new Date().toISOString(),
      exportedBy: 'EliaMov — solicitacao da titular (LGPD Art. 18)',
      userData: { id: user?.id, email: user?.email, name: user?.name, createdAt: user?.createdAt },
      cycles,
      medications,
      mentalHealthAssessments: assessments,
      dailyLogs: logs,
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="meus-dados-eliamov-${new Date().toISOString().split('T')[0]}.json"`);
    res.send(JSON.stringify(exportData, null, 2));
  }

  remove(id: string) {
    return this.repo.delete(id);
  }
}
