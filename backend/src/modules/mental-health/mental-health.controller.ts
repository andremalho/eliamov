import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { MentalHealthService } from './mental-health.service';
import { CurrentUser } from '../auth/current-user.decorator';
import { FemaleZoneOnly } from '../auth/decorators/female-zone.decorator';
import { SubmitAssessmentDto } from './dto/submit-assessment.dto';

@Controller('mental-health')
@FemaleZoneOnly()
export class MentalHealthController {
  constructor(private readonly mentalHealthService: MentalHealthService) {}

  @Post('assessment')
  async submit(
    @CurrentUser() user: { userId: string },
    @Body() dto: SubmitAssessmentDto,
  ) {
    return this.mentalHealthService.submitAssessment(user.userId, dto);
  }

  @Post('pattern/compute')
  async computePattern(@CurrentUser() user: { userId: string }) {
    return this.mentalHealthService.computePattern(user.userId);
  }

  @Get('pattern/latest')
  async getLatestPattern(@CurrentUser() user: { userId: string }) {
    return this.mentalHealthService.getLatestPattern(user.userId);
  }

  @Get('history')
  async getHistory(
    @CurrentUser() user: { userId: string },
    @Query('type') type?: string,
  ) {
    return this.mentalHealthService.getAssessmentHistory(user.userId, type);
  }

  @Get('timeline')
  async getTimeline(
    @CurrentUser() user: { userId: string },
    @Query('type') type: 'phq9' | 'gad7' | 'pss10' = 'phq9',
  ) {
    return this.mentalHealthService.getScoreTimeline(user.userId, type);
  }
}
