import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { EliahealthIntegrationService } from './eliahealth-integration.service';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('eliahealth-integration')
export class EliahealthIntegrationController {
  constructor(private readonly service: EliahealthIntegrationService) {}

  @Get('patient/:id')
  getPatient(@CurrentUser() user: { userId: string }, @Param('id') id: string) {
    return this.service.getPatientRecord(user.userId, id);
  }

  @Post('sync')
  sync(@CurrentUser() user: { userId: string }, @Body() body: { data: any }) {
    return this.service.syncData(user.userId, body.data);
  }
}
