import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { AiEngineService } from './ai-engine.service';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('ai-engine')
export class AiEngineController {
  constructor(private readonly service: AiEngineService) {}

  @Get('insights')
  insights(@CurrentUser() user: { userId: string }) {
    return this.service.generateInsights(user.userId);
  }

  @Post('training-plan')
  trainingPlan(@CurrentUser() user: { userId: string }) {
    return this.service.generateTrainingPlan(user.userId);
  }

  @Post('nutrition-plan')
  nutritionPlan(@CurrentUser() user: { userId: string }) {
    return this.service.generateNutritionPlan(user.userId);
  }

  @Post('analyze-lab')
  analyzeLab(@Body() examData: any) {
    return this.service.analyzeLabExam(examData);
  }

  @Get('pubmed')
  pubmed(@Query('q') q: string) {
    return this.service.searchPubmed(q);
  }
}
