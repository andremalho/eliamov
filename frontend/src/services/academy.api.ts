import api from './api';

export interface AcademyOverview {
  totalMembers: number;
  workoutsThisWeek: number;
  avgFrequency: number;
  activeChallenges: number;
  challengeParticipants: number;
}

export interface AdminDashboard {
  totalMembers: number;
  workoutsThisWeek: number;
  avgFrequency: number;
  activeChallenges: number;
  challengeParticipants: number;
  totalUsers: number;
  recentSignups: number;
  usersByRole: { role: string; count: string }[];
  usersByGoal: { goal: string; count: string }[];
}

export interface SearchResult {
  users: { id: string; name: string; email: string; role: string; createdAt: string }[];
}

export const academyApi = {
  overview: () =>
    api.get<AcademyOverview>('/academy/overview').then((r) => r.data),
  dashboard: () =>
    api.get<AdminDashboard>('/academy/dashboard').then((r) => r.data),
  search: (q: string) =>
    api.get<SearchResult>(`/academy/search?q=${encodeURIComponent(q)}`).then((r) => r.data),
  seedContent: () =>
    api.post('/academy/seed-content').then((r) => r.data),
};
