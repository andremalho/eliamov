import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ActivitiesService } from './activities.service';
import { CreateActivityDto } from './dto/create-activity.dto';
import { CurrentUser } from '../auth/current-user.decorator';
import { Public } from '../auth/public.decorator';
import { PaginationDto } from '../../common/pagination.dto';

@Controller('activities')
export class ActivitiesController {
  constructor(private readonly service: ActivitiesService) {}

  @Get()
  findAll(
    @CurrentUser() user: { userId: string },
    @Query() pagination: PaginationDto,
  ) {
    return this.service.findAllForUser(user.userId, pagination);
  }

  @Public()
  @Get('public/:shareToken')
  findByShareToken(@Param('shareToken') shareToken: string) {
    return this.service.findByShareToken(shareToken);
  }

  @Get(':id')
  findOne(@CurrentUser() user: { userId: string }, @Param('id') id: string) {
    return this.service.findOneForUser(user.userId, id);
  }

  @Post()
  create(
    @CurrentUser() user: { userId: string },
    @Body() dto: CreateActivityDto,
  ) {
    return this.service.createForUser(user.userId, dto);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
    @Body() dto: any,
  ) {
    return this.service.updateForUser(user.userId, id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: { userId: string }, @Param('id') id: string) {
    return this.service.removeForUser(user.userId, id);
  }
}
