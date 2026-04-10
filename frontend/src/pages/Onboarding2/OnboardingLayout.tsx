import React from 'react';
import { AnimatePresence } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import Logo from '../../components/Logo';

interface OnboardingLayoutProps {
  currentStep: number;
  totalSteps: number;
  onBack?: () => void;
  canGoBack: boolean;
  children: React.ReactNode;
}

const styles = `
  .ob-screen {
    min-height: 100vh;
    background: #F9FAFB;
    display: flex;
    flex-direction: column;
  }
  .ob-top-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 24px;
  }
  .ob-back {
    background: none;
    border: none;
    cursor: pointer;
    color: #374151;
    padding: 4px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: opacity 0.2s;
  }
  .ob-back:disabled {
    opacity: 0.3;
    cursor: default;
  }
  .ob-back:not(:disabled):hover {
    background: #F3F4F6;
  }
  .ob-brand {
    font-family: 'Cormorant Garamond', serif;
    font-size: 20px;
    font-weight: 600;
    color: #2D1B4E;
  }
  .ob-progress {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 8px 24px 16px;
  }
  .ob-dot {
    width: 32px;
    height: 6px;
    border-radius: 3px;
    background: #E5E7EB;
    transition: background 0.3s, transform 0.3s;
  }
  .ob-dot.done {
    background: #7C3AED;
  }
  .ob-dot.active {
    background: #7C3AED;
    animation: ob-pulse 2s infinite;
  }
  @keyframes ob-pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
  .ob-content {
    flex: 1;
    display: flex;
    justify-content: center;
    padding: 24px;
  }
  .ob-content > * {
    width: 100%;
    max-width: 480px;
  }
`;

const OnboardingLayout: React.FC<OnboardingLayoutProps> = ({
  currentStep,
  totalSteps,
  onBack,
  canGoBack,
  children,
}) => {
  return (
    <>
      <style>{styles}</style>
      <div className="ob-screen">
        <div className="ob-top-bar">
          <button className="ob-back" disabled={!canGoBack} onClick={onBack}>
            <ArrowLeft size={20} />
          </button>
          <span className="ob-brand"><Logo size={20} variant="dark" /></span>
          <div style={{ width: 20 }} />
        </div>
        <div className="ob-progress">
          {Array.from({ length: totalSteps }, (_, i) => (
            <div
              key={i}
              className={`ob-dot ${i < currentStep ? 'done' : i === currentStep ? 'active' : ''}`}
            />
          ))}
        </div>
        <div className="ob-content">
          <AnimatePresence mode="wait">{children}</AnimatePresence>
        </div>
      </div>
    </>
  );
};

export default OnboardingLayout;
