import api from './api';

export interface PerformanceLog {
  id: string;
  date: string;
  hrv: number | null;
  restingHR: number | null;
  rpe: number | null;
  trainingLoad: number | null;
  sleepScore: number | null;
  fatigueScore: number | null;
  vigorScore: number | null;
}

export interface ACWR {
  acwr: number | null;
  risk: string;
  acute: number;
  chronic: number;
}

export interface DashboardResponse {
  logs: PerformanceLog[];
  acwr: ACWR;
  readiness: number | null;
}

export const athleteApi = {
  log: (dto: any) => api.post('/athlete/log', dto).then((r) => r.data),
  dashboard: () => api.get<DashboardResponse>('/athlete/dashboard').then((r) => r.data),
  acwr: () => api.get<ACWR>('/athlete/acwr').then((r) => r.data),
};
