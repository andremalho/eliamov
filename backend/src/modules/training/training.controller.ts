import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { TrainingService } from './training.service';
import { CreateTrainingDto } from './dto/create-training.dto';
import { CreateCustomWorkoutDto } from './dto/create-custom-workout.dto';
import { CreateWorkoutLogDto } from './dto/create-workout-log.dto';
import { CurrentUser } from '../auth/current-user.decorator';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

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

  // --- Workout Logs ---
  @Post('logs')
  createLog(@CurrentUser() user: { userId: string }, @Body() dto: CreateWorkoutLogDto) {
    return this.service.createWorkoutLog(user.userId, dto);
  }

  @Get('logs')
  getLogs(@CurrentUser() user: { userId: string }, @Query('page') page?: string) {
    return this.service.findWorkoutLogs(user.userId, page ? parseInt(page, 10) : 1);
  }

  @Get('progress')
  getProgress(@CurrentUser() user: { userId: string }) {
    return this.service.getProgressStats(user.userId);
  }

  // --- Admin: Custom Workouts ---
  @Get('admin/workouts')
  @UseGuards(RolesGuard)
  @Roles('admin', 'tenant_admin')
  getFullLibrary(@CurrentUser() user: { tenantId: string }) {
    return this.service.getFullLibrary(user.tenantId);
  }

  @Post('admin/workouts')
  @UseGuards(RolesGuard)
  @Roles('admin', 'tenant_admin')
  createCustomWorkout(@CurrentUser() user: { userId: string }, @Body() dto: CreateCustomWorkoutDto) {
    return this.service.createCustomWorkout(user.userId, dto);
  }

  @Patch('admin/workouts/:id')
  @UseGuards(RolesGuard)
  @Roles('admin', 'tenant_admin')
  updateCustomWorkout(@Param('id') id: string, @Body() dto: Partial<CreateCustomWorkoutDto>) {
    return this.service.updateCustomWorkout(id, dto);
  }

  @Delete('admin/workouts/:id')
  @UseGuards(RolesGuard)
  @Roles('admin', 'tenant_admin')
  removeCustomWorkout(@Param('id') id: string) {
    return this.service.removeCustomWorkout(id);
  }
}
