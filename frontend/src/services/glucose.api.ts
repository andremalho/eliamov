import api from './api';

export type GlucoseContext =
  | 'fasting'
  | 'post_meal_1h'
  | 'post_meal_2h'
  | 'bedtime'
  | 'exercise_before'
  | 'exercise_after';

export interface GlucoseEntry {
  id: string;
  userId: string;
  measuredAt: string;
  value: number;
  context: GlucoseContext;
  notes: string | null;
  alertTriggered: boolean;
}

export interface GlucoseSummary {
  count: number;
  avg: number | null;
  min: number | null;
  max: number | null;
  alerts: number;
}

export interface CreateGlucoseInput {
  measuredAt: string;
  value: number;
  context: GlucoseContext;
  notes?: string;
}

export const glucoseApi = {
  list: () => api.get<GlucoseEntry[]>('/glucometer').then((r) => r.data),
  summary: () => api.get<GlucoseSummary>('/glucometer/summary').then((r) => r.data),
  create: (input: CreateGlucoseInput) =>
    api.post<GlucoseEntry>('/glucometer', input).then((r) => r.data),
  remove: (id: string) => api.delete(`/glucometer/${id}`).then((r) => r.data),
};

export const GLUCOSE_CONTEXTS: { value: GlucoseContext; label: string }[] = [
  { value: 'fasting', label: 'Jejum' },
  { value: 'post_meal_1h', label: 'Pós-refeição (1h)' },
  { value: 'post_meal_2h', label: 'Pós-refeição (2h)' },
  { value: 'bedtime', label: 'Antes de dormir' },
  { value: 'exercise_before', label: 'Antes do exercício' },
  { value: 'exercise_after', label: 'Após o exercício' },
];
