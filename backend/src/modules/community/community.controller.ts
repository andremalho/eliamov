import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { CommunityService } from './community.service';
import { CreateCommunityDto } from './dto/create-community.dto';
import { CurrentUser } from '../auth/current-user.decorator';
import { PaginationDto } from '../../common/pagination.dto';

@Controller('community')
export class CommunityController {
  constructor(private readonly service: CommunityService) {}

  @Get()
  findAll(@Query() pagination: PaginationDto) {
    return this.service.findAll(pagination);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Get(':id/replies')
  findReplies(@Param('id') id: string) {
    return this.service.findReplies(id);
  }

  @Post()
  create(@CurrentUser() user: { userId: string }, @Body() dto: CreateCommunityDto) {
    return this.service.createForUser(user.userId, dto);
  }

  @Patch(':id/like')
  like(@Param('id') id: string) {
    return this.service.likePost(id);
  }

  @Delete(':id')
  remove(@CurrentUser() user: { userId: string }, @Param('id') id: string) {
    return this.service.removeForUser(user.userId, id);
  }
}
