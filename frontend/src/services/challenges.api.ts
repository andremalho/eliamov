import api from './api';

export type GoalType = 'workout_count' | 'duration' | 'streak';

export const GOAL_TYPE_LABELS: Record<GoalType, string> = {
  workout_count: 'Treinos',
  duration: 'Minutos',
  streak: 'Dias seguidos',
};

export interface Challenge {
  id: string;
  tenantId: string;
  title: string;
  description: string | null;
  goalType: GoalType;
  goalValue: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  joined: boolean;
  myProgress: number;
  myCompleted: string | null;
  createdAt: string;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  avatarUrl: string | null;
  currentProgress: number;
  completedAt: string | null;
}

export interface LeaderboardResponse {
  data: LeaderboardEntry[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const challengesApi = {
  list: () => api.get<Challenge[]>('/challenges').then((r) => r.data),
  join: (id: string) => api.post(`/challenges/${id}/join`).then((r) => r.data),
  leaderboard: (id: string, page = 1) =>
    api
      .get<LeaderboardResponse>(`/challenges/${id}/leaderboard?page=${page}&limit=20`)
      .then((r) => r.data),
};
