import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { RecipesService } from './recipes.service';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { RecipeQueryDto } from './dto/recipe-query.dto';
import { CurrentUser } from '../auth/current-user.decorator';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@Controller('recipes')
export class RecipesController {
  constructor(private readonly service: RecipesService) {}

  @Get()
  findAll(@CurrentUser() user: { userId: string; tenantId: string }, @Query() query: RecipeQueryDto) {
    return this.service.findAll(user.tenantId, user.userId, query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('admin', 'tenant_admin')
  create(@CurrentUser() user: { userId: string }, @Body() dto: CreateRecipeDto) {
    return this.service.create(user.userId, dto);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('admin', 'tenant_admin')
  update(@Param('id') id: string, @Body() dto: Partial<CreateRecipeDto>) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('admin', 'tenant_admin')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
