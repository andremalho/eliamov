import api from './api';

export interface AcademyOverview {
  totalMembers: number;
  workoutsThisWeek: number;
  avgFrequency: number;
  activeChallenges: number;
  challengeParticipants: number;
}

export const academyApi = {
  overview: () =>
    api.get<AcademyOverview>('/academy/overview').then((r) => r.data),
};
