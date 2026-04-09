import api from './api';

export interface Course {
  id: string;
  instructorId: string;
  title: string;
  description: string | null;
  price: number;
  modules: any;
  isPublished: boolean;
  createdAt: string;
}

export const coursesApi = {
  list: () => api.get<Course[]>('/courses').then((r) => r.data),
  findOne: (id: string) =>
    api.get<Course>(`/courses/${id}`).then((r) => r.data),
};
