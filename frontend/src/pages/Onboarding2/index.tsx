import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { onboardingApi, OnboardingStatus } from '../../services/onboarding.api';
import api from '../../services/api';
import OnboardingLayout from './OnboardingLayout';
import ProfileTypeStep from './steps/ProfileTypeStep';
import BasicInfoStep from './steps/BasicInfoStep';
import GoalsStep from './steps/GoalsStep';
import CycleStep from './steps/CycleStep';
import AcademyStep from './steps/AcademyStep';
import TrainerInfoStep from './steps/TrainerInfoStep';
import WelcomeStep from './steps/WelcomeStep';

const STORAGE_KEY = 'eliamov_onboarding_progress';

const PROFILE_TO_FLOW: Record<string, string> = {
  female_user: 'full',
  personal_trainer: 'trainer',
  family_companion: 'companion',
  academy_admin: 'admin',
};

const getSteps = (type: string): string[] => {
  switch (type) {
    case 'full':
      return ['profile', 'basic', 'goals', 'cycle', 'academy'];
    case 'trainer':
      return ['profile', 'basic', 'trainer', 'academy'];
    case 'companion':
      return ['profile', 'basic', 'academy'];
    case 'admin':
      return ['profile', 'basic', 'academy'];
    default:
      return ['profile', 'basic', 'academy'];
  }
};

const NewOnboarding: React.FC = () => {
  const navigate = useNavigate();
  const { setCurrentUser } = useAuth();

  const [status, setStatus] = useState<OnboardingStatus | null>(null);
  const [profileType, setProfileType] = useState<string | null>(null);
  const [stepData, setStepData] = useState<Record<string, any>>({});
  const [goals, setGoals] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showWelcome, setShowWelcome] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const flowType = profileType ? (PROFILE_TO_FLOW[profileType] || 'full') : 'full';
  const steps = getSteps(flowType);
  const currentStepName = steps[currentStepIndex] || 'profile';

  // Load saved progress and API status on mount
  useEffect(() => {
    const load = async () => {
      try {
        // Check localStorage for saved progress
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            if (parsed.profileType) setProfileType(parsed.profileType);
            if (parsed.stepData) setStepData(parsed.stepData);
            if (parsed.goals) setGoals(parsed.goals);
            if (typeof parsed.currentStepIndex === 'number') setCurrentStepIndex(parsed.currentStepIndex);
          } catch {
            // ignore bad localStorage data
          }
        }

        // Load API status
        const apiStatus = await onboardingApi.getStatus();
        setStatus(apiStatus);

        if (apiStatus.isComplete) {
          setShowWelcome(true);
        }
      } catch {
        // If API fails, continue with local state
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Persist progress to localStorage
  const saveProgress = useCallback(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ profileType, stepData, goals, currentStepIndex })
    );
  }, [profileType, stepData, goals, currentStepIndex]);

  useEffect(() => {
    if (!loading) saveProgress();
  }, [saveProgress, loading]);

  const handleProfileContinue = () => {
    if (!profileType) return;
    const newSteps = getSteps(PROFILE_TO_FLOW[profileType] || 'full');
    setCurrentStepIndex(1); // Move past profile step
    // Save immediately
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ profileType, stepData, goals, currentStepIndex: 1 })
    );
  };

  const advanceStep = async (data: Record<string, any>) => {
    const nextIndex = currentStepIndex + 1;
    const isLastStep = nextIndex >= steps.length;
    const apiStep = currentStepIndex; // API steps: profile=0, basic=1, etc.

    // Try to save to API
    try {
      const updatedStatus = await onboardingApi.saveStep(apiStep, {
        ...data,
        profileType,
      });
      setStatus(updatedStatus);
    } catch (err) {
      console.error('Failed to save onboarding step:', err);
      setError('Erro ao salvar. Continuando mesmo assim...');
      setTimeout(() => setError(null), 3000);
    }

    if (isLastStep) {
      setShowWelcome(true);
      localStorage.removeItem(STORAGE_KEY);
    } else {
      setCurrentStepIndex(nextIndex);
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const handleFinish = async () => {
    try {
      const res = await api.get('/auth/me');
      setCurrentUser(res.data);
    } catch {
      // Continue even if refresh fails
    }
    const redirectTo = status?.redirectTo || '/dashboard';
    localStorage.removeItem(STORAGE_KEY);
    navigate(redirectTo);
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#F9FAFB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#7C3AED', fontSize: 18 }}>Carregando...</div>
      </div>
    );
  }

  if (showWelcome) {
    return <WelcomeStep profileType={profileType ?? 'female_user'} onFinish={handleFinish} />;
  }

  return (
    <>
      {error && (
        <div
          style={{
            position: 'fixed',
            top: 16,
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#FEF2F2',
            color: '#DC2626',
            padding: '10px 20px',
            borderRadius: 8,
            fontSize: 14,
            zIndex: 1000,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}
        >
          {error}
        </div>
      )}
      <OnboardingLayout
        currentStep={currentStepIndex}
        totalSteps={steps.length}
        onBack={handleBack}
        canGoBack={currentStepIndex > 0}
      >
        {currentStepName === 'profile' && (
          <ProfileTypeStep
            selected={profileType}
            onSelect={setProfileType}
            onContinue={handleProfileContinue}
          />
        )}
        {currentStepName === 'basic' && (
          <BasicInfoStep
            data={stepData}
            onChange={setStepData}
            onContinue={() =>
              advanceStep({
                name: stepData.name,
                birthDate: stepData.birthDate,
                avatarUrl: stepData.avatarUrl,
              })
            }
          />
        )}
        {currentStepName === 'goals' && (
          <GoalsStep
            selected={goals}
            onChange={setGoals}
            onContinue={() =>
              advanceStep({ fitnessGoal: goals[0], goals })
            }
          />
        )}
        {currentStepName === 'cycle' && (
          <CycleStep
            data={stepData}
            onChange={setStepData}
            onContinue={() =>
              advanceStep({
                lastPeriodDate: stepData.lastPeriodDate,
                cycleDuration: stepData.cycleDuration,
                periodDuration: stepData.periodDuration,
              })
            }
          />
        )}
        {currentStepName === 'academy' && (
          <AcademyStep
            data={stepData}
            onChange={setStepData}
            onContinue={() =>
              advanceStep({ academyCode: stepData.academyCode })
            }
          />
        )}
        {currentStepName === 'trainer' && (
          <TrainerInfoStep
            data={stepData}
            onChange={setStepData}
            onContinue={() =>
              advanceStep({
                cref: stepData.cref,
                specialty: stepData.specialty,
                bio: stepData.bio,
                avatarUrl: stepData.avatarUrl,
              })
            }
          />
        )}
      </OnboardingLayout>
    </>
  );
};

export default NewOnboarding;
