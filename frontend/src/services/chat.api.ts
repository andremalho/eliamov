import api from './api';

export interface ChatMessage {
  id: string;
  userId: string;
  sender: 'user' | 'professional' | 'ai';
  professionalId: string | null;
  content: string;
  conversationId: string | null;
  read: boolean;
  createdAt: string;
}

export interface CreateChatInput {
  content: string;
  professionalId?: string;
  conversationId?: string;
}

export const chatApi = {
  list: () => api.get<ChatMessage[]>('/chat').then((r) => r.data),
  getConversation: (conversationId: string) =>
    api.get<ChatMessage[]>(`/chat/conversation/${conversationId}`).then((r) => r.data),
  create: (input: CreateChatInput) =>
    api.post<ChatMessage>('/chat', input).then((r) => r.data),
  markAsRead: (id: string) =>
    api.patch<ChatMessage>(`/chat/${id}/read`).then((r) => r.data),
  remove: (id: string) =>
    api.delete(`/chat/${id}`).then((r) => r.data),
};
