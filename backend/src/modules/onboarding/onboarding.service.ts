import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OnboardingProgress } from './entities/onboarding.entity';
import { CreateOnboardingDto } from './dto/create-onboarding.dto';

@Injectable()
export class OnboardingService {
  constructor(
    @InjectRepository(OnboardingProgress) private readonly repo: Repository<OnboardingProgress>,
  ) {}

  async getProgress(userId: string) {
    let progress = await this.repo.findOne({ where: { userId } });
    if (!progress) {
      progress = this.repo.create({ userId, currentStep: 1, data: {} });
      await this.repo.save(progress);
    }
    return progress;
  }

  async saveProgress(userId: string, dto: CreateOnboardingDto) {
    let progress = await this.repo.findOne({ where: { userId } });
    if (!progress) {
      progress = this.repo.create({ userId, currentStep: 1, data: {} });
    }

    if (dto.currentStep != null) {
      progress.currentStep = dto.currentStep;
    }

    if (dto.data) {
      progress.data = { ...(progress.data ?? {}), ...dto.data };
    }

    if (progress.currentStep >= progress.totalSteps) {
      progress.completed = true;
    }

    return this.repo.save(progress);
  }
}
