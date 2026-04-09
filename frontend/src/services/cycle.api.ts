import api from './api';

export interface CycleEntry {
  id: string;
  userId: string;
  startDate: string;
  endDate: string | null;
  cycleLength: number | null;
  periodLength: number | null;
  phase: 'menstrual' | 'follicular' | 'ovulatory' | 'luteal' | null;
  predictedNextStart: string | null;
  createdAt: string;
}

export interface CurrentPhase {
  phase: 'menstrual' | 'follicular' | 'ovulatory' | 'luteal' | null;
  dayOfCycle: number | null;
  nextStart: string | null;
  cycleLength?: number;
  periodLength?: number;
  message?: string;
}

export interface CreateCycleInput {
  startDate: string;
  endDate?: string;
  cycleLength?: number;
  periodLength?: number;
}

export const cycleApi = {
  list: () => api.get<CycleEntry[]>('/cycle').then((r) => r.data),
  current: () => api.get<CurrentPhase>('/cycle/current').then((r) => r.data),
  create: (input: CreateCycleInput) =>
    api.post<CycleEntry>('/cycle', input).then((r) => r.data),
  remove: (id: string) => api.delete(`/cycle/${id}`).then((r) => r.data),
};
