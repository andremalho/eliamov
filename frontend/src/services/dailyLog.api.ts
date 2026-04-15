import api from './api';

export type DailyLog = {
  id: string;
  logDate: string;
  cyclePhase: string;
  cycleDay: number | null;
  energyLevel: number | null;
  moodScore: number | null;
  libido: number | null;
  sleepQuality: number | null;
  sleepHours: number | null;
  pelvicPain: number | null;
  headache: number | null;
  bloating: number | null;
  breastTenderness: number | null;
  backPain: number | null;
  nausea: number | null;
  anxiety: number | null;
  irritability: number | null;
  concentration: number | null;
  spotting: boolean;
  hotFlashes: boolean;
  nightSweats: boolean;
  notes: string | null;
};

export type UpsertDailyLogInput = Partial<Omit<DailyLog,
  'id' | 'cyclePhase' | 'cycleDay'>> & { logDate: string };

export const dailyLogApi = {
  upsert: (data: UpsertDailyLogInput): Promise<DailyLog> =>
    api.post('/daily-log', data).then(r => r.data),
  today: (): Promise<DailyLog | null> =>
    api.get('/daily-log/today').then(r => r.data),
  last30: (): Promise<DailyLog[]> =>
    api.get('/daily-log/last30').then(r => r.data),
  range: (from: string, to: string): Promise<DailyLog[]> =>
    api.get(`/daily-log/range?from=${from}&to=${to}`).then(r => r.data),
};
