import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TrainerController, CompanionController } from './trainer.controller';
import { TrainerService } from './trainer.service';
import { TrainerStudentLink } from './entities/trainer-student-link.entity';
import { FamilyLink } from './entities/family-link.entity';
import { User } from '../users/entities/user.entity';
import { Notifications } from '../notifications/entities/notifications.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TrainerStudentLink,
      FamilyLink,
      User,
      Notifications,
    ]),
  ],
  controllers: [TrainerController, CompanionController],
  providers: [TrainerService],
  exports: [TrainerService],
})
export class TrainerModule {}
