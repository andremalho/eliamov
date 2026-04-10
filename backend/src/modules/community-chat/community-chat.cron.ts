import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CommunityChatService } from './community-chat.service';
import { Tenant } from '../tenant/entities/tenant.entity';

@Injectable()
export class CommunityChatCron {
  private readonly logger = new Logger(CommunityChatCron.name);

  constructor(
    private readonly chatService: CommunityChatService,
    @InjectRepository(Tenant)
    private readonly tenantRepo: Repository<Tenant>,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_6AM)
  async syncCycleGroups() {
    this.logger.log('Starting daily cycle group sync...');
    const tenants = await this.tenantRepo.find();
    for (const tenant of tenants) {
      try {
        await this.chatService.syncCycleGroups(tenant.id);
      } catch (err) {
        this.logger.error(
          `Failed to sync cycle groups for tenant ${tenant.id}`,
          err as any,
        );
      }
    }
    this.logger.log('Cycle group sync complete');
  }
}
