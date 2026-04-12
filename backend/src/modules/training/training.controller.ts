import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { TrainingService } from './training.service';
import { CreateTrainingDto } from './dto/create-training.dto';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('training')
export class TrainingController {
  constructor(private readonly service: TrainingService) {}

  @Get()
  findAll(@CurrentUser() user: { userId: string }) {
    return this.service.findAllForUser(user.userId);
  }

  @Get('today')
  getTodayWorkout(@CurrentUser() user: { userId: string }) {
    return this.service.getTodayWorkout(user.userId);
  }

  @Get('library')
  getLibrary() {
    return this.service.getLibrary();
  }

  @Get('library/:phase')
  getLibraryByPhase(@Param('phase') phase: string) {
    return this.service.getLibraryByPhase(phase);
  }

  @Get(':id')
  findOne(@CurrentUser() user: { userId: string }, @Param('id') id: string) {
    return this.service.findOneForUser(user.userId, id);
  }

  @Post()
  create(@CurrentUser() user: { userId: string }, @Body() dto: CreateTrainingDto) {
    return this.service.createForUser(user.userId, dto);
  }

  @Patch(':id')
  update(@CurrentUser() user: { userId: string }, @Param('id') id: string, @Body() dto: any) {
    return this.service.updateForUser(user.userId, id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: { userId: string }, @Param('id') id: string) {
    return this.service.removeForUser(user.userId, id);
  }
}
