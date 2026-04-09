import api from './api';

export type PostType = 'post' | 'question' | 'tip';

export interface CommunityPost {
  id: string;
  authorId: string;
  title: string;
  body: string;
  type: PostType;
  parentId: string | null;
  likes: number;
  replies: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePostInput {
  title: string;
  body: string;
  type?: PostType;
  parentId?: string;
}

export const communityApi = {
  list: () => api.get<CommunityPost[]>('/community').then((r) => r.data),
  findOne: (id: string) =>
    api.get<CommunityPost>(`/community/${id}`).then((r) => r.data),
  findReplies: (id: string) =>
    api.get<CommunityPost[]>(`/community/${id}/replies`).then((r) => r.data),
  create: (input: CreatePostInput) =>
    api.post<CommunityPost>('/community', input).then((r) => r.data),
  like: (id: string) =>
    api.post<CommunityPost>(`/community/${id}/like`).then((r) => r.data),
  remove: (id: string) =>
    api.delete(`/community/${id}`).then((r) => r.data),
};
