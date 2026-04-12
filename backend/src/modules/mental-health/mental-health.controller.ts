import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { MentalHealthService } from './mental-health.service';
import { CurrentUser } from '../auth/current-user.decorator';
import { SubmitAssessmentDto } from './dto/submit-assessment.dto';

@Controller('mental-health')
export class MentalHealthController {
  constructor(private readonly service: MentalHealthService) {}

  @Get('questions/:type')
  getQuestions(@Param('type') type: 'phq9' | 'gad7') {
    return this.service.getQuestions(type);
  }

  @Post('assessment')
  submitAssessment(
    @CurrentUser() user: { userId: string },
    @Body() dto: SubmitAssessmentDto,
  ) {
    return this.service.submitAssessment(user.userId, dto.type, dto.answers);
  }

  @Get('history/:type')
  getHistory(
    @CurrentUser() user: { userId: string },
    @Param('type') type: 'phq9' | 'gad7',
  ) {
    return this.service.getHistory(user.userId, type);
  }

  @Get('latest')
  getLatest(@CurrentUser() user: { userId: string }) {
    return this.service.getLatest(user.userId);
  }

  @Get('meditations')
  getMeditations(@CurrentUser() user: { userId: string }) {
    return this.service.getMeditationSuggestions(user.userId);
  }
}
