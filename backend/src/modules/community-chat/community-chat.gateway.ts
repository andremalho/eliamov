import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { CommunityChatService } from './community-chat.service';

@WebSocketGateway({ cors: { origin: '*' }, namespace: '/community' })
export class CommunityChatGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(CommunityChatGateway.name);

  constructor(private readonly chatService: CommunityChatService) {}

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { communityId: string },
  ) {
    client.join(`community:${data.communityId}`);
    this.logger.log(`${client.id} joined room community:${data.communityId}`);
    return { joined: data.communityId };
  }

  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { communityId: string },
  ) {
    client.leave(`community:${data.communityId}`);
    return { left: data.communityId };
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      communityId: string;
      userId: string;
      content?: string;
      mediaUrl?: string;
      mediaType?: string;
      replyToId?: string;
    },
  ) {
    const message = await this.chatService.sendMessage(
      data.communityId,
      data.userId,
      {
        content: data.content,
        mediaUrl: data.mediaUrl,
        mediaType: data.mediaType as any,
        replyToId: data.replyToId,
      },
    );
    this.server
      .to(`community:${data.communityId}`)
      .emit('newMessage', message);
    return message;
  }

  @SubscribeMessage('typing')
  handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: { communityId: string; userId: string; name: string },
  ) {
    client
      .to(`community:${data.communityId}`)
      .emit('typing', { userId: data.userId, name: data.name });
  }
}
