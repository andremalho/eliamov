import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { LabAnalysisService } from './lab-analysis.service';
import { CreateLabResultDto } from './dto/create-lab-result.dto';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('lab-analysis')
export class LabAnalysisController {
  constructor(private readonly service: LabAnalysisService) {}

  @Post()
  create(
    @CurrentUser() user: { userId: string },
    @Body() dto: CreateLabResultDto,
  ) {
    return this.service.create(user.userId, dto);
  }

  @Get()
  findAll(@CurrentUser() user: { userId: string }) {
    return this.service.findAll(user.userId);
  }

  @Get('evolution/:marker')
  getEvolution(
    @CurrentUser() user: { userId: string },
    @Param('marker') marker: string,
  ) {
    return this.service.getEvolution(user.userId, marker);
  }
}
