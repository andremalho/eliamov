import { Controller, Get, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { ReportService } from './report.service';
import { CurrentUser } from '../auth/current-user.decorator';
import { FemaleZoneOnly } from '../auth/decorators/female-zone.decorator';

@Controller('report')
@FemaleZoneOnly()
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Get('consultation')
  async generateConsultationReport(
    @CurrentUser() user: { userId: string; name?: string },
    @Query('name') name: string,
    @Res() res: Response,
  ) {
    return this.reportService.generateConsultationReport(user.userId, name ?? 'Paciente', res);
  }
}
