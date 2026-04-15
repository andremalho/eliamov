import api from './api';

export interface UserStats {
  xp: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
  totalWorkouts: number;
  totalCheckins: number;
  totalPosts: number;
  badges: string[];
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  xp: number;
  level: number;
  currentStreak: number;
  totalWorkouts: number;
  badges: string[];
  profile?: { avatarUrl?: string } | null;
}

export const gamificationApi = {
  stats: () => api.get<UserStats>('/gamification/stats').then((r) => r.data),
  addXP: (amount: number, action: string) =>
    api.post('/gamification/xp', { amount, action }).then((r) => r.data),
  leaderboard: () => api.get<LeaderboardEntry[]>('/gamification/leaderboard').then((r) => r.data),
};
