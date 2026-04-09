import { Injectable, Logger, ForbiddenException } from '@nestjs/common';
import { ConsentService } from '../consent/consent.service';

@Injectable()
export class EliahealthIntegrationService {
  private readonly logger = new Logger(EliahealthIntegrationService.name);

  constructor(private readonly consentService: ConsentService) {}

  private get baseUrl() {
    return process.env.ELIAHEALTH_API_URL ?? 'http://localhost:3000';
  }

  private get apiKey() {
    return process.env.ELIAHEALTH_API_KEY ?? '';
  }

  private async ensureConsent(userId: string) {
    const ok = await this.consentService.hasConsent(userId, 'eliahealth_integration');
    if (!ok) {
      throw new ForbiddenException('Consentimento LGPD ausente para integração EliaHealth');
    }
  }

  async getPatientRecord(userId: string, patientId: string) {
    await this.ensureConsent(userId);
    try {
      const res = await fetch(`${this.baseUrl}/api/patients/${patientId}`, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'content-type': 'application/json',
        },
      });
      if (!res.ok) {
        this.logger.warn(`EliaHealth responded with status ${res.status}`);
        return { error: 'eliahealth_error', status: res.status };
      }
      return await res.json();
    } catch (err) {
      this.logger.error('getPatientRecord failed', err as any);
      return { error: 'eliahealth_unavailable' };
    }
  }

  async syncData(userId: string, data: any) {
    await this.ensureConsent(userId);
    try {
      const res = await fetch(`${this.baseUrl}/api/sync`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({ userId, data }),
      });
      if (!res.ok) {
        this.logger.warn(`EliaHealth sync responded with status ${res.status}`);
        return { error: 'eliahealth_error', status: res.status };
      }
      return await res.json();
    } catch (err) {
      this.logger.error('syncData failed', err as any);
      return { error: 'eliahealth_unavailable' };
    }
  }
}
