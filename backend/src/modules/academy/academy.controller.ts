import { Controller, Get, Header, Post, Query, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { AcademyService } from './academy.service';
import { CurrentUser } from '../auth/current-user.decorator';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@Controller('academy')
@UseGuards(RolesGuard)
@Roles('admin', 'tenant_admin', 'academy_admin', 'academy_manager')
export class AcademyController {
  constructor(private readonly service: AcademyService) {}

  @Get('overview')
  getOverview(@CurrentUser() user: { tenantId: string }) {
    return this.service.getOverview(user.tenantId);
  }

  @Get('dashboard')
  getAdminDashboard(@CurrentUser() user: { tenantId: string }) {
    return this.service.getAdminDashboard(user.tenantId);
  }

  @Get('search')
  globalSearch(@CurrentUser() user: { tenantId: string }, @Query('q') q: string) {
    return this.service.globalSearch(user.tenantId, q ?? '');
  }

  @Post('seed-content')
  async seedContent(@CurrentUser() user: { tenantId: string }) {
    return this.service.seedContent(user.tenantId);
  }

  @Get('export/users')
  async exportUsers(@CurrentUser() user: { tenantId: string }, @Res() res: Response) {
    const csv = await this.service.exportUsersCsv(user.tenantId);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename=usuarios.csv');
    res.send(csv);
  }

  @Get('export/content')
  async exportContent(@CurrentUser() user: { tenantId: string }, @Res() res: Response) {
    const csv = await this.service.exportContentCsv(user.tenantId);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename=conteudo.csv');
    res.send(csv);
  }
}
