import { Controller, Get, Post } from '@nestjs/common';
import { HormonalInsightsService } from './hormonal-insights.service';
import { CurrentUser } from '../auth/current-user.decorator';
import { FemaleZoneOnly } from '../auth/decorators/female-zone.decorator';

@Controller('hormonal-insights')
@FemaleZoneOnly()
export class HormonalInsightsController {
  constructor(private readonly hormonalInsightsService: HormonalInsightsService) {}

  @Post('recompute')
  async recompute(@CurrentUser() user: { userId: string; tenantId: string }) {
    return this.hormonalInsightsService.recomputeForUser(user.userId);
  }

  @Get('latest')
  async getLatest(@CurrentUser() user: { userId: string; tenantId: string }) {
    return this.hormonalInsightsService.findLatestByUser(user.userId);
  }
}
