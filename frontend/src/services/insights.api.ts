import api from './api';

export interface InsightsResponse {
  generatedAt: string;
  usingAi: boolean;
  text: string;
  snapshot: any;
  error?: string;
}

export const insightsApi = {
  generate: () => api.get<InsightsResponse>('/ai-engine/insights').then((r) => r.data),
};
