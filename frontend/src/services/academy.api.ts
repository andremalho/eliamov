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

export interface AuditLogEntry {
  id: string;
  userId: string | null;
  userName: string | null;
  action: string;
  resource: string;
  resourceId: string | null;
  details: string | null;
  method: string | null;
  path: string | null;
  createdAt: string;
}

export interface AuditLogResponse {
  data: AuditLogEntry[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
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
  exportUsers: () =>
    api.get('/academy/export/users', { responseType: 'blob' }).then((r) => r.data),
  exportContent: () =>
    api.get('/academy/export/content', { responseType: 'blob' }).then((r) => r.data),
  auditLogs: (page = 1) =>
    api.get<AuditLogResponse>(`/audit-logs?page=${page}&limit=30`).then((r) => r.data),
};
