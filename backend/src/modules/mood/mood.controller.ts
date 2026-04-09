import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { MoodService } from './mood.service';
import { CreateMoodDto } from './dto/create-mood.dto';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('mood')
export class MoodController {
  constructor(private readonly service: MoodService) {}

  @Get()
  findAll(@CurrentUser() user: { userId: string }) {
    return this.service.findAllForUser(user.userId);
  }

  @Get('summary')
  summary(@CurrentUser() user: { userId: string }) {
    return this.service.summary(user.userId);
  }

  @Post()
  create(@CurrentUser() user: { userId: string }, @Body() dto: CreateMoodDto) {
    return this.service.createForUser(user.userId, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: { userId: string }, @Param('id') id: string) {
    return this.service.removeForUser(user.userId, id);
  }
}
