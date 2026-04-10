import api from './api';

export interface CalendarConnection {
  id: string;
  userId: string;
  provider: 'google' | 'microsoft' | 'ical';
  isActive: boolean;
  syncWorkouts: boolean;
  syncAppointments: boolean;
  syncCyclePredictions: boolean;
  syncChallenges: boolean;
  createdAt: string;
}

export const calendarApi = {
  connections: () => api.get<CalendarConnection[]>('/calendar/connections').then(r => r.data),
  connectUrl: (provider: 'google' | 'microsoft') =>
    `${api.defaults.baseURL}/calendar/connect/${provider}`,
  disconnect: (id: string) => api.delete(`/calendar/connections/${id}`).then(r => r.data),
  icalFeedUrl: (userId: string) =>
    `${api.defaults.baseURL}/calendar/feed/${userId}.ics`,
  pushEvent: (provider: string, event: { title: string; startAt: string; endAt: string; description?: string }) =>
    api.post('/calendar/events', { ...event, provider }).then(r => r.data),
};
