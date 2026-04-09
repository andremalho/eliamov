import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { NutritionService } from './nutrition.service';
import { CreateNutritionDto } from './dto/create-nutrition.dto';
import { CurrentUser } from '../auth/current-user.decorator';
import { PaginationDto } from '../../common/pagination.dto';

@Controller('nutrition')
export class NutritionController {
  constructor(private readonly service: NutritionService) {}

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
