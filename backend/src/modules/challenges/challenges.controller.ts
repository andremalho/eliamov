import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ChallengesService } from './challenges.service';
import { CreateChallengeDto } from './dto/create-challenge.dto';
import { PaginationDto } from '../../common/pagination.dto';
import { CurrentUser } from '../auth/current-user.decorator';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@Controller('challenges')
export class ChallengesController {
  constructor(private readonly service: ChallengesService) {}

  @Get()
  async findActive(
    @CurrentUser() user: { userId: string; tenantId: string },
  ) {
    const challenges = await this.service.findActive(user.tenantId);
    const ids = challenges.map((c) => c.id);
    const participations = await this.service.getMyParticipations(
      user.userId,
      ids,
    );
    const participationMap = new Map(
      participations.map((p) => [p.challengeId, p]),
    );
    return challenges.map((c) => ({
      ...c,
      joined: participationMap.has(c.id),
      myProgress: participationMap.get(c.id)?.currentProgress ?? 0,
      myCompleted: participationMap.get(c.id)?.completedAt ?? null,
    }));
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('admin', 'tenant_admin')
  create(
    @CurrentUser() user: { userId: string; tenantId: string },
    @Body() dto: CreateChallengeDto,
  ) {
    return this.service.create(user.tenantId, user.userId, dto);
  }

  @Post(':id/join')
  join(@CurrentUser() user: { userId: string }, @Param('id') id: string) {
    return this.service.join(id, user.userId);
  }

  @Get(':id/leaderboard')
  leaderboard(
    @Param('id') id: string,
    @Query() pagination: PaginationDto,
  ) {
    return this.service.leaderboard(id, pagination);
  }
}
