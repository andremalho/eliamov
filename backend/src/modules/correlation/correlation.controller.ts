import { Controller, Get } from '@nestjs/common';
import { CorrelationService } from './correlation.service';
import { CurrentUser } from '../auth/current-user.decorator';
import { FemaleZoneOnly } from '../auth/decorators/female-zone.decorator';

@Controller('correlation')
@FemaleZoneOnly()
export class CorrelationController {
  constructor(private readonly correlationService: CorrelationService) {}

  @Get('phase-context')
  getPhaseContext(@CurrentUser() user: { userId: string }) {
    return this.correlationService.getPhaseContext(user.userId);
  }
}
