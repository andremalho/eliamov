import api from './api';

export type BpContext = 'rest' | 'post_exercise' | 'morning' | 'evening';

export interface BpEntry {
  id: string;
  userId: string;
  measuredAt: string;
  systolic: number;
  diastolic: number;
  heartRate: number | null;
  context: BpContext;
  notes: string | null;
  alertTriggered: boolean;
}

export interface BpSummary {
  count: number;
  avgSystolic: number | null;
  avgDiastolic: number | null;
  avgHeartRate: number | null;
  alerts: number;
}

export interface CreateBpInput {
  measuredAt: string;
  systolic: number;
  diastolic: number;
  heartRate?: number;
  context: BpContext;
  notes?: string;
}

export const bpApi = {
  list: () => api.get<BpEntry[]>('/blood-pressure').then((r) => r.data),
  summary: () => api.get<BpSummary>('/blood-pressure/summary').then((r) => r.data),
  create: (input: CreateBpInput) =>
    api.post<BpEntry>('/blood-pressure', input).then((r) => r.data),
  remove: (id: string) => api.delete(`/blood-pressure/${id}`).then((r) => r.data),
};

export const BP_CONTEXTS: { value: BpContext; label: string }[] = [
  { value: 'rest', label: 'Em repouso' },
  { value: 'morning', label: 'Manhã' },
  { value: 'evening', label: 'Noite' },
  { value: 'post_exercise', label: 'Pós-exercício' },
];
