import api from './api';

export type ExamStatus = 'pending' | 'completed' | 'reviewed';

export type AlertLevel = 'normal' | 'attention' | 'critical';

export interface LabExam {
  id: string;
  userId: string;
  examType: string;
  examDate: string;
  resultDate: string | null;
  fileUrl: string | null;
  status: ExamStatus;
  aiAnalysis: string | null;
  alertLevel: AlertLevel;
  createdAt: string;
}

export interface CreateLabExamInput {
  examType: string;
  examDate: string;
  resultDate?: string;
  fileUrl?: string;
  notes?: string;
}

export const labExamsApi = {
  list: () => api.get<LabExam[]>('/lab-exams').then((r) => r.data),
  create: (input: CreateLabExamInput) =>
    api.post<LabExam>('/lab-exams', input).then((r) => r.data),
  update: (id: string, dto: Partial<CreateLabExamInput>) =>
    api.patch<LabExam>(`/lab-exams/${id}`, dto).then((r) => r.data),
  remove: (id: string) => api.delete(`/lab-exams/${id}`).then((r) => r.data),
};
