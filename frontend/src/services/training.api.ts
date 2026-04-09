import api from './api';

export interface TrainingPlan {
  id: string;
  userId: string;
  weekStart: string;
  weekEnd: string;
  generatedByAi: boolean;
  cyclePhase: string | null;
  moodScore: number | null;
  wearableReadiness: number | null;
  planJson: any;
  createdAt: string;
}

export const trainingApi = {
  list: () => api.get<TrainingPlan[]>('/training').then((r) => r.data),
  findOne: (id: string) =>
    api.get<TrainingPlan>(`/training/${id}`).then((r) => r.data),
  remove: (id: string) => api.delete(`/training/${id}`).then((r) => r.data),
};
