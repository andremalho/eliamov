import api from './api';

export type AppointmentStatus =
  | 'scheduled'
  | 'confirmed'
  | 'cancelled'
  | 'completed';

export type AppointmentType = 'in_person' | 'teleconsult';

export interface Appointment {
  id: string;
  userId: string;
  professionalId: string;
  scheduledAt: string;
  duration: number;
  type: AppointmentType;
  status: AppointmentStatus;
  notes: string | null;
  meetingUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAppointmentInput {
  professionalId: string;
  scheduledAt: string;
  duration?: number;
  type?: AppointmentType;
  notes?: string;
}

export const appointmentsApi = {
  list: () => api.get<Appointment[]>('/appointments').then((r) => r.data),
  create: (input: CreateAppointmentInput) =>
    api.post<Appointment>('/appointments', input).then((r) => r.data),
  update: (id: string, dto: Partial<CreateAppointmentInput>) =>
    api.patch<Appointment>(`/appointments/${id}`, dto).then((r) => r.data),
  remove: (id: string) =>
    api.delete(`/appointments/${id}`).then((r) => r.data),
};
