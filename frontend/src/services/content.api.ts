import api from './api';

import { CyclePhaseFilter } from '../types/cycle';
export type { CyclePhaseFilter };

export interface ContentCategory {
  id: string; name: string; slug: string;
}

export interface Article {
  id: string; title: string; summary: string | null; body: string;
  coverImageUrl: string | null; authorId: string;
  categoryId: string | null; cyclePhase: CyclePhaseFilter;
  publishedAt: string | null; academyId: string | null;
  createdAt: string; category?: ContentCategory | null;
}

export interface Video {
  id: string; title: string; description: string | null;
  videoUrl: string; thumbnailUrl: string | null; durationSeconds: number;
  categoryId: string | null; cyclePhase: CyclePhaseFilter;
  publishedAt: string | null; academyId: string | null;
  createdAt: string; category?: ContentCategory | null;
}

export interface SavedContent {
  id: string; userId: string; contentType: 'article' | 'video';
  contentId: string; savedAt: string;
  content?: Article | Video;
}

export interface ContentListResponse<T> {
  data: T[]; total: number; page: number; limit: number; totalPages: number;
}

export interface ContentQueryParams {
  phase?: string;
  category?: string;
  page?: number;
  search?: string;
}

export const contentApi = {
  // Articles
  listArticles: (params?: ContentQueryParams) => {
    const q = new URLSearchParams();
    if (params?.phase) q.set('phase', params.phase);
    if (params?.category) q.set('category', params.category);
    if (params?.page) q.set('page', String(params.page));
    if (params?.search) q.set('search', params.search);
    return api.get<ContentListResponse<Article>>(`/content/articles?${q}`).then(r => r.data);
  },
  getArticle: (id: string) => api.get<Article>(`/content/articles/${id}`).then(r => r.data),

  // Videos
  listVideos: (params?: ContentQueryParams) => {
    const q = new URLSearchParams();
    if (params?.phase) q.set('phase', params.phase);
    if (params?.category) q.set('category', params.category);
    if (params?.page) q.set('page', String(params.page));
    if (params?.search) q.set('search', params.search);
    return api.get<ContentListResponse<Video>>(`/content/videos?${q}`).then(r => r.data);
  },
  getVideo: (id: string) => api.get<Video>(`/content/videos/${id}`).then(r => r.data),

  // Categories
  listCategories: () => api.get<ContentCategory[]>('/content/categories').then(r => r.data),

  // Saved
  listSaved: () => api.get<SavedContent[]>('/content/saved').then(r => r.data),
  save: (contentType: 'article' | 'video', contentId: string) =>
    api.post('/content/saved', { contentType, contentId }).then(r => r.data),
  removeSaved: (id: string) => api.delete(`/content/saved/${id}`).then(r => r.data),
};
