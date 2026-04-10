import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';

import { AuthModule } from './modules/auth/auth.module';
import { JwtAuthGuard } from './modules/auth/jwt-auth.guard';
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

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 30 }]),
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
  ],
  controllers: [AppController],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
