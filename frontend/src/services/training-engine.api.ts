import api from './api';

export interface WorkoutExercise {
  name: string;
  sets?: number;
  reps?: string;
  duration?: string;
  rest?: string;
  notes?: string;
}

export interface WorkoutTemplate {
  name: string;
  phase: string;
  type: string;
  duration: number;
  intensity: string;
  rpe: string;
  exercises: WorkoutExercise[];
  description: string;
  reference: string;
}

export interface TodayWorkout {
  phase: string;
  dayOfCycle: number | null;
  workout: WorkoutTemplate;
  allForPhase: WorkoutTemplate[];
  alert: string | null;
}

export const trainingEngineApi = {
  today: () =>
    api.get<TodayWorkout>('/training/today').then((r) => r.data),
  library: () =>
    api.get<WorkoutTemplate[]>('/training/library').then((r) => r.data),
  libraryByPhase: (phase: string) =>
    api.get<WorkoutTemplate[]>(`/training/library/${phase}`).then((r) => r.data),
};

export const aiChatApi = {
  send: (message: string) =>
    api
      .post<{ response: string; usingAi: boolean }>('/ai-engine/chat', {
        message,
      })
      .then((r) => r.data),
};
