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

export const nutritionApi = {
  list: () => api.get<NutritionEntry[]>('/nutrition').then((r) => r.data),
  create: (input: CreateNutritionInput) =>
    api.post<NutritionEntry>('/nutrition', input).then((r) => r.data),
  remove: (id: string) => api.delete(`/nutrition/${id}`).then((r) => r.data),

  dailySummary: (date: string) =>
    api.get<DailySummary>(`/nutrition/summary/daily?date=${date}`).then((r) => r.data),
  weekSummary: () =>
    api.get<any>('/nutrition/summary/week').then((r) => r.data),

  getGoal: () => api.get<NutritionGoal>('/nutrition/goal').then((r) => r.data),
  setGoal: (dto: Partial<NutritionGoal>) =>
    api.patch<NutritionGoal>('/nutrition/goal', dto).then((r) => r.data),

  listWeights: () => api.get<WeightEntry[]>('/nutrition/weight').then((r) => r.data),
  createWeight: (dto: { date: string; weight: number; waist?: number; hip?: number; bodyFat?: number; notes?: string }) =>
    api.post<WeightEntry>('/nutrition/weight', dto).then((r) => r.data),
  removeWeight: (id: string) => api.delete(`/nutrition/weight/${id}`).then((r) => r.data),
};
