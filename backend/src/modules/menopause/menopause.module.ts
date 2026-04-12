import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MenopauseProfile } from './entities/menopause-profile.entity';
import { MenopauseLog } from './entities/menopause-log.entity';
import { MenopauseService } from './menopause.service';
import { MenopauseController } from './menopause.controller';

@Module({
  imports: [TypeOrmModule.forFeature([MenopauseProfile, MenopauseLog])],
  controllers: [MenopauseController],
  providers: [MenopauseService],
})
export class MenopauseModule {}
