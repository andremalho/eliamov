import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { BloodPressureService } from './blood-pressure.service';
import { CreateBloodPressureDto } from './dto/create-blood-pressure.dto';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('blood-pressure')
export class BloodPressureController {
  constructor(private readonly service: BloodPressureService) {}

  @Get()
  findAll(@CurrentUser() user: { userId: string }) {
    return this.service.findAllForUser(user.userId);
  }

  @Get('summary')
  summary(@CurrentUser() user: { userId: string }) {
    return this.service.summary(user.userId);
  }

  @Post()
  create(@CurrentUser() user: { userId: string }, @Body() dto: CreateBloodPressureDto) {
    return this.service.createForUser(user.userId, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: { userId: string }, @Param('id') id: string) {
    return this.service.removeForUser(user.userId, id);
  }
}
