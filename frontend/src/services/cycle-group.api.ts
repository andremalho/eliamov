import api from './api';

export interface CycleGroupPeer {
  id: string;
  name: string;
  avatarUrl: string | null;
}

export interface CycleGroupPeersResponse {
  phase: string | null;
  peers: CycleGroupPeer[];
  count: number;
}

export interface CreateGroupWorkoutInput {
  title: string;
  description?: string;
  participantIds?: string[];
  scheduledAt?: string;
}

export const cycleGroupApi = {
  getPeers: () => api.get<CycleGroupPeersResponse>('/cycle-groups/peers').then(r => r.data),
  createWorkout: (dto: CreateGroupWorkoutInput) =>
    api.post('/cycle-groups/workout', dto).then(r => r.data),
};
