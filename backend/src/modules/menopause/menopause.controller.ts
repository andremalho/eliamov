import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { MenopauseService } from './menopause.service';
import { CurrentUser } from '../auth/current-user.decorator';
import { CreateMenopauseProfileDto } from './dto/create-menopause-profile.dto';
import { CreateMenopauseLogDto } from './dto/create-menopause-log.dto';

@Controller('menopause')
export class MenopauseController {
  constructor(private readonly service: MenopauseService) {}

  @Post('profile')
  createProfile(
    @CurrentUser() user: { userId: string },
    @Body() dto: CreateMenopauseProfileDto,
  ) {
    return this.service.createProfile(user.userId, dto);
  }

  @Get('profile')
  getProfile(@CurrentUser() user: { userId: string }) {
    return this.service.getProfile(user.userId);
  }

  @Post('log')
  logDay(
    @CurrentUser() user: { userId: string },
    @Body() dto: CreateMenopauseLogDto,
  ) {
    return this.service.logDay(user.userId, dto);
  }

  @Get('logs')
  getLogs(@CurrentUser() user: { userId: string }) {
    return this.service.getLogs(user.userId);
  }

  @Get('mrs-score')
  getMrsScore(@CurrentUser() user: { userId: string }) {
    return this.service.calculateMRS(user.userId);
  }

  @Get('recommendations')
  getRecommendations(@Query('stage') stage?: string) {
    return this.service.getRecommendations(stage ?? 'perimenopause');
  }
}
