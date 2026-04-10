import api from './api';

export type Meal = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export const MEAL_LABELS = [
  { value: 'breakfast', label: 'Cafe da manha' },
  { value: 'lunch', label: 'Almoco' },
  { value: 'dinner', label: 'Jantar' },
  { value: 'snack', label: 'Lanche' },
];

export interface NutritionEntry {
  id: string;
  userId: string;
  date: string;
  meal: Meal;
  description: string;
  calories: number | null;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
  fiber: number | null;
  water: number | null;
  notes: string | null;
  createdAt: string;
}

export interface CreateNutritionInput {
  date: string;
  meal: Meal;
  description: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
  water?: number;
  notes?: string;
}

export interface NutritionGoal {
  id: string;
  userId: string;
  dailyCalories: number;
  dailyProtein: number;
  dailyCarbs: number;
  dailyFat: number;
  dailyWater: number;
  goal: 'weight_loss' | 'maintenance' | 'muscle_gain';
}

export interface DailySummary {
  date: string;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  totalWater: number;
  entryCount: number;
  goal: NutritionGoal | null;
}

export interface WeightEntry {
  id: string;
  userId: string;
  date: string;
  weight: number;
  waist: number | null;
  hip: number | null;
  bodyFat: number | null;
  notes: string | null;
  createdAt: string;
}

export interface BodyComposition {
  id: string; userId: string; date: string;
  method: 'bioimpedance' | 'dexa' | 'manual';
  bodyFatPercent: number | null; muscleMassKg: number | null;
  boneMassKg: number | null; waterPercent: number | null;
  visceralFat: number | null; basalMetabolism: number | null;
  reportFileUrl: string | null; notes: string | null;
  createdAt: string;
}

export interface EvolutionData {
  weights: WeightEntry[];
  compositions: BodyComposition[];
  goal: NutritionGoal | null;
  highlights: { label: string; value: string; positive: boolean }[];
}

export const nutritionApi = {
  list: () => api.get<any>('/nutrition').then((r) => Array.isArray(r.data) ? r.data : r.data?.data ?? []),
  create: (input: CreateNutritionInput) =>
    api.post<NutritionEntry>('/nutrition', input).then((r) => r.data),
  remove: (id: string) => api.delete(`/nutrition/${id}`).then((r) => r.data),

  dailySummary: (date: string) =>
    api.get<any>(`/nutrition/summary/daily?date=${date}`).then((r) => {
      const d = r.data;
      const t = d.totals ?? d;
      return {
        date: d.date ?? date,
        totalCalories: t.totalCalories ?? t.calories ?? 0,
        totalProtein: t.totalProtein ?? t.protein ?? 0,
        totalCarbs: t.totalCarbs ?? t.carbs ?? 0,
        totalFat: t.totalFat ?? t.fat ?? 0,
        totalWater: t.totalWater ?? t.water ?? 0,
        entryCount: t.entryCount ?? t.entries ?? 0,
        goal: d.goal ?? null,
      } as DailySummary;
    }),
  weekSummary: () =>
    api.get<any>('/nutrition/summary/week').then((r) => r.data),

  getGoal: () => api.get<NutritionGoal>('/nutrition/goal').then((r) => r.data),
  setGoal: (dto: Partial<NutritionGoal>) =>
    api.patch<NutritionGoal>('/nutrition/goal', dto).then((r) => r.data),

  listWeights: () => api.get<WeightEntry[]>('/nutrition/weight').then((r) => r.data),
  createWeight: (dto: { date: string; weight: number; waist?: number; hip?: number; bodyFat?: number; notes?: string }) =>
    api.post<WeightEntry>('/nutrition/weight', dto).then((r) => r.data),
  removeWeight: (id: string) => api.delete(`/nutrition/weight/${id}`).then((r) => r.data),

  listBodyComp: () => api.get<BodyComposition[]>('/nutrition/body-composition').then(r => r.data),
  createBodyComp: (dto: any) => api.post('/nutrition/body-composition', dto).then(r => r.data),
  removeBodyComp: (id: string) => api.delete(`/nutrition/body-composition/${id}`).then(r => r.data),
  evolution: () => api.get<EvolutionData>('/nutrition/evolution').then(r => r.data),
};
