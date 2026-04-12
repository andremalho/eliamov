import api from './api';

export interface MHQuestion {
  index: number;
  text: string;
}

export interface MHAssessment {
  id: string;
  type: string;
  totalScore: number;
  severity: string;
  date: string;
}

export interface MeditationSuggestion {
  title: string;
  duration: string;
  description: string;
}

export interface MeditationsResponse {
  suggestions: MeditationSuggestion[];
  basedOn: {
    phq9Score: number;
    phq9Severity: string | null;
    gad7Score: number;
    gad7Severity: string | null;
  };
}

export const mentalHealthApi = {
  questions: (type: 'phq9' | 'gad7') =>
    api.get<MHQuestion[]>(`/mental-health/questions/${type}`).then((r) => r.data),

  submit: (type: string, answers: number[]) =>
    api.post<MHAssessment>('/mental-health/assessment', { type, answers }).then((r) => r.data),

  history: (type: string) =>
    api.get<MHAssessment[]>(`/mental-health/history/${type}`).then((r) => r.data),

  latest: () =>
    api.get<{ phq9: MHAssessment | null; gad7: MHAssessment | null }>('/mental-health/latest').then((r) => r.data),

  meditations: () =>
    api.get<MeditationsResponse>('/mental-health/meditations').then((r) => r.data),
};
