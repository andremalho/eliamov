import { Controller, Get, Post, Body, Req } from '@nestjs/common';
import { GamificationService } from './gamification.service';
import { AddXpDto } from './dto/add-xp.dto';

@Controller('gamification')
export class GamificationController {
  constructor(private readonly svc: GamificationService) {}

  @Get('stats')
  getStats(@Req() req: any) {
    return this.svc.getStats(req.user.sub);
  }

  @Post('xp')
  addXP(@Req() req: any, @Body() dto: AddXpDto) {
    return this.svc.addXP(req.user.sub, dto.amount, dto.action);
  }

  @Get('leaderboard')
  getLeaderboard(@Req() req: any) {
    return this.svc.getLeaderboard(req.user.tenantId);
  }
}
