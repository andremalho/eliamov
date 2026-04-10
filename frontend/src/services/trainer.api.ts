import api from './api';

export interface TrainerStudent {
  id: string;
  name: string;
  avatarUrl: string | null;
  permissions: { viewWorkouts: boolean; viewProgress: boolean; viewCycleData: boolean };
}

export interface TrainerDashboardData {
  totalStudents: number;
  prescriptionsThisWeek: number;
  activeToday: number;
  students: TrainerStudent[];
}

export interface StudentWorkout {
  id: string;
  type: string;
  title: string;
  duration: number;
  distance: number | null;
  calories: number | null;
  startedAt: string;
}

export interface StudentProgress {
  currentWeight: number | null;
  currentHeight: number | null;
  fitnessLevel: string | null;
  fitnessGoal: string | null;
  weightHistory: { id: string; date: string; weight: number; waist: number | null }[];
}

export interface Prescription {
  id: string;
  trainerId: string;
  studentId: string;
  title: string;
  notes: string | null;
  workoutPlan: any;
  scheduledDates: string[] | null;
  status: 'pending' | 'done' | 'skipped';
  createdAt: string;
  student?: { id: string; name: string };
}

export const trainerApi = {
  dashboard: () =>
    api.get<TrainerDashboardData>('/trainer/dashboard').then((r) => r.data),
  studentWorkouts: (studentId: string) =>
    api.get<StudentWorkout[]>(`/trainer/students/${studentId}/workouts`).then((r) => r.data),
  studentProgress: (studentId: string) =>
    api.get<StudentProgress>(`/trainer/students/${studentId}/progress`).then((r) => r.data),
  prescribe: (studentId: string, dto: { title: string; notes?: string; workoutPlan?: any; scheduledDates?: string[] }) =>
    api.post(`/trainer/students/${studentId}/prescribe`, dto).then((r) => r.data),
  prescriptions: () =>
    api.get<Prescription[]>('/trainer/prescriptions').then((r) => r.data),
  commentWorkout: (studentId: string, dto: { workoutId: string; comment: string }) =>
    api.post(`/trainer/students/${studentId}/comment`, dto).then((r) => r.data),
};
