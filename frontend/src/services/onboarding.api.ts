import api from './api';

export interface OnboardingStatus {
  currentStep: number;
  totalSteps: number;
  isComplete: boolean;
  profileType: string;
  nextStepFields: string[];
  redirectTo: string;
}

export const onboardingApi = {
  getStatus: () => api.get<OnboardingStatus>('/auth/onboarding/status').then(r => r.data),
  saveStep: (step: number, data: Record<string, any>) =>
    api.patch<OnboardingStatus>('/auth/onboarding/step', { step, data }).then(r => r.data),
};
