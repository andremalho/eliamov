import api from './api';

export interface MenopauseProfileData {
  stage: string;
  ageAtOnset: number | null;
  onHRT: boolean;
  symptoms: string[];
  mrsScore: number | null;
}

export const menopauseApi = {
  getProfile: () =>
    api.get<MenopauseProfileData>('/menopause/profile').then((r) => r.data),
  createProfile: (dto: any) =>
    api.post('/menopause/profile', dto).then((r) => r.data),
  logDay: (dto: any) => api.post('/menopause/log', dto).then((r) => r.data),
  logs: () => api.get('/menopause/logs').then((r) => r.data),
  mrsScore: () => api.get('/menopause/mrs-score').then((r) => r.data),
  recommendations: () =>
    api.get('/menopause/recommendations').then((r) => r.data),
};
