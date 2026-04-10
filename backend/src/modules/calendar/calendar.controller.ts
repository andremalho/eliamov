import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { CalendarService } from './calendar.service';
import { CreateEventDto } from './dto/create-event.dto';
import { CurrentUser } from '../auth/current-user.decorator';
import { Public } from '../auth/public.decorator';

@Controller('calendar')
export class CalendarController {
  constructor(private readonly service: CalendarService) {}

  // List connections
  @Get('connections')
  getConnections(@CurrentUser() user: { userId: string }) {
    return this.service.getConnections(user.userId);
  }

  // Initiate OAuth
  @Get('connect/:provider')
  connect(
    @CurrentUser() user: { userId: string },
    @Param('provider') provider: 'google' | 'microsoft',
    @Res() res: Response,
  ) {
    const url = this.service.getOAuthUrl(user.userId, provider);
    res.redirect(url);
  }

  // OAuth callback
  @Public()
  @Get('callback/:provider')
  async callback(
    @Param('provider') provider: string,
    @Query('code') code: string,
    @Query('state') state: string,
    @Res() res: Response,
  ) {
    await this.service.handleCallback(provider, code, state);
    const frontendUrl = process.env.CORS_ORIGIN ?? 'http://localhost:5174';
    res.redirect(`${frontendUrl}/profile?calendar=connected`);
  }

  // Disconnect
  @Delete('connections/:id')
  disconnect(
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
  ) {
    return this.service.disconnect(user.userId, id);
  }

  // iCal feed (public URL for subscribing)
  @Get('feed/:userId.ics')
  @Public()
  async icalFeed(@Param('userId') userId: string, @Res() res: Response) {
    const icsContent = await this.service.generateICalFeed(userId);
    res.set({
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': 'attachment; filename="eliamov.ics"',
    });
    res.send(icsContent);
  }

  // Push event to connected calendar
  @Post('events')
  pushEvent(
    @CurrentUser() user: { userId: string },
    @Body() dto: CreateEventDto & { provider: string },
  ) {
    return this.service.pushEventToCalendar(user.userId, dto.provider, dto);
  }
}
