import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WearableConnection } from './entities/wearable-connection.entity';
import { WearableData } from './entities/wearable-data.entity';
import { CreateWearablesDto } from './dto/create-wearables.dto';
import { getProviderConfig, SUPPORTED_PROVIDERS } from './providers/provider-config';
import { randomUUID } from 'crypto';

@Injectable()
export class WearablesService {
  private readonly logger = new Logger(WearablesService.name);
  private readonly pendingStates = new Map<string, { userId: string; provider: string }>();

  constructor(
    @InjectRepository(WearableConnection) private readonly connRepo: Repository<WearableConnection>,
    @InjectRepository(WearableData) private readonly dataRepo: Repository<WearableData>,
  ) {}

  getProviders() {
    return SUPPORTED_PROVIDERS;
  }

  findAllForUser(userId: string) {
    return this.connRepo.find({ where: { userId } });
  }

  async findOneForUser(userId: string, id: string) {
    const record = await this.connRepo.findOne({ where: { id, userId } });
    if (!record) throw new NotFoundException();
    return record;
  }

  createForUser(userId: string, dto: CreateWearablesDto) {
    return this.connRepo.save(this.connRepo.create({ ...dto, userId } as any));
  }

  async updateForUser(userId: string, id: string, dto: Partial<WearableConnection>) {
    const record = await this.connRepo.findOne({ where: { id, userId } });
    if (!record) throw new NotFoundException();
    Object.assign(record, dto);
    return this.connRepo.save(record);
  }

  async removeForUser(userId: string, id: string) {
    const record = await this.connRepo.findOne({ where: { id, userId } });
    if (!record) throw new NotFoundException();
    await this.connRepo.delete(id);
    return { ok: true };
  }

  listDataForUser(userId: string) {
    return this.dataRepo.find({ where: { userId }, order: { recordedAt: 'DESC' }, take: 50 });
  }

  // --- OAuth Flow ---

  initiateOAuth(userId: string, provider: string): string {
    const config = getProviderConfig(provider);
    if (!config) throw new BadRequestException(`Provider "${provider}" não suportado`);
    if (!config.clientId) throw new BadRequestException(`Provider "${provider}" não configurado (falta CLIENT_ID)`);

    if (provider === 'apple_health') {
      throw new BadRequestException('Apple Health sincroniza via app mobile, não requer OAuth');
    }

    const state = randomUUID();
    this.pendingStates.set(state, { userId, provider });
    setTimeout(() => this.pendingStates.delete(state), 10 * 60 * 1000);

    const baseUrl = process.env.APP_BASE_URL ?? 'http://localhost:3001';
    const redirectUri = `${baseUrl}${config.callbackPath}`;

    const params = new URLSearchParams({
      client_id: config.clientId,
      response_type: 'code',
      redirect_uri: redirectUri,
      state,
    });

    if (config.scopes.length > 0) {
      params.set('scope', config.scopes.join(' '));
    }

    return `${config.authUrl}?${params.toString()}`;
  }

  async handleOAuthCallback(provider: string, code: string, state: string) {
    const pending = this.pendingStates.get(state);
    if (!pending || pending.provider !== provider) {
      throw new BadRequestException('State inválido ou expirado');
    }
    this.pendingStates.delete(state);

    const config = getProviderConfig(provider);
    if (!config) throw new BadRequestException(`Provider "${provider}" não suportado`);

    const baseUrl = process.env.APP_BASE_URL ?? 'http://localhost:3001';
    const redirectUri = `${baseUrl}${config.callbackPath}`;

    try {
      const tokenRes = await fetch(config.tokenUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          client_id: config.clientId,
          client_secret: config.clientSecret,
          code,
          redirect_uri: redirectUri,
        }).toString(),
      });

      const tokenData: any = await tokenRes.json();

      if (!tokenData.access_token) {
        this.logger.error(`OAuth token exchange failed for ${provider}: ${JSON.stringify(tokenData)}`);
        throw new BadRequestException('Falha na troca de token OAuth');
      }

      const existing = await this.connRepo.findOne({
        where: { userId: pending.userId, provider: provider as any },
      });

      const connData: Partial<WearableConnection> = {
        userId: pending.userId,
        provider: provider as any,
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token ?? existing?.refreshToken ?? undefined,
        expiresAt: tokenData.expires_in
          ? new Date(Date.now() + tokenData.expires_in * 1000)
          : undefined,
        scope: tokenData.scope ?? undefined,
        externalUserId: tokenData.athlete?.id?.toString() ?? tokenData.user_id ?? undefined,
        isActive: true,
      };

      if (existing) {
        Object.assign(existing, connData);
        await this.connRepo.save(existing);
      } else {
        await this.connRepo.save(this.connRepo.create(connData as any));
      }
      return { ok: true, provider, userId: pending.userId };
    } catch (err) {
      this.logger.error(`OAuth callback failed for ${provider}`, err as any);
      throw new BadRequestException('Falha no callback OAuth');
    }
  }

  async refreshTokenForConnection(connectionId: string) {
    const conn = await this.connRepo.findOne({ where: { id: connectionId } });
    if (!conn || !conn.refreshToken) throw new NotFoundException('Conexão não encontrada ou sem refresh token');

    const config = getProviderConfig(conn.provider);
    if (!config) throw new BadRequestException('Provider não suportado');

    try {
      const res = await fetch(config.tokenUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          client_id: config.clientId,
          client_secret: config.clientSecret,
          refresh_token: conn.refreshToken,
        }).toString(),
      });

      const data: any = await res.json();
      if (!data.access_token) {
        conn.isActive = false;
        await this.connRepo.save(conn);
        throw new BadRequestException('Refresh token expirado, reconecte o dispositivo');
      }

      conn.accessToken = data.access_token;
      conn.refreshToken = data.refresh_token ?? conn.refreshToken;
      conn.expiresAt = data.expires_in ? new Date(Date.now() + data.expires_in * 1000) : null;
      await this.connRepo.save(conn);

      return { ok: true };
    } catch (err) {
      this.logger.error(`Token refresh failed for ${conn.provider}`, err as any);
      throw err;
    }
  }

  // --- Webhook ---

  async handleWebhook(provider: string, body: any) {
    this.logger.log(`Webhook received from ${provider}: ${JSON.stringify(body).slice(0, 500)}`);
    // Each provider sends different webhook formats
    // This is the entry point - extend per provider as needed
    return { received: true, provider };
  }

  // --- Data ingestion ---

  async saveWearableData(userId: string, provider: string, records: Partial<WearableData>[]) {
    const entities = records.map((r) =>
      this.dataRepo.create({ ...r, userId, device: provider } as any),
    );
    return this.dataRepo.save(entities as any) as Promise<WearableData[]>;
  }
}
