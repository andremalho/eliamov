import api from './api';

export interface InsightsResponse {
  generatedAt: string;
  usingAi: boolean;
  text: string;
  snapshot: any;
  error?: string;
}

export interface AiPlanResponse {
  generatedAt: string;
  usingAi: boolean;
  plan: any;
  raw: string;
  error?: string;
}

export const insightsApi = {
  generate: () => api.get<InsightsResponse>('/ai-engine/insights').then((r) => r.data),
  nutritionPlan: () => api.get<AiPlanResponse>('/ai-engine/nutrition-plan').then((r) => r.data),
  trainingPlan: () => api.get<AiPlanResponse>('/ai-engine/training-plan').then((r) => r.data),
};
