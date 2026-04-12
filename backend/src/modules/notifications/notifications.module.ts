import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { Notifications } from './entities/notifications.entity';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { NotificationScheduler } from './notification-scheduler';
import { User } from '../users/entities/user.entity';
import { CycleEntry } from '../cycle/entities/cycle.entity';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([Notifications, User, CycleEntry]),
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService, NotificationScheduler],
})
export class NotificationsModule {}
