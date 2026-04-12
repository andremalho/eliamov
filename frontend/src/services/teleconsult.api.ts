import api from './api';

export const teleconsultApi = {
  createRoom: (sessionId: string) =>
    api.post(`/teleconsult/${sessionId}/video-room`).then((r) => r.data),
};
