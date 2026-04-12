import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AcademyController } from './academy.controller';
import { AcademyService } from './academy.service';
import { User } from '../users/entities/user.entity';
import { Activity } from '../activities/entities/activity.entity';
import { Challenge } from '../challenges/entities/challenge.entity';
import { ChallengeParticipant } from '../challenges/entities/challenge-participant.entity';
import { Article } from '../content/entities/article.entity';
import { ContentCategory } from '../content/entities/content-category.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Activity, Challenge, ChallengeParticipant, Article, ContentCategory]),
  ],
  controllers: [AcademyController],
  providers: [AcademyService],
})
export class AcademyModule {}
