import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notifications } from './entities/notifications.entity';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Notifications])],
  controllers: [NotificationsController],
  providers: [NotificationsService],
})
export class NotificationsModule {}
