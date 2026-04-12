import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { AiEngineService } from './ai-engine.service';
import { CurrentUser } from '../auth/current-user.decorator';
import { FemaleZoneOnly } from '../auth/decorators/female-zone.decorator';

@Controller('ai-engine')
@FemaleZoneOnly()
export class AiEngineController {
  constructor(private readonly service: AiEngineService) {}

  @Get('insights')
  insights(@CurrentUser() user: { userId: string }) {
    return this.service.generateInsights(user.userId);
  }

  @Get('training-plan')
  getTrainingPlan(@CurrentUser() user: { userId: string }) {
    return this.service.generateTrainingPlan(user.userId);
  }

  @Post('training-plan')
  trainingPlan(@CurrentUser() user: { userId: string }) {
    return this.service.generateTrainingPlan(user.userId);
  }

  @Get('nutrition-plan')
  getNutritionPlan(@CurrentUser() user: { userId: string }) {
    return this.service.generateNutritionPlan(user.userId);
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

  @Post('chat')
  chat(@CurrentUser() user: { userId: string }, @Body() dto: { message: string }) {
    return this.service.chat(user.userId, dto.message);
  }
}
