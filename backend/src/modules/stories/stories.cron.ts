import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { StoriesService } from './stories.service';

@Injectable()
export class StoriesCron {
  private readonly logger = new Logger(StoriesCron.name);

  constructor(private readonly storiesService: StoriesService) {}

  @Cron(CronExpression.EVERY_HOUR)
  async cleanupExpiredStories() {
    this.logger.log('Running expired stories cleanup...');
    const count = await this.storiesService.cleanupExpired();
    this.logger.log(`Cleaned up ${count} expired stories`);
  }
}
