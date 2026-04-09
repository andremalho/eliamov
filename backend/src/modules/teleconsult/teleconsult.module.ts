import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeleconsultSession } from './entities/teleconsult.entity';
import { TeleconsultService } from './teleconsult.service';
import { TeleconsultController } from './teleconsult.controller';

@Module({
  imports: [TypeOrmModule.forFeature([TeleconsultSession])],
  controllers: [TeleconsultController],
  providers: [TeleconsultService],
})
export class TeleconsultModule {}
