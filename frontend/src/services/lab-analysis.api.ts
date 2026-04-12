import api from './api';

export interface LabResult {
  id: string;
  examDate: string;
  labName: string | null;
  values: Record<string, any>;
  aiAnalysis: string | null;
  reportFileUrl: string | null;
}

export const labAnalysisApi = {
  list: () => api.get<LabResult[]>('/lab-analysis').then((r) => r.data),
  create: (dto: any) => api.post('/lab-analysis', dto).then((r) => r.data),
  evolution: (marker: string) =>
    api.get(`/lab-analysis/evolution/${marker}`).then((r) => r.data),
};
