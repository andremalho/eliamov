import api from './api';
import { User } from '../contexts/AuthContext';

export interface UpdateProfileInput {
  birthDate?: string;
  weight?: number;
  height?: number;
  healthConditions?: string[];
  fitnessLevel?: 'sedentary' | 'beginner' | 'intermediate' | 'advanced';
  fitnessGoal?:
    | 'weight_loss'
    | 'health'
    | 'strength'
    | 'wellbeing'
    | 'pregnancy'
    | 'bone_health';
  profile?: Record<string, any>;
  markOnboardingComplete?: boolean;
}

export const usersApi = {
  updateMe: (input: UpdateProfileInput) =>
    api.patch<User>('/users/me', input).then((r) => r.data),
};
