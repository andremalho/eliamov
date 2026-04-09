import api from './api';

export type ActivityType = 'run' | 'ride' | 'walk' | 'swim' | 'hike' | 'workout' | 'yoga' | 'other';

export const ACTIVITY_TYPES = [
  { value: 'run', label: 'Corrida' },
  { value: 'ride', label: 'Ciclismo' },
  { value: 'walk', label: 'Caminhada' },
  { value: 'swim', label: 'Natação' },
  { value: 'hike', label: 'Trilha' },
  { value: 'workout', label: 'Treino' },
  { value: 'yoga', label: 'Yoga' },
  { value: 'other', label: 'Outro' },
];

export interface Activity {
  id: string;
  userId: string;
  provider: string | null;
  externalId: string | null;
  type: ActivityType;
  title: string;
  description: string | null;
  startedAt: string;
  duration: number;
  distance: number | null;
  calories: number | null;
  avgHeartRate: number | null;
  maxHeartRate: number | null;
  elevationGain: number | null;
  polyline: string | null;
  mapImageUrl: string | null;
  startLat: number | null;
  startLng: number | null;
  isPublic: boolean;
  shareToken: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateActivityInput {
  type: ActivityType;
  title: string;
  description?: string;
  startedAt: string;
  duration: number;
  distance?: number;
  calories?: number;
  avgHeartRate?: number;
  maxHeartRate?: number;
  elevationGain?: number;
  polyline?: string;
  startLat?: number;
  startLng?: number;
  isPublic?: boolean;
}

export const activitiesApi = {
  list: (page = 1, limit = 20) =>
    api
      .get<{
        data: Activity[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      }>(`/activities?page=${page}&limit=${limit}`)
      .then((r) => r.data),
  findOne: (id: string) =>
    api.get<Activity>(`/activities/${id}`).then((r) => r.data),
  findByShareToken: (token: string) =>
    api.get<Activity>(`/activities/public/${token}`).then((r) => r.data),
  create: (input: CreateActivityInput) =>
    api.post<Activity>('/activities', input).then((r) => r.data),
  update: (id: string, dto: Partial<CreateActivityInput>) =>
    api.patch<Activity>(`/activities/${id}`, dto).then((r) => r.data),
  remove: (id: string) =>
    api.delete(`/activities/${id}`).then((r) => r.data),
};
