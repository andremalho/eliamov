import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { CycleService } from './cycle.service';
import { CreateCycleDto } from './dto/create-cycle.dto';
import { CurrentUser } from '../auth/current-user.decorator';
import { FemaleZoneOnly } from '../auth/decorators/female-zone.decorator';

@Controller('cycle')
@FemaleZoneOnly()
export class CycleController {
  constructor(private readonly service: CycleService) {}

  @Get()
  findAll(@CurrentUser() user: { userId: string }) {
    return this.service.findAllForUser(user.userId);
  }

  @Get('current')
  current(@CurrentUser() user: { userId: string }) {
    return this.service.getCurrentPhase(user.userId);
  }

  @Post()
  create(@CurrentUser() user: { userId: string }, @Body() dto: CreateCycleDto) {
    return this.service.createForUser(user.userId, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: { userId: string }, @Param('id') id: string) {
    return this.service.removeForUser(user.userId, id);
  }
}
