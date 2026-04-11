import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { WeightLossService } from './weight-loss.service';
import { CreateAssessmentDto } from './dto/create-assessment.dto';
import { CheckinDto } from './dto/checkin.dto';
import { MealPlanDto } from './dto/meal-plan.dto';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('weight-loss')
export class WeightLossController {
  constructor(private readonly service: WeightLossService) {}

  @Post('assessment')
  createAssessment(
    @CurrentUser() user: { userId: string; tenantId: string },
    @Body() dto: CreateAssessmentDto,
  ) {
    return this.service.createAssessment(user.userId, user.tenantId, dto);
  }

  @Get('assessment')
  getAssessment(@CurrentUser() user: { userId: string }) {
    return this.service.getAssessment(user.userId);
  }

  @Post('checkin')
  createCheckin(
    @CurrentUser() user: { userId: string },
    @Body() dto: CheckinDto & { assessmentId: string },
  ) {
    return this.service.createCheckin(user.userId, dto.assessmentId, dto);
  }

  @Get('progress')
  getProgress(
    @CurrentUser() user: { userId: string },
    @Query('assessmentId') assessmentId: string,
  ) {
    return this.service.getProgress(user.userId, assessmentId);
  }

  @Post('meal-plan')
  generateMealPlan(
    @CurrentUser() user: { userId: string },
    @Body() dto: MealPlanDto,
  ) {
    return this.service.generateMealPlan(user.userId, dto as any);
  }
}
