import api from './api';

export interface WorkoutExercise {
  name: string;
  sets?: number;
  reps?: string;
  duration?: string;
  rest?: string;
  notes?: string;
  description?: string;
  videoUrl?: string;
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

export interface WorkoutLogEntry {
  id: string;
  workoutName: string;
  phase: string;
  durationSeconds: number;
  rpe: number | null;
  exercises: { name: string; sets: { reps?: number; weight?: number; duration?: number; completed: boolean }[] }[];
  notes: string | null;
  completedAt: string;
}

export interface ProgressStats {
  totalWorkouts: number;
  totalMinutes: number;
  avgRpe: number;
  weeklyData: { week: string; count: number; minutes: number }[];
  recentLogs: WorkoutLogEntry[];
}

export const workoutLogApi = {
  create: (data: any) => api.post<WorkoutLogEntry>('/training/logs', data).then((r) => r.data),
  list: (page = 1) => api.get(`/training/logs?page=${page}`).then((r) => r.data),
  progress: () => api.get<ProgressStats>('/training/progress').then((r) => r.data),
};

export const aiChatApi = {
  send: (message: string) =>
    api
      .post<{ response: string; usingAi: boolean }>('/ai-engine/chat', {
        message,
      })
      .then((r) => r.data),
  history: () =>
    api
      .get<{ from: string; text: string; createdAt: string }[]>('/ai-engine/chat/history')
      .then((r) => r.data),
};
