import api from './api';

export interface Pregnancy {
  id: string;
  lastMenstrualDate: string;
  estimatedDueDate: string;
  currentWeek: number;
  status: string;
  prePregnancyWeight: number | null;
  currentWeight: number | null;
}

export interface WeekInfo {
  week: number;
  trimester: number;
  babySize: string;
  exerciseRecs: string[];
  nutritionTips: string[];
  reference: string;
}

export const pregnancyApi = {
  create: (dto: any) => api.post('/pregnancy', dto).then((r) => r.data),
  getActive: () => api.get<Pregnancy>('/pregnancy').then((r) => r.data),
  logWeek: (id: string, dto: any) =>
    api.post(`/pregnancy/${id}/week`, dto).then((r) => r.data),
  weekInfo: (week: number) =>
    api.get<WeekInfo>(`/pregnancy/week-info/${week}`).then((r) => r.data),
};
