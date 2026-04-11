import api from './api';

export interface WeightLossAssessment {
  id: string; userId: string; age: number; biologicalSex: 'M' | 'F';
  weightKg: number; heightCm: number; targetWeightKg: number;
  deadlineMonths: number; activityFactor: number;
  comorbidity: 'none' | 'dm2' | 'hypertension' | 'metabolic_syndrome' | 'pcos';
  bmi: number; tmb: number; tdee: number;
  dailyCalorieGoal: number; caloricDeficit: number;
  proteinG: number; carbsG: number; fatsG: number;
  estimatedWeeklyLossKg: number; estimatedWeeksToGoal: number;
  weeklyPlan: any[]; comorbidityProtocol: any;
  checkins?: WeightLossCheckin[];
}

export interface WeightLossCheckin {
  id: string; weekNumber: number; weightKg: number;
  adherencePercent: number; notes: string | null;
  expectedWeightKg: number; deltaFromExpected: number;
  createdAt: string;
}

export interface ProgressData {
  assessment: { startWeight: number; targetWeight: number; currentWeight: number; totalLoss: number };
  avgAdherence: number; projectedWeeks: number;
  curve: { week: number; real: number; expected: number; delta: number; adherence: number }[];
}

export interface CreateAssessmentInput {
  age: number; biologicalSex: 'M' | 'F';
  weightKg: number; heightCm: number;
  targetWeightKg: number; deadlineMonths: number;
  activityFactor: number;
  comorbidity: 'none' | 'dm2' | 'hypertension' | 'metabolic_syndrome' | 'pcos';
}

export const weightLossApi = {
  getAssessment: () => api.get<WeightLossAssessment>('/weight-loss/assessment').then(r => r.data),
  createAssessment: (dto: CreateAssessmentInput) => api.post<WeightLossAssessment>('/weight-loss/assessment', dto).then(r => r.data),
  checkin: (dto: { assessmentId: string; weekNumber: number; weightKg: number; adherencePercent: number; notes?: string }) =>
    api.post('/weight-loss/checkin', dto).then(r => r.data),
  progress: (assessmentId: string) => api.get<ProgressData>(`/weight-loss/progress?assessmentId=${assessmentId}`).then(r => r.data),
};
