import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { LabExamsService } from './lab-exams.service';
import { CreateLabExamsDto } from './dto/create-lab-exams.dto';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('lab-exams')
export class LabExamsController {
  constructor(private readonly service: LabExamsService) {}

  @Get()
  findAll(@CurrentUser() user: { userId: string }) {
    return this.service.findAllForUser(user.userId);
  }

  @Get(':id')
  findOne(@CurrentUser() user: { userId: string }, @Param('id') id: string) {
    return this.service.findOneForUser(user.userId, id);
  }

  @Post()
  create(@CurrentUser() user: { userId: string }, @Body() dto: CreateLabExamsDto) {
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
