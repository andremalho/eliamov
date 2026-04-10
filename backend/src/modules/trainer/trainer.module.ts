import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TrainerController, CompanionController } from './trainer.controller';
import { TrainerService } from './trainer.service';
import { TrainerStudentLink } from './entities/trainer-student-link.entity';
import { FamilyLink } from './entities/family-link.entity';
import { TrainerPrescription } from './entities/trainer-prescription.entity';
import { TrainerComment } from './entities/trainer-comment.entity';
import { User } from '../users/entities/user.entity';
import { Notifications } from '../notifications/entities/notifications.entity';
import { Activity } from '../activities/entities/activity.entity';
import { WeightEntry } from '../nutrition/entities/weight-entry.entity';
import { TrainerAccessGuard } from './guards/trainer-access.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TrainerStudentLink,
      FamilyLink,
      TrainerPrescription,
      TrainerComment,
      User,
      Notifications,
      Activity,
      WeightEntry,
    ]),
  ],
  controllers: [TrainerController, CompanionController],
  providers: [TrainerService, TrainerAccessGuard],
  exports: [TrainerService],
})
export class TrainerModule {}
