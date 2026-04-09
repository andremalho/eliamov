import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WearableConnection } from './entities/wearable-connection.entity';
import { WearableData } from './entities/wearable-data.entity';
import { WearablesService } from './wearables.service';
import { WearablesController } from './wearables.controller';

@Module({
  imports: [TypeOrmModule.forFeature([WearableConnection, WearableData])],
  controllers: [WearablesController],
  providers: [WearablesService],
})
export class WearablesModule {}
