import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { NutritionService } from './nutrition.service';
import { CreateNutritionDto } from './dto/create-nutrition.dto';
import { CreateWeightEntryDto } from './dto/create-weight-entry.dto';
import { CreateNutritionGoalDto } from './dto/create-nutrition-goal.dto';
import { CurrentUser } from '../auth/current-user.decorator';
import { PaginationDto } from '../../common/pagination.dto';

@Controller('nutrition')
export class NutritionController {
  constructor(private readonly service: NutritionService) {}

  // ── summaries (must be before :id to avoid route collision) ────

  @Get('summary/daily')
  dailySummary(@CurrentUser() user: { userId: string }, @Query('date') date: string) {
    return this.service.dailySummary(user.userId, date);
  }

  @Get('summary/week')
  weekSummary(@CurrentUser() user: { userId: string }) {
    return this.service.weekSummary(user.userId);
  }

  // ── goals ──────────────────────────────────────────────────────

  @Get('goal')
  getGoal(@CurrentUser() user: { userId: string }) {
    return this.service.getGoal(user.userId);
  }

  @Patch('goal')
  setGoal(@CurrentUser() user: { userId: string }, @Body() dto: CreateNutritionGoalDto) {
    return this.service.setGoal(user.userId, dto);
  }

  // ── weight tracking ────────────────────────────────────────────

  @Get('weight')
  listWeights(@CurrentUser() user: { userId: string }) {
    return this.service.listWeights(user.userId);
  }

  @Post('weight')
  createWeight(@CurrentUser() user: { userId: string }, @Body() dto: CreateWeightEntryDto) {
    return this.service.createWeight(user.userId, dto);
  }

  @Delete('weight/:id')
  removeWeight(@CurrentUser() user: { userId: string }, @Param('id') id: string) {
    return this.service.removeWeight(user.userId, id);
  }

  // ── existing CRUD (generic :id routes last) ────────────────────

  @Get()
  findAll(@CurrentUser() user: { userId: string }, @Query() pagination: PaginationDto) {
    return this.service.findAllForUser(user.userId, pagination);
  }

  @Get(':id')
  findOne(@CurrentUser() user: { userId: string }, @Param('id') id: string) {
    return this.service.findOneForUser(user.userId, id);
  }

  @Post()
  create(@CurrentUser() user: { userId: string }, @Body() dto: CreateNutritionDto) {
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
