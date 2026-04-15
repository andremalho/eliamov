import { Module } from '@nestjs/common';
import { AiEngineService } from './ai-engine.service';
import { AiEngineController } from './ai-engine.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CycleModule } from '../cycle/cycle.module';
import { MoodModule } from '../mood/mood.module';
import { GlucometerModule } from '../glucometer/glucometer.module';
import { BloodPressureModule } from '../blood-pressure/blood-pressure.module';
import { User } from '../users/entities/user.entity';
import { ChatMessage } from '../chat/entities/chat.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, ChatMessage]),
    CycleModule,
    MoodModule,
    GlucometerModule,
    BloodPressureModule,
  ],
  controllers: [AiEngineController],
  providers: [AiEngineService],
  exports: [AiEngineService],
})
export class AiEngineModule {}
