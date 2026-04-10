import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CalendarConnection } from './entities/calendar-connection.entity';
import { Activity } from '../activities/entities/activity.entity';
import { Appointment } from '../appointments/entities/appointment.entity';
import { Challenge } from '../challenges/entities/challenge.entity';
import { CycleEntry } from '../cycle/entities/cycle.entity';
import { CalendarService } from './calendar.service';
import { CalendarController } from './calendar.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CalendarConnection,
      Activity,
      Appointment,
      Challenge,
      CycleEntry,
    ]),
  ],
  controllers: [CalendarController],
  providers: [CalendarService],
  exports: [CalendarService],
})
export class CalendarModule {}
