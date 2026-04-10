import api from './api';

export interface StoryItem {
  id: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  thumbnailUrl: string | null;
  cyclePhase: string | null;
  moodTag: string | null;
  duration: number | null;
  viewsCount: number;
  expiresAt: string;
  createdAt: string;
  viewed: boolean;
  isOwn: boolean;
}

export interface StoryGroup {
  userId: string;
  name: string;
  avatarUrl: string | null;
  stories: StoryItem[];
}

export interface StoryView {
  id: string;
  storyId: string;
  viewerId: string;
  viewedAt: string;
}

export const storiesApi = {
  list: () => api.get<StoryGroup[]>('/stories').then(r => r.data),
  create: (dto: {
    mediaUrl: string;
    mediaType: 'image' | 'video';
    thumbnailUrl?: string;
    mediaKey?: string;
    moodTag?: string;
    duration?: number;
    specialType?: string;
  }) => api.post('/stories', dto).then(r => r.data),
  registerView: (id: string) => api.post(`/stories/${id}/view`).then(r => r.data),
  getViews: (id: string) => api.get<StoryView[]>(`/stories/${id}/views`).then(r => r.data),
  deleteStory: (id: string) => api.delete(`/stories/${id}`).then(r => r.data),
  getPresignedUrl: (type: 'image' | 'video') =>
    api
      .post<{ uploadUrl: string; publicUrl: string; key: string }>(
        `/media/presigned-url?type=${type}&folder=stories`,
      )
      .then(r => r.data),
};
