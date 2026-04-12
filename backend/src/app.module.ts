import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { User } from './modules/users/entities/user.entity';

import { AuthModule } from './modules/auth/auth.module';
import { JwtAuthGuard } from './modules/auth/jwt-auth.guard';
import { OnboardingGuard } from './modules/auth/guards/onboarding.guard';
import { UsersModule } from './modules/users/users.module';
import { OnboardingModule } from './modules/onboarding/onboarding.module';
import { CycleModule } from './modules/cycle/cycle.module';
import { MoodModule } from './modules/mood/mood.module';
import { TrainingModule } from './modules/training/training.module';
import { NutritionModule } from './modules/nutrition/nutrition.module';
import { ProgramsModule } from './modules/programs/programs.module';
import { WearablesModule } from './modules/wearables/wearables.module';
import { GlucometerModule } from './modules/glucometer/glucometer.module';
import { BloodPressureModule } from './modules/blood-pressure/blood-pressure.module';
import { LabExamsModule } from './modules/lab-exams/lab-exams.module';
import { AppointmentsModule } from './modules/appointments/appointments.module';
import { TeleconsultModule } from './modules/teleconsult/teleconsult.module';
import { ChatModule } from './modules/chat/chat.module';
import { EliahealthIntegrationModule } from './modules/eliahealth-integration/eliahealth-integration.module';
import { ContentModule } from './modules/content/content.module';
import { CoursesModule } from './modules/courses/courses.module';
import { CommunityModule } from './modules/community/community.module';
import { MarketplaceModule } from './modules/marketplace/marketplace.module';
import { AdsModule } from './modules/ads/ads.module';
import { ResearchModule } from './modules/research/research.module';
import { ConsentModule } from './modules/consent/consent.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { TenantModule } from './modules/tenant/tenant.module';
import { AiEngineModule } from './modules/ai-engine/ai-engine.module';
import { ActivitiesModule } from './modules/activities/activities.module';
import { ChallengesModule } from './modules/challenges/challenges.module';
import { FeedModule } from './modules/feed/feed.module';
import { CycleGroupModule } from './modules/cycle-group/cycle-group.module';
import { CommunityChatModule } from './modules/community-chat/community-chat.module';
import { MediaModule } from './modules/media/media.module';
import { StoriesModule } from './modules/stories/stories.module';
import { TrainerModule } from './modules/trainer/trainer.module';
import { AcademyModule } from './modules/academy/academy.module';
import { WeightLossModule } from './modules/weight-loss/weight-loss.module';
import { CalendarModule } from './modules/calendar/calendar.module';
import { GamificationModule } from './modules/gamification/gamification.module';
import { LabAnalysisModule } from './modules/lab-analysis/lab-analysis.module';
import { AthleteModule } from './modules/athlete/athlete.module';
import { PregnancyModule } from './modules/pregnancy/pregnancy.module';
import { MenopauseModule } from './modules/menopause/menopause.module';
import { MentalHealthModule } from './modules/mental-health/mental-health.module';
import { FertilityModule } from './modules/fertility/fertility.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 300 }]),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST,
      port: parseInt(process.env.DATABASE_PORT ?? '5432', 10),
      username: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASS,
      database: process.env.DATABASE_NAME,
      autoLoadEntities: true,
      synchronize: process.env.NODE_ENV !== 'production',
    }),
    TypeOrmModule.forFeature([User]),
    AuthModule,
    UsersModule,
    OnboardingModule,
    CycleModule,
    MoodModule,
    TrainingModule,
    NutritionModule,
    ProgramsModule,
    WearablesModule,
    GlucometerModule,
    BloodPressureModule,
    LabExamsModule,
    AppointmentsModule,
    TeleconsultModule,
    ChatModule,
    EliahealthIntegrationModule,
    ContentModule,
    CoursesModule,
    CommunityModule,
    MarketplaceModule,
    AdsModule,
    ResearchModule,
    ConsentModule,
    NotificationsModule,
    TenantModule,
    AiEngineModule,
    ActivitiesModule,
    ChallengesModule,
    FeedModule,
    CycleGroupModule,
    CommunityChatModule,
    MediaModule,
    StoriesModule,
    TrainerModule,
    AcademyModule,
    WeightLossModule,
    CalendarModule,
    GamificationModule,
    LabAnalysisModule,
    AthleteModule,
    PregnancyModule,
    MenopauseModule,
    MentalHealthModule,
    FertilityModule,
  ],
  controllers: [AppController],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: OnboardingGuard },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
