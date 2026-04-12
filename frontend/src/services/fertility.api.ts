import api from './api';

export interface FertilityLogEntry {
  id: string;
  date: string;
  basalTemp: number | null;
  lhResult: string | null;
  cervicalMucus: string | null;
  cervixPosition: number | null;
  intercourse: boolean | null;
  notes: string | null;
}

export interface FertileWindow {
  estimatedOvulation: string | null;
  fertileWindowStart: string | null;
  fertileWindowEnd: string | null;
  avgCycleLength: number;
  confidence: 'low' | 'medium' | 'high';
  method: string;
  reference: string;
}

export interface FertilityChart {
  bbt: { date: string; temp: number }[];
  lh: { date: string; result: string }[];
  mucus: { date: string; mucus: string }[];
  intercourse: { date: string }[];
  coverline: number | null;
}

export const fertilityApi = {
  log: (dto: Partial<FertilityLogEntry> & { date: string }) =>
    api.post<FertilityLogEntry>('/fertility/log', dto).then((r) => r.data),

  logs: () =>
    api.get<FertilityLogEntry[]>('/fertility/logs').then((r) => r.data),

  fertileWindow: () =>
    api.get<FertileWindow>('/fertility/fertile-window').then((r) => r.data),

  chart: () =>
    api.get<FertilityChart>('/fertility/chart').then((r) => r.data),
};
