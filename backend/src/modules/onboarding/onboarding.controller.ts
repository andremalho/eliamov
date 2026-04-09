import { Body, Controller, Get, Patch } from '@nestjs/common';
import { OnboardingService } from './onboarding.service';
import { CreateOnboardingDto } from './dto/create-onboarding.dto';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('onboarding')
export class OnboardingController {
  constructor(private readonly service: OnboardingService) {}

  @Get()
  getProgress(@CurrentUser() user: { userId: string }) {
    return this.service.getProgress(user.userId);
  }

  @Patch()
  saveProgress(@CurrentUser() user: { userId: string }, @Body() dto: CreateOnboardingDto) {
    return this.service.saveProgress(user.userId, dto);
  }
}
