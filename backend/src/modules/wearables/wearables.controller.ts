import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { WearablesService } from './wearables.service';
import { CreateWearablesDto } from './dto/create-wearables.dto';
import { CurrentUser } from '../auth/current-user.decorator';
import { Public } from '../auth/public.decorator';

@Controller('wearables')
export class WearablesController {
  constructor(private readonly service: WearablesService) {}

  @Get('providers')
  getProviders() {
    return this.service.getProviders();
  }

  @Get()
  findAll(@CurrentUser() user: { userId: string }) {
    return this.service.findAllForUser(user.userId);
  }

  @Get('data')
  listData(@CurrentUser() user: { userId: string }) {
    return this.service.listDataForUser(user.userId);
  }

  // --- OAuth Flow ---

  @Get('connect/:provider')
  connectProvider(
    @CurrentUser() user: { userId: string },
    @Param('provider') provider: string,
    @Res() res: Response,
  ) {
    const authUrl = this.service.initiateOAuth(user.userId, provider);
    res.redirect(authUrl);
  }

  @Public()
  @Get('callback/:provider')
  async oauthCallback(
    @Param('provider') provider: string,
    @Query('code') code: string,
    @Query('state') state: string,
    @Res() res: Response,
  ) {
    await this.service.handleOAuthCallback(provider, code, state);
    const frontendUrl = process.env.CORS_ORIGIN ?? 'http://localhost:5174';
    res.redirect(`${frontendUrl}/wearables?connected=${provider}`);
  }

  @Post(':id/refresh')
  refreshToken(@CurrentUser() user: { userId: string }, @Param('id') id: string) {
    return this.service.refreshTokenForConnection(id);
  }

  // --- Webhook ---

  @Public()
  @Post('webhook/:provider')
  handleWebhook(@Param('provider') provider: string, @Body() body: any) {
    return this.service.handleWebhook(provider, body);
  }

  // --- CRUD ---

  @Get(':id')
  findOne(@CurrentUser() user: { userId: string }, @Param('id') id: string) {
    return this.service.findOneForUser(user.userId, id);
  }

  @Post()
  create(@CurrentUser() user: { userId: string }, @Body() dto: CreateWearablesDto) {
    return this.service.createForUser(user.userId, dto);
  }

  @Patch(':id')
  update(@CurrentUser() user: { userId: string }, @Param('id') id: string, @Body() dto: any) {
    return this.service.updateForUser(user.userId, id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: { userId: string }, @Param('id') id: string) {
    return this.service.removeForUser(user.userId, id);
  }
}
