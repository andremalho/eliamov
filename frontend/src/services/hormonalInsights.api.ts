import api from './api';

export type HormonalInsight = {
  id: string;
  userId: string;
  analyzedCycleCount: number;
  avgCycleLength: number | null;
  cycleVariability: number | null;
  cycleTrendSlope: number | null;
  aubRiskScore: number;
  perimenopauseScore: number;
  aubRiskLevel: 'low' | 'moderate' | 'high';
  hormonalStatus: 'stable' | 'possible_anovulatory_pattern' | 'possible_perimenopause_transition' | 'needs_clinical_review';
  patientSummary: string;
  clinicianSummary: string;
  rawMetrics: Record<string, unknown>;
  createdAt: string;
};

export const hormonalInsightsApi = {
  latest: (): Promise<HormonalInsight | null> => api.get('/hormonal-insights/latest').then(r => r.data),
  recompute: (): Promise<HormonalInsight> => api.post('/hormonal-insights/recompute').then(r => r.data),
};
