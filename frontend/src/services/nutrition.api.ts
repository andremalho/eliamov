import api from './api';

export type Meal = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export const MEAL_LABELS = [
  { value: 'breakfast', label: 'Café da manhã' },
  { value: 'lunch', label: 'Almoço' },
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

export const nutritionApi = {
  list: () => api.get<NutritionEntry[]>('/nutrition').then((r) => r.data),
  create: (input: CreateNutritionInput) =>
    api.post<NutritionEntry>('/nutrition', input).then((r) => r.data),
  remove: (id: string) => api.delete(`/nutrition/${id}`).then((r) => r.data),
};
