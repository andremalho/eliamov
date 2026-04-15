import api from './api';

export type TrainingRec = { intensity: string; label: string; types: string[]; avoid: string[]; rationale: string };
export type NutritionRec = { focus: string[]; foods: string[]; avoid: string[]; hydration: string };
export type MentalHealthAlert = { level: 'info' | 'warning' | 'alert'; message: string } | null;

export type PhaseContext = {
  phase: string;
  cycleDay: number | null;
  daysUntilNextPeriod: number | null;
  trainingRecommendation: TrainingRec;
  nutritionRecommendation: NutritionRec;
  mentalHealthAlert: MentalHealthAlert;
  medicationInteractions: string[];
  wellnessTips: string[];
};

export const correlationApi = {
  phaseContext: (): Promise<PhaseContext> => api.get('/correlation/phase-context').then(r => r.data),
};
