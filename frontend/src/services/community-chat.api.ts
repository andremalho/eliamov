import api from './api';

export type CommunityType = 'private' | 'public' | 'cycle_auto';

export interface CommunityItem {
  id: string; academyId: string; name: string; description: string | null;
  coverImageUrl: string | null; type: CommunityType; membersCount: number;
  cyclePhase: string | null; createdAt: string;
  isMember: boolean; myRole: 'admin' | 'member' | null;
}

export interface CommunityMessage {
  id: string; communityId: string; userId: string;
  content: string | null; mediaUrl: string | null; mediaType: 'image' | 'video' | 'none';
  replyToId: string | null; createdAt: string;
  user: { id: string; name: string; avatarUrl: string | null } | null;
}

export interface MessagesResponse {
  data: CommunityMessage[]; nextCursor: string | null; hasMore: boolean;
}

export interface CommunityInvite {
  id: string; communityId: string; code: string; expiresAt: string;
}

export const communityChatApi = {
  list: () => api.get<CommunityItem[]>('/communities').then(r => r.data),
  create: (dto: { name: string; description?: string; type?: 'private' | 'public' }) =>
    api.post<CommunityItem>('/communities', dto).then(r => r.data),
  join: (id: string, code?: string) =>
    api.post(`/communities/${id}/join`, { code }).then(r => r.data),
  createInvite: (id: string) =>
    api.post<CommunityInvite>(`/communities/${id}/invite`).then(r => r.data),
  getMessages: (id: string, cursor?: string) => {
    const params = new URLSearchParams();
    if (cursor) params.set('cursor', cursor);
    return api.get<MessagesResponse>(`/communities/${id}/messages?${params}`).then(r => r.data);
  },
  sendMessage: (id: string, dto: { content?: string; mediaUrl?: string; mediaType?: string; replyToId?: string }) =>
    api.post<CommunityMessage>(`/communities/${id}/messages`, dto).then(r => r.data),
  deleteMessage: (communityId: string, msgId: string) =>
    api.delete(`/communities/${communityId}/messages/${msgId}`).then(r => r.data),
  getPresignedUrl: (type: 'image' | 'video') =>
    api.post<{ uploadUrl: string; publicUrl: string; key: string }>(`/media/presigned-url?type=${type}`).then(r => r.data),
};
