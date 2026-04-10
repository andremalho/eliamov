import { Controller, Get, Post, Body } from '@nestjs/common';
import { CycleGroupService } from './cycle-group.service';
import { CreateGroupWorkoutDto } from './dto/create-group-workout.dto';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('cycle-groups')
export class CycleGroupController {
  constructor(private readonly service: CycleGroupService) {}

  @Get('peers')
  getPeers(@CurrentUser() user: { userId: string; tenantId: string }) {
    return this.service.getPeers(user.userId, user.tenantId);
  }

  @Post('workout')
  createWorkout(
    @CurrentUser() user: { userId: string; tenantId: string },
    @Body() dto: CreateGroupWorkoutDto,
  ) {
    return this.service.createGroupWorkout(user.userId, user.tenantId, dto);
  }
}
