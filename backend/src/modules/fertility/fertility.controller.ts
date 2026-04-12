import { Body, Controller, Get, Post } from '@nestjs/common';
import { FertilityService } from './fertility.service';
import { CurrentUser } from '../auth/current-user.decorator';
import { LogFertilityDto } from './dto/log-fertility.dto';

@Controller('fertility')
export class FertilityController {
  constructor(private readonly service: FertilityService) {}

  @Post('log')
  logDay(
    @CurrentUser() user: { userId: string },
    @Body() dto: LogFertilityDto,
  ) {
    return this.service.logDay(user.userId, dto);
  }

  @Get('logs')
  getLogs(@CurrentUser() user: { userId: string }) {
    return this.service.getLogs(user.userId);
  }

  @Get('fertile-window')
  getFertileWindow(@CurrentUser() user: { userId: string }) {
    return this.service.getFertileWindow(user.userId);
  }

  @Get('chart')
  getChart(@CurrentUser() user: { userId: string }) {
    return this.service.getChart(user.userId);
  }
}
