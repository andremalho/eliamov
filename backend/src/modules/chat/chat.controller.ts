import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('chat')
export class ChatController {
  constructor(private readonly service: ChatService) {}

  @Get()
  findAll(@CurrentUser() user: { userId: string }) {
    return this.service.findAllForUser(user.userId);
  }

  @Get('conversation/:conversationId')
  findConversation(
    @CurrentUser() user: { userId: string },
    @Param('conversationId') conversationId: string,
  ) {
    return this.service.findConversation(user.userId, conversationId);
  }

  @Post()
  create(@CurrentUser() user: { userId: string }, @Body() dto: CreateChatDto) {
    return this.service.createForUser(user.userId, dto);
  }

  @Patch(':id/read')
  markAsRead(@CurrentUser() user: { userId: string }, @Param('id') id: string) {
    return this.service.markAsRead(user.userId, id);
  }

  @Delete(':id')
  remove(@CurrentUser() user: { userId: string }, @Param('id') id: string) {
    return this.service.removeForUser(user.userId, id);
  }
}
