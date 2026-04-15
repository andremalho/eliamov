import api from './api';
import type { WorkoutExercise, WorkoutTemplate } from './training-engine.api';
export type { WorkoutExercise, WorkoutTemplate };

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

export interface CustomWorkout {
  id: string;
  name: string;
  phase: string;
  type: string;
  duration: number;
  intensity: string;
  rpe: string;
  exercises: WorkoutExercise[];
  description: string | null;
  reference: string | null;
  academyId: string | null;
  createdBy: string;
  createdAt: string;
}

export interface FullLibrary {
  builtin: WorkoutTemplate[];
  custom: CustomWorkout[];
}

export const trainingApi = {
  list: () => api.get<TrainingPlan[]>('/training').then((r) => r.data),
  findOne: (id: string) =>
    api.get<TrainingPlan>(`/training/${id}`).then((r) => r.data),
  remove: (id: string) => api.delete(`/training/${id}`).then((r) => r.data),

  // Admin
  getFullLibrary: () => api.get<FullLibrary>('/training/admin/workouts').then((r) => r.data),
  createCustomWorkout: (data: any) => api.post<CustomWorkout>('/training/admin/workouts', data).then((r) => r.data),
  updateCustomWorkout: (id: string, data: any) => api.patch<CustomWorkout>(`/training/admin/workouts/${id}`, data).then((r) => r.data),
  removeCustomWorkout: (id: string) => api.delete(`/training/admin/workouts/${id}`).then((r) => r.data),
};
