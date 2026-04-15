import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuditLogService } from './audit-log.service';
import { CurrentUser } from '../auth/current-user.decorator';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@Controller('audit-logs')
@UseGuards(RolesGuard)
@Roles('admin', 'tenant_admin', 'academy_admin')
export class AuditLogController {
  constructor(private readonly service: AuditLogService) {}

  @Get()
  findAll(
    @CurrentUser() user: { tenantId: string },
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.service.findAll(
      user.tenantId,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 30,
    );
  }
}
