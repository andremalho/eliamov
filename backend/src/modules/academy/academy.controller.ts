import { Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
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
}
