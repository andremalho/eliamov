import api from './api';

export interface RecipeIngredient {
  name: string;
  quantity: string;
  unit: string;
}

export interface RecipeMacros {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
}

export type CyclePhaseFilter = 'follicular' | 'ovulatory' | 'luteal' | 'menstrual' | 'all';

export interface Recipe {
  id: string;
  title: string;
  summary: string | null;
  instructions: string;
  ingredients: RecipeIngredient[];
  macros: RecipeMacros | null;
  coverImageUrl: string | null;
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  servings: number;
  dietaryRestrictions: string[];
  authorId: string;
  categoryId: string | null;
  cyclePhase: CyclePhaseFilter;
  publishedAt: string | null;
  academyId: string | null;
  createdAt: string;
  category?: { id: string; name: string; slug: string } | null;
}

export interface RecipeListResponse {
  data: Recipe[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface RecipeQueryParams {
  phase?: string;
  category?: string;
  restriction?: string;
  page?: number;
  search?: string;
}

export const recipesApi = {
  list: (params?: RecipeQueryParams) => {
    const q = new URLSearchParams();
    if (params?.phase) q.set('phase', params.phase);
    if (params?.category) q.set('category', params.category);
    if (params?.restriction) q.set('restriction', params.restriction);
    if (params?.page) q.set('page', String(params.page));
    if (params?.search) q.set('search', params.search);
    return api.get<RecipeListResponse>(`/recipes?${q}`).then(r => r.data);
  },
  get: (id: string) => api.get<Recipe>(`/recipes/${id}`).then(r => r.data),
  create: (data: Partial<Recipe>) => api.post<Recipe>('/recipes', data).then(r => r.data),
  update: (id: string, data: Partial<Recipe>) => api.patch<Recipe>(`/recipes/${id}`, data).then(r => r.data),
  remove: (id: string) => api.delete(`/recipes/${id}`).then(r => r.data),
};
