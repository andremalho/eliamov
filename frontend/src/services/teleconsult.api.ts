import api from './api';

export type TeleconsultStatus = 'scheduled' | 'completed' | 'cancelled';

export type Teleconsult = {
  id: string;
  professionalName: string;
  specialty: string;
  scheduledAt: string;
  status: TeleconsultStatus;
  videoRoomUrl: string | null;
  notes: string | null;
  createdAt: string;
};

export type CreateTeleconsultInput = {
  specialty: string;
  preferredDate: string;
  preferredTime: string;
  healthPlan?: string;
  notes?: string;
};

export const teleconsultApi = {
  list: (): Promise<Teleconsult[]> =>
    api.get('/teleconsult').then(r => r.data),
  create: (data: CreateTeleconsultInput): Promise<Teleconsult> =>
    api.post('/teleconsult', data).then(r => r.data),
  cancel: (id: string): Promise<void> =>
    api.patch(`/teleconsult/${id}/cancel`).then(r => r.data),
  createRoom: (sessionId: string) =>
    api.post(`/teleconsult/${sessionId}/video-room`).then(r => r.data),
};
