import api from './api';

export type WearableProvider =
  | 'garmin'
  | 'strava'
  | 'polar'
  | 'oura'
  | 'fitbit'
  | 'apple_health'
  | 'whoop';

export interface ProviderInfo {
  id: string;
  name: string;
  icon: string;
}

export interface WearableConnection {
  id: string;
  userId: string;
  provider: WearableProvider;
  externalUserId: string | null;
  isActive: boolean;
  lastSyncAt: string | null;
  createdAt: string;
}

export interface WearableData {
  id: string;
  userId: string;
  device: string;
  recordedAt: string;
  heartRate: number | null;
  hrv: number | null;
  spo2: number | null;
  calories: number | null;
  sleepScore: number | null;
  readinessScore: number | null;
  steps: number | null;
}

export const wearablesApi = {
  providers: () =>
    api.get<ProviderInfo[]>('/wearables/providers').then((r) => r.data),
  list: () =>
    api.get<WearableConnection[]>('/wearables').then((r) => r.data),
  listData: () =>
    api.get<WearableData[]>('/wearables/data').then((r) => r.data),
  connectUrl: (provider: WearableProvider) =>
    `${api.defaults.baseURL}/wearables/connect/${provider}`,
  create: (dto: { provider: WearableProvider }) =>
    api.post<WearableConnection>('/wearables', dto).then((r) => r.data),
  refreshToken: (id: string) =>
    api.post(`/wearables/${id}/refresh`).then((r) => r.data),
  remove: (id: string) => api.delete(`/wearables/${id}`).then((r) => r.data),
};
