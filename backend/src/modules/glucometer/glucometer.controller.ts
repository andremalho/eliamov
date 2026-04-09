import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { GlucometerService } from './glucometer.service';
import { CreateGlucometerDto } from './dto/create-glucometer.dto';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('glucometer')
export class GlucometerController {
  constructor(private readonly service: GlucometerService) {}

  @Get()
  findAll(@CurrentUser() user: { userId: string }) {
    return this.service.findAllForUser(user.userId);
  }

  @Get('summary')
  summary(@CurrentUser() user: { userId: string }) {
    return this.service.summary(user.userId);
  }

  @Post()
  create(@CurrentUser() user: { userId: string }, @Body() dto: CreateGlucometerDto) {
    return this.service.createForUser(user.userId, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: { userId: string }, @Param('id') id: string) {
    return this.service.removeForUser(user.userId, id);
  }
}
