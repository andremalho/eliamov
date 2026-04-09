import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { CommunityPost } from './entities/community.entity';
import { CreateCommunityDto } from './dto/create-community.dto';

@Injectable()
export class CommunityService {
  constructor(
    @InjectRepository(CommunityPost) private readonly repo: Repository<CommunityPost>,
  ) {}

  findAll() {
    return this.repo.find({
      where: { parentId: IsNull() },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string) {
    const post = await this.repo.findOne({ where: { id } });
    if (!post) throw new NotFoundException();
    return post;
  }

  findReplies(parentId: string) {
    return this.repo.find({
      where: { parentId },
      order: { createdAt: 'ASC' },
    });
  }

  createForUser(authorId: string, dto: CreateCommunityDto) {
    return this.repo.save(this.repo.create({ ...dto, authorId }));
  }

  async likePost(id: string) {
    const post = await this.repo.findOne({ where: { id } });
    if (!post) throw new NotFoundException();
    post.likes += 1;
    return this.repo.save(post);
  }

  async removeForUser(authorId: string, id: string) {
    const post = await this.repo.findOne({ where: { id, authorId } });
    if (!post) throw new NotFoundException();
    await this.repo.delete(id);
    return { ok: true };
  }
}
