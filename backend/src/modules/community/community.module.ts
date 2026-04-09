import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommunityPost } from './entities/community.entity';
import { CommunityService } from './community.service';
import { CommunityController } from './community.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CommunityPost])],
  controllers: [CommunityController],
  providers: [CommunityService],
})
export class CommunityModule {}
