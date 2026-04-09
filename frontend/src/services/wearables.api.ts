import api from './api';

export type WearableDevice =
  | 'apple_watch'
  | 'garmin'
  | 'polar'
  | 'oura_ring';

export const DEVICE_LABELS = [
  { value: 'apple_watch', label: 'Apple Watch' },
  { value: 'garmin', label: 'Garmin' },
  { value: 'polar', label: 'Polar' },
  { value: 'oura_ring', label: 'Oura Ring' },
];

export interface WearableConnection {
  id: string;
  userId: string;
  device: WearableDevice;
  isActive: boolean;
  lastSyncAt: string | null;
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
  list: () =>
    api.get<WearableConnection[]>('/wearables').then((r) => r.data),
  listData: () =>
    api.get<WearableData[]>('/wearables/data').then((r) => r.data),
  create: (dto: { device: WearableDevice }) =>
    api.post<WearableConnection>('/wearables', dto).then((r) => r.data),
  remove: (id: string) => api.delete(`/wearables/${id}`).then((r) => r.data),
};
