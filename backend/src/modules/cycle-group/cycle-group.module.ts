import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CycleEntry } from '../cycle/entities/cycle.entity';
import { User } from '../users/entities/user.entity';
import { Notifications } from '../notifications/entities/notifications.entity';
import { Post } from '../feed/entities/post.entity';
import { GroupWorkout } from './entities/group-workout.entity';
import { CycleGroupService } from './cycle-group.service';
import { CycleGroupController } from './cycle-group.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CycleEntry,
      User,
      GroupWorkout,
      Notifications,
      Post,
    ]),
  ],
  controllers: [CycleGroupController],
  providers: [CycleGroupService],
  exports: [CycleGroupService],
})
export class CycleGroupModule {}
