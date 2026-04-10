import api from './api';

export type PostType = 'workout' | 'free' | 'achievement';
export type ReactionType = 'heart' | 'fire' | 'muscle';

export interface FeedUser {
  id: string; name: string; avatarUrl: string | null;
}

export interface FeedWorkout {
  id: string; type: string; title: string;
  duration: number; distance: number | null; calories: number | null;
}

export interface FeedPost {
  id: string; userId: string; academyId: string;
  postType: PostType; content: string | null;
  mediaUrls: string[]; workoutId: string | null;
  cyclePhase: string | null;
  likesCount: number; commentsCount: number;
  createdAt: string;
  user: FeedUser | null;
  workout: FeedWorkout | null;
  liked: boolean;
}

export interface FeedComment {
  id: string; postId: string; userId: string;
  content: string; createdAt: string; user?: FeedUser;
}

export interface FeedResponse {
  data: FeedPost[]; nextCursor: string | null;
}

export const feedApi = {
  getFeed: (cursor?: string, limit = 15) => {
    const params = new URLSearchParams();
    if (cursor) params.set('cursor', cursor);
    params.set('limit', String(limit));
    return api.get<FeedResponse>(`/feed?${params}`).then(r => r.data);
  },
  createPost: (dto: { postType?: PostType; content?: string; mediaUrls?: string[]; workoutId?: string }) =>
    api.post<FeedPost>('/feed/posts', dto).then(r => r.data),
  like: (postId: string) => api.post(`/feed/posts/${postId}/like`).then(r => r.data),
  unlike: (postId: string) => api.delete(`/feed/posts/${postId}/like`).then(r => r.data),
  addReaction: (postId: string, reaction: ReactionType) =>
    api.post(`/feed/posts/${postId}/reactions`, { reaction }).then(r => r.data),
  removeReaction: (postId: string, reaction: ReactionType) =>
    api.delete(`/feed/posts/${postId}/reactions/${reaction}`).then(r => r.data),
  getComments: (postId: string) => api.get<FeedComment[]>(`/feed/posts/${postId}/comments`).then(r => r.data),
  addComment: (postId: string, content: string) =>
    api.post<FeedComment>(`/feed/posts/${postId}/comments`, { content }).then(r => r.data),
  deletePost: (postId: string) => api.delete(`/feed/posts/${postId}`).then(r => r.data),
};
