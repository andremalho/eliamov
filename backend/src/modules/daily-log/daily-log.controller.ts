import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { DailyLogService } from './daily-log.service';
import { CurrentUser } from '../auth/current-user.decorator';
import { FemaleZoneOnly } from '../auth/decorators/female-zone.decorator';
import { UpsertDailyLogDto } from './dto/upsert-daily-log.dto';

@Controller('daily-log')
@FemaleZoneOnly()
export class DailyLogController {
  constructor(private readonly dailyLogService: DailyLogService) {}

  @Post()
  upsert(@CurrentUser() user: { userId: string }, @Body() dto: UpsertDailyLogDto) {
    return this.dailyLogService.upsert(user.userId, dto);
  }

  @Get('today')
  getToday(@CurrentUser() user: { userId: string }) {
    const today = new Date().toISOString().split('T')[0];
    return this.dailyLogService.findByDate(user.userId, today);
  }

  @Get('range')
  getRange(@CurrentUser() user: { userId: string }, @Query('from') from: string, @Query('to') to: string) {
    return this.dailyLogService.findRange(user.userId, from, to);
  }

  @Get('last30')
  getLast30(@CurrentUser() user: { userId: string }) {
    return this.dailyLogService.findLast30(user.userId);
  }
}
