import api from './api';

export interface MoodEntry {
  id: string;
  userId: string;
  date: string;
  energy: number;
  mood: number;
  sleepHours: number | null;
  pain: boolean;
  notes: string | null;
  createdAt: string;
}

export interface MoodSummary {
  count: number;
  avgEnergy: number | null;
  avgMood: number | null;
  avgSleep: number | null;
  painDays: number;
}

export interface CreateMoodInput {
  date: string;
  energy: number;
  mood: number;
  sleepHours?: number;
  pain?: boolean;
  notes?: string;
}

export const moodApi = {
  list: () => api.get<MoodEntry[]>('/mood').then((r) => r.data),
  summary: () => api.get<MoodSummary>('/mood/summary').then((r) => r.data),
  create: (input: CreateMoodInput) =>
    api.post<MoodEntry>('/mood', input).then((r) => r.data),
  remove: (id: string) => api.delete(`/mood/${id}`).then((r) => r.data),
};
