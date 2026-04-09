import api from './api';

export type ContentType = 'article' | 'video' | 'tip';

export interface ContentItem {
  id: string;
  authorId: string;
  title: string;
  body: string | null;
  videoUrl: string | null;
  thumbnailUrl: string | null;
  type: ContentType;
  likes: number;
  publishedAt: string | null;
  createdAt: string;
}

export const contentApi = {
  list: () => api.get<ContentItem[]>('/content').then((r) => r.data),
  findOne: (id: string) =>
    api.get<ContentItem>(`/content/${id}`).then((r) => r.data),
};
