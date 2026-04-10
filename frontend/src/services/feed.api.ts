import api from './api';

export interface FeedUser {
  id: string;
  name: string;
  avatarUrl: string | null;
}

export interface FeedActivity {
  id: string;
  type: string;
  title: string;
  duration: number;
  distance: number | null;
  calories: number | null;
  polyline: string | null;
}

export interface FeedPost {
  id: string;
  userId: string;
  tenantId: string;
  activityId: string | null;
  content: string | null;
  likesCount: number;
  commentsCount: number;
  createdAt: string;
  user: FeedUser | null;
  activity: FeedActivity | null;
  liked: boolean;
}

export interface FeedComment {
  id: string;
  postId: string;
  userId: string;
  content: string;
  createdAt: string;
  user?: FeedUser;
}

export interface FeedResponse {
  data: FeedPost[];
  nextCursor: string | null;
}

export const feedApi = {
  getFeed: (cursor?: string, limit = 15) => {
    const params = new URLSearchParams();
    if (cursor) params.set('cursor', cursor);
    params.set('limit', String(limit));
    return api.get<FeedResponse>(`/feed?${params}`).then(r => r.data);
  },
  createPost: (dto: { activityId?: string; content?: string }) =>
    api.post<FeedPost>('/feed', dto).then(r => r.data),
  like: (postId: string) => api.post(`/feed/${postId}/like`).then(r => r.data),
  unlike: (postId: string) => api.delete(`/feed/${postId}/like`).then(r => r.data),
  getComments: (postId: string) => api.get<FeedComment[]>(`/feed/${postId}/comments`).then(r => r.data),
  addComment: (postId: string, content: string) =>
    api.post<FeedComment>(`/feed/${postId}/comments`, { content }).then(r => r.data),
  deletePost: (postId: string) => api.delete(`/feed/${postId}`).then(r => r.data),
};
