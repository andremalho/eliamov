import { Body, Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { PregnancyService } from './pregnancy.service';
import { CurrentUser } from '../auth/current-user.decorator';
import { CreatePregnancyDto } from './dto/create-pregnancy.dto';
import { LogWeekDto } from './dto/log-week.dto';

@Controller('pregnancy')
export class PregnancyController {
  constructor(private readonly service: PregnancyService) {}

  @Post()
  create(
    @CurrentUser() user: { userId: string },
    @Body() dto: CreatePregnancyDto,
  ) {
    return this.service.create(user.userId, dto);
  }

  @Get()
  getActive(@CurrentUser() user: { userId: string }) {
    return this.service.getActive(user.userId);
  }

  @Post(':id/week')
  logWeek(
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
    @Body() dto: LogWeekDto,
  ) {
    return this.service.logWeek(user.userId, id, dto);
  }

  @Get('week-info/:week')
  getWeekInfo(@Param('week', ParseIntPipe) week: number) {
    return this.service.getWeekInfo(week);
  }
}
