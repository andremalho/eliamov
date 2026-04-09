import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatMessage } from './entities/chat.entity';
import { CreateChatDto } from './dto/create-chat.dto';
import { PaginationDto, paginate } from '../../common/pagination.dto';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(ChatMessage) private readonly repo: Repository<ChatMessage>,
  ) {}

  async findAllForUser(userId: string, pagination: PaginationDto) {
    const page = pagination.page ?? 1;
    const limit = pagination.limit ?? 20;
    const [data, total] = await this.repo.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return paginate(data, total, page, limit);
  }

  findConversation(userId: string, conversationId: string) {
    return this.repo.find({
      where: { userId, conversationId },
      order: { createdAt: 'ASC' },
    });
  }

  createForUser(userId: string, dto: CreateChatDto) {
    return this.repo.save(this.repo.create({
      ...dto,
      userId,
      sender: dto.sender ?? 'user',
    }));
  }

  async markAsRead(userId: string, id: string) {
    const msg = await this.repo.findOne({ where: { id, userId } });
    if (!msg) throw new NotFoundException();
    msg.read = true;
    return this.repo.save(msg);
  }

  async removeForUser(userId: string, id: string) {
    const msg = await this.repo.findOne({ where: { id, userId } });
    if (!msg) throw new NotFoundException();
    await this.repo.delete(id);
    return { ok: true };
  }
}
