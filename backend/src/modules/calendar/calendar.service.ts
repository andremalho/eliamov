import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomUUID } from 'crypto';
import ical, { ICalEventStatus } from 'ical-generator';
import { CalendarConnection } from './entities/calendar-connection.entity';
import { Activity } from '../activities/entities/activity.entity';
import { Appointment } from '../appointments/entities/appointment.entity';
import { Challenge } from '../challenges/entities/challenge.entity';
import { CycleEntry } from '../cycle/entities/cycle.entity';

@Injectable()
export class CalendarService {
  private readonly logger = new Logger(CalendarService.name);
  private readonly pendingStates = new Map<
    string,
    { userId: string; provider: string }
  >();

  constructor(
    @InjectRepository(CalendarConnection)
    private connRepo: Repository<CalendarConnection>,
    @InjectRepository(Activity)
    private activityRepo: Repository<Activity>,
    @InjectRepository(Appointment)
    private appointmentRepo: Repository<Appointment>,
    @InjectRepository(Challenge)
    private challengeRepo: Repository<Challenge>,
    @InjectRepository(CycleEntry)
    private cycleRepo: Repository<CycleEntry>,
  ) {}

  // --- OAuth initiation ---
  getOAuthUrl(userId: string, provider: 'google' | 'microsoft'): string {
    const state = randomUUID();
    this.pendingStates.set(state, { userId, provider });
    setTimeout(() => this.pendingStates.delete(state), 10 * 60 * 1000);

    const baseUrl = process.env.APP_BASE_URL ?? 'http://localhost:3001';
    const redirectUri = `${baseUrl}/calendar/callback/${provider}`;

    if (provider === 'google') {
      const clientId = process.env.GOOGLE_CALENDAR_CLIENT_ID ?? '';
      if (!clientId)
        throw new BadRequestException('Google Calendar nao configurado');
      const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: 'code',
        scope: 'https://www.googleapis.com/auth/calendar.events',
        access_type: 'offline',
        prompt: 'consent',
        state,
      });
      return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
    }

    if (provider === 'microsoft') {
      const clientId = process.env.MICROSOFT_CALENDAR_CLIENT_ID ?? '';
      if (!clientId)
        throw new BadRequestException('Microsoft Calendar nao configurado');
      const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: 'code',
        scope: 'Calendars.ReadWrite offline_access',
        state,
      });
      return `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?${params}`;
    }

    throw new BadRequestException('Provider nao suportado');
  }

  // --- OAuth callback ---
  async handleCallback(provider: string, code: string, state: string) {
    const pending = this.pendingStates.get(state);
    if (!pending || pending.provider !== provider)
      throw new BadRequestException('State invalido');
    this.pendingStates.delete(state);

    const baseUrl = process.env.APP_BASE_URL ?? 'http://localhost:3001';
    const redirectUri = `${baseUrl}/calendar/callback/${provider}`;

    let tokenData: any;

    if (provider === 'google') {
      const res = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code,
          client_id: process.env.GOOGLE_CALENDAR_CLIENT_ID ?? '',
          client_secret: process.env.GOOGLE_CALENDAR_CLIENT_SECRET ?? '',
          redirect_uri: redirectUri,
          grant_type: 'authorization_code',
        }),
      });
      tokenData = await res.json();
    } else if (provider === 'microsoft') {
      const res = await fetch(
        'https://login.microsoftonline.com/common/oauth2/v2.0/token',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            code,
            client_id: process.env.MICROSOFT_CALENDAR_CLIENT_ID ?? '',
            client_secret: process.env.MICROSOFT_CALENDAR_CLIENT_SECRET ?? '',
            redirect_uri: redirectUri,
            grant_type: 'authorization_code',
            scope: 'Calendars.ReadWrite offline_access',
          }),
        },
      );
      tokenData = await res.json();
    }

    if (!tokenData?.access_token) {
      this.logger.error(`Calendar OAuth failed: ${JSON.stringify(tokenData)}`);
      throw new BadRequestException('Falha na autenticacao');
    }

    // Upsert connection
    let conn = await this.connRepo.findOneBy({
      userId: pending.userId,
      provider: provider as any,
    });
    if (!conn)
      conn = this.connRepo.create({
        userId: pending.userId,
        provider: provider as any,
      }) as CalendarConnection;

    conn.accessToken = tokenData.access_token;
    conn.refreshToken = tokenData.refresh_token ?? conn.refreshToken;
    conn.expiresAt = tokenData.expires_in
      ? new Date(Date.now() + tokenData.expires_in * 1000)
      : null;
    conn.isActive = true;

    await this.connRepo.save(conn);
    return { ok: true, provider };
  }

  // --- List connections ---
  getConnections(userId: string) {
    return this.connRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  // --- Disconnect ---
  async disconnect(userId: string, connectionId: string) {
    const conn = await this.connRepo.findOneBy({ id: connectionId, userId });
    if (!conn) throw new NotFoundException();
    await this.connRepo.delete(connectionId);
    return { ok: true };
  }

  // --- Generate iCal feed ---
  async generateICalFeed(userId: string): Promise<string> {
    const cal = ical({ name: 'eliaMov', timezone: 'America/Sao_Paulo' });

    // Workouts (last 50)
    const activities = await this.activityRepo.find({
      where: { userId },
      order: { startedAt: 'DESC' },
      take: 50,
    });
    for (const a of activities) {
      const endAt = new Date(
        new Date(a.startedAt).getTime() + (a.duration ?? 3600) * 1000,
      );
      cal.createEvent({
        start: new Date(a.startedAt),
        end: endAt,
        summary: `[Treino] ${a.title}`,
        description: `Tipo: ${a.type}\nDuracao: ${Math.round((a.duration ?? 0) / 60)} min${a.calories ? '\nCalorias: ' + a.calories : ''}`,
        categories: [{ name: 'Treino' }],
      });
    }

    // Appointments
    const appointments = await this.appointmentRepo.find({
      where: { userId },
      order: { scheduledAt: 'DESC' },
      take: 20,
    });
    for (const ap of appointments) {
      const endAt = new Date(
        new Date(ap.scheduledAt).getTime() + (ap.duration ?? 30) * 60 * 1000,
      );
      cal.createEvent({
        start: new Date(ap.scheduledAt),
        end: endAt,
        summary: `[Consulta] ${ap.type === 'teleconsult' ? 'Teleconsulta' : 'Presencial'}`,
        description: ap.notes ?? '',
        location: ap.meetingUrl ?? undefined,
        categories: [{ name: 'Consulta' }],
      });
    }

    // Cycle predictions (next 3 months)
    const lastCycle = await this.cycleRepo.findOne({
      where: { userId },
      order: { startDate: 'DESC' },
    });
    if (lastCycle) {
      const cycleLen = lastCycle.cycleLength ?? 28;
      const periodLen = lastCycle.periodLength ?? 5;
      const start = new Date(lastCycle.startDate);
      for (let i = 0; i < 4; i++) {
        const nextStart = new Date(start);
        nextStart.setDate(nextStart.getDate() + cycleLen * (i + 1));
        const nextEnd = new Date(nextStart);
        nextEnd.setDate(nextEnd.getDate() + periodLen);
        cal.createEvent({
          start: nextStart,
          end: nextEnd,
          summary: '[Ciclo] Periodo previsto',
          description: `Previsao baseada em ciclo de ${cycleLen} dias`,
          categories: [{ name: 'Ciclo' }],
          status: ICalEventStatus.TENTATIVE,
        });
      }
    }

    // Challenges
    const today = new Date().toISOString().slice(0, 10);
    const challenges = await this.challengeRepo
      .createQueryBuilder('c')
      .where('c.endDate >= :today', { today })
      .getMany();
    for (const ch of challenges) {
      cal.createEvent({
        start: new Date(ch.startDate),
        end: new Date(ch.endDate),
        summary: `[Desafio] ${ch.title}`,
        description: ch.description ?? `Meta: ${ch.goalValue} ${ch.goalType}`,
        categories: [{ name: 'Desafio' }],
      });
    }

    return cal.toString();
  }

  // --- Push event to Google/Microsoft ---
  async pushEventToCalendar(
    userId: string,
    provider: string,
    event: {
      title: string;
      description?: string;
      startAt: string;
      endAt: string;
      location?: string;
    },
  ) {
    const conn = await this.connRepo.findOneBy({
      userId,
      provider: provider as any,
      isActive: true,
    });
    if (!conn?.accessToken)
      throw new BadRequestException(`Nao conectado ao ${provider}`);

    if (provider === 'google') {
      const res = await fetch(
        'https://www.googleapis.com/calendar/v3/calendars/primary/events',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${conn.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            summary: event.title,
            description: event.description,
            start: { dateTime: event.startAt, timeZone: 'America/Sao_Paulo' },
            end: { dateTime: event.endAt, timeZone: 'America/Sao_Paulo' },
            location: event.location,
          }),
        },
      );
      if (!res.ok)
        this.logger.warn(`Google Calendar push failed: ${res.status}`);
      return res.json();
    }

    if (provider === 'microsoft') {
      const res = await fetch(
        'https://graph.microsoft.com/v1.0/me/events',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${conn.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            subject: event.title,
            body: {
              contentType: 'text',
              content: event.description ?? '',
            },
            start: {
              dateTime: event.startAt,
              timeZone: 'America/Sao_Paulo',
            },
            end: { dateTime: event.endAt, timeZone: 'America/Sao_Paulo' },
            location: event.location
              ? { displayName: event.location }
              : undefined,
          }),
        },
      );
      if (!res.ok)
        this.logger.warn(`Microsoft Calendar push failed: ${res.status}`);
      return res.json();
    }

    throw new BadRequestException('Provider nao suportado');
  }
}
