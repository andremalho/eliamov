import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { Community } from './entities/community.entity';
import { CommunityMember } from './entities/community-member.entity';
import { Message } from './entities/message.entity';
import { CommunityInvite } from './entities/community-invite.entity';
import { CycleEntry } from '../cycle/entities/cycle.entity';
import { User } from '../users/entities/user.entity';
import { Notifications } from '../notifications/entities/notifications.entity';
import { Tenant } from '../tenant/entities/tenant.entity';
import { CommunityChatService } from './community-chat.service';
import { CommunityChatController } from './community-chat.controller';
import { CommunityChatGateway } from './community-chat.gateway';
import { CommunityChatCron } from './community-chat.cron';
import { MediaModule } from '../media/media.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([
      Community,
      CommunityMember,
      Message,
      CommunityInvite,
      CycleEntry,
      User,
      Notifications,
      Tenant,
    ]),
    MediaModule,
  ],
  controllers: [CommunityChatController],
  providers: [CommunityChatService, CommunityChatGateway, CommunityChatCron],
  exports: [CommunityChatService],
})
export class CommunityChatModule {}
