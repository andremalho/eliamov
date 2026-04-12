import { Body, Controller, Get, Post } from '@nestjs/common';
import { AthleteService } from './athlete.service';
import { CreatePerformanceLogDto } from './dto/create-performance-log.dto';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('athlete')
export class AthleteController {
  constructor(private readonly service: AthleteService) {}

  @Post('log')
  logPerformance(
    @CurrentUser() user: { userId: string },
    @Body() dto: CreatePerformanceLogDto,
  ) {
    return this.service.logPerformance(user.userId, dto);
  }

  @Get('dashboard')
  getDashboard(@CurrentUser() user: { userId: string }) {
    return this.service.getDashboard(user.userId);
  }

  @Get('acwr')
  getACWR(@CurrentUser() user: { userId: string }) {
    return this.service.getACWR(user.userId);
  }
}
