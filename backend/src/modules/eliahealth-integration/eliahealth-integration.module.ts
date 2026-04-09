import { Module } from '@nestjs/common';
import { EliahealthIntegrationService } from './eliahealth-integration.service';
import { EliahealthIntegrationController } from './eliahealth-integration.controller';
import { ConsentModule } from '../consent/consent.module';

@Module({
  imports: [ConsentModule],
  controllers: [EliahealthIntegrationController],
  providers: [EliahealthIntegrationService],
  exports: [EliahealthIntegrationService],
})
export class EliahealthIntegrationModule {}
