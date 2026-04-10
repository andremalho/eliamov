import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CommunityChatService } from './community-chat.service';
import { CreateCommunityDto } from './dto/create-community.dto';
import { JoinCommunityDto } from './dto/join-community.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { CurrentUser } from '../auth/current-user.decorator';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@Controller('communities')
export class CommunityChatController {
  constructor(private readonly service: CommunityChatService) {}

  @Get()
  findAll(@CurrentUser() user: { userId: string; tenantId: string }) {
    return this.service.findForAcademy(user.tenantId, user.userId);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('admin', 'tenant_admin')
  create(
    @CurrentUser() user: { userId: string; tenantId: string },
    @Body() dto: CreateCommunityDto,
  ) {
    return this.service.create(user.userId, user.tenantId, dto);
  }

  @Post(':id/join')
  join(
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
    @Body() dto: JoinCommunityDto,
  ) {
    return this.service.join(id, user.userId, dto);
  }

  @Post(':id/invite')
  createInvite(
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
  ) {
    return this.service.createInvite(id, user.userId);
  }

  @Get(':id/messages')
  getMessages(
    @Param('id') id: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
  ) {
    return this.service.getMessages(
      id,
      cursor,
      limit ? parseInt(limit) : undefined,
    );
  }

  @Post(':id/messages')
  sendMessage(
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
    @Body() dto: SendMessageDto,
  ) {
    return this.service.sendMessage(id, user.userId, dto);
  }

  @Delete(':id/messages/:msgId')
  deleteMessage(
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
    @Param('msgId') msgId: string,
  ) {
    return this.service.deleteMessage(id, msgId, user.userId);
  }
}

@Controller('media')
export class MediaController {
  constructor(private readonly service: CommunityChatService) {}

  @Post('presigned-url')
  getPresignedUrl(@Query('type') type: 'image' | 'video') {
    return this.service.getPresignedUrl(type ?? 'image');
  }
}
