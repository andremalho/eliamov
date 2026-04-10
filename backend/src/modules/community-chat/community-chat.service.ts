import { randomBytes } from 'crypto';
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Community } from './entities/community.entity';
import { CommunityMember } from './entities/community-member.entity';
import { Message } from './entities/message.entity';
import { CommunityInvite } from './entities/community-invite.entity';
import { CycleEntry } from '../cycle/entities/cycle.entity';
import { User } from '../users/entities/user.entity';
import { Notifications } from '../notifications/entities/notifications.entity';
import { CreateCommunityDto } from './dto/create-community.dto';
import { JoinCommunityDto } from './dto/join-community.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { MediaService } from '../media/media.service';

@Injectable()
export class CommunityChatService {
  constructor(
    @InjectRepository(Community)
    private communityRepo: Repository<Community>,
    @InjectRepository(CommunityMember)
    private memberRepo: Repository<CommunityMember>,
    @InjectRepository(Message)
    private messageRepo: Repository<Message>,
    @InjectRepository(CommunityInvite)
    private inviteRepo: Repository<CommunityInvite>,
    @InjectRepository(CycleEntry)
    private cycleRepo: Repository<CycleEntry>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(Notifications)
    private notifRepo: Repository<Notifications>,
    private readonly mediaService: MediaService,
  ) {}

  // List communities for user's academy
  async findForAcademy(academyId: string, userId: string) {
    const communities = await this.communityRepo.find({
      where: { academyId },
      order: { createdAt: 'DESC' },
    });
    // Check membership for each
    const memberships = await this.memberRepo.find({ where: { userId } });
    const memberMap = new Map(memberships.map((m) => [m.communityId, m]));
    return communities.map((c) => ({
      ...c,
      isMember: memberMap.has(c.id),
      myRole: memberMap.get(c.id)?.role ?? null,
    }));
  }

  // Create community
  async create(userId: string, academyId: string, dto: CreateCommunityDto) {
    const entity = this.communityRepo.create({
      ...dto,
      academyId,
      createdBy: userId,
      membersCount: 1,
    } as any);
    const community = await this.communityRepo.save(entity) as unknown as Community;
    // Creator is admin member
    await this.memberRepo.save(
      this.memberRepo.create({
        communityId: community.id,
        userId,
        role: 'admin',
      }),
    );
    return community;
  }

  // Join community
  async join(communityId: string, userId: string, dto: JoinCommunityDto) {
    const community = await this.communityRepo.findOneBy({ id: communityId });
    if (!community) throw new NotFoundException();

    // Check if already member
    const existing = await this.memberRepo.findOneBy({ communityId, userId });
    if (existing) return { joined: true, community };

    // For private communities, validate invite code
    if (community.type === 'private') {
      if (!dto.code)
        throw new ForbiddenException('Codigo de convite necessario');
      const invite = await this.inviteRepo.findOneBy({
        communityId,
        code: dto.code,
      });
      if (!invite) throw new ForbiddenException('Codigo invalido');
      if (invite.expiresAt && invite.expiresAt < new Date())
        throw new ForbiddenException('Convite expirado');
      if (invite.maxUses && invite.usesCount >= invite.maxUses)
        throw new ForbiddenException('Convite esgotado');
      invite.usesCount += 1;
      await this.inviteRepo.save(invite);
    }

    await this.memberRepo.save(
      this.memberRepo.create({ communityId, userId, role: 'member' }),
    );
    await this.communityRepo.increment({ id: communityId }, 'membersCount', 1);
    return { joined: true, community };
  }

  // Generate invite code
  async createInvite(communityId: string, userId: string) {
    // Verify user is admin of community
    const member = await this.memberRepo.findOneBy({ communityId, userId });
    if (!member || member.role !== 'admin')
      throw new ForbiddenException('Apenas admins podem gerar convites');
    const code = randomBytes(6).toString('hex'); // 12-char code
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    return this.inviteRepo.save(
      this.inviteRepo.create({
        communityId,
        code,
        expiresAt,
        maxUses: 50,
      } as any),
    );
  }

  // Get messages (cursor-based)
  async getMessages(communityId: string, cursor?: string, limit = 30) {
    const qb = this.messageRepo
      .createQueryBuilder('m')
      .leftJoinAndSelect('m.user', 'u')
      .where('m.communityId = :communityId', { communityId })
      .orderBy('m.createdAt', 'DESC')
      .take(limit + 1);
    if (cursor)
      qb.andWhere('m.createdAt < :cursor', { cursor: new Date(cursor) });
    const results = await qb.getMany();
    const hasMore = results.length > limit;
    const data = hasMore ? results.slice(0, limit) : results;
    // Sanitize user data
    const messages = data.map((m) => ({
      ...m,
      user: m.user
        ? {
            id: m.user.id,
            name: m.user.name,
            avatarUrl: m.user.profile?.avatarUrl ?? null,
          }
        : null,
    }));
    return {
      data: messages.reverse(),
      nextCursor: hasMore
        ? data[data.length - 1].createdAt.toISOString()
        : null,
      hasMore,
    };
  }

  // Send message (also called by WebSocket gateway)
  async sendMessage(communityId: string, userId: string, dto: SendMessageDto) {
    const msgEntity = this.messageRepo.create({
      communityId,
      userId,
      content: dto.content ?? null,
      mediaUrl: dto.mediaUrl ?? null,
      mediaType: dto.mediaType ?? 'none',
      replyToId: dto.replyToId ?? null,
    } as any);
    const msg = await this.messageRepo.save(msgEntity) as unknown as Message;
    // Load user for response
    const full = await this.messageRepo.findOne({
      where: { id: msg.id },
      relations: ['user'],
    });
    return {
      ...full,
      user: full?.user
        ? {
            id: full.user.id,
            name: full.user.name,
            avatarUrl: full.user.profile?.avatarUrl ?? null,
          }
        : null,
    };
  }

  // Delete message
  async deleteMessage(
    communityId: string,
    messageId: string,
    userId: string,
  ) {
    const msg = await this.messageRepo.findOneBy({
      id: messageId,
      communityId,
    });
    if (!msg) throw new NotFoundException();
    if (msg.userId !== userId) {
      const member = await this.memberRepo.findOneBy({ communityId, userId });
      if (!member || member.role !== 'admin')
        throw new ForbiddenException('Sem permissao');
    }
    await this.messageRepo.delete(messageId);
    return { ok: true };
  }

  // --- Presigned URL for media upload (delegates to shared MediaService) ---
  getPresignedUrl(type: 'image' | 'video') {
    return this.mediaService.getPresignedUploadUrl(type);
  }

  // --- Cycle auto groups (called by cron) ---
  async syncCycleGroups(academyId: string) {
    const users = await this.userRepo.find({
      where: { tenantId: academyId },
    });
    const phaseMap = new Map<string, { id: string; name: string }[]>();

    for (const user of users) {
      const entry = await this.cycleRepo.findOne({
        where: { userId: user.id },
        order: { startDate: 'DESC' },
      });
      if (!entry) continue;
      const phase = this.computePhase(entry);
      if (!phaseMap.has(phase)) phaseMap.set(phase, []);
      phaseMap.get(phase)!.push({ id: user.id, name: user.name });
    }

    const phaseLabels: Record<string, string> = {
      menstrual: 'Menstrual',
      follicular: 'Folicular',
      ovulatory: 'Ovulatoria',
      luteal: 'Lutea',
    };

    for (const [phase, phaseUsers] of phaseMap) {
      if (phaseUsers.length < 2) continue;

      // Find or create cycle_auto community for this phase
      let community = await this.communityRepo.findOneBy({
        academyId,
        type: 'cycle_auto' as any,
        cyclePhase: phase,
      });
      if (!community) {
        const cycleEntity = this.communityRepo.create({
          academyId,
          name: `Fase ${phaseLabels[phase] ?? phase}`,
          description: `Grupo automatico para quem esta na fase ${phaseLabels[phase]?.toLowerCase() ?? phase}`,
          type: 'cycle_auto',
          createdBy: phaseUsers[0].id,
          cyclePhase: phase,
          membersCount: 0,
        } as any);
        community = await this.communityRepo.save(cycleEntity) as unknown as Community;
      }

      // Sync members: add new, don't remove (they stay until next sync if phase changes)
      for (const user of phaseUsers) {
        const existing = await this.memberRepo.findOneBy({
          communityId: community.id,
          userId: user.id,
        });
        if (!existing) {
          await this.memberRepo.save(
            this.memberRepo.create({
              communityId: community.id,
              userId: user.id,
              role: 'member',
            }),
          );
          community.membersCount += 1;
          // Notify
          await this.notifRepo.save(
            this.notifRepo.create({
              userId: user.id,
              title: `Novo grupo: Fase ${phaseLabels[phase] ?? phase}`,
              body: `Voce foi adicionada ao grupo de ciclo. ${phaseUsers.length} mulheres na mesma fase!`,
              type: 'info',
            } as any),
          );
        }
      }
      await this.communityRepo.save(community);
    }
  }

  private computePhase(entry: CycleEntry): string {
    const cycleLength = entry.cycleLength ?? 28;
    const periodLength = entry.periodLength ?? 5;
    const start = new Date(entry.startDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    start.setHours(0, 0, 0, 0);
    const diff = Math.floor(
      (today.getTime() - start.getTime()) / 86400000,
    );
    const dayIndex = diff % cycleLength;
    if (dayIndex < periodLength) return 'menstrual';
    const ovDay = cycleLength - 14;
    if (dayIndex < ovDay - 1) return 'follicular';
    if (dayIndex <= ovDay + 1) return 'ovulatory';
    return 'luteal';
  }
}
