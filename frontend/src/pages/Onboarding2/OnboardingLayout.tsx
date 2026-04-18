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
    background: var(--cream, #F5EFE6);
    display: flex;
    flex-direction: column;
    font-family: var(--font-ui, 'Figtree', sans-serif);
  }
  .ob-top-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 28px 12px;
    max-width: 640px;
    width: 100%;
    margin: 0 auto;
  }
  .ob-back {
    background: none;
    border: 1px solid transparent;
    cursor: pointer;
    color: var(--ink, #14161F);
    padding: 8px;
    border-radius: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: border-color 0.25s cubic-bezier(0.16, 1, 0.3, 1), background 0.25s;
  }
  .ob-back:disabled { opacity: 0.25; cursor: default; }
  .ob-back:not(:disabled):hover {
    border-color: rgba(20, 22, 31, 0.12);
    background: rgba(20, 22, 31, 0.03);
  }
  .ob-progress {
    display: grid;
    grid-auto-flow: column;
    grid-auto-columns: 1fr;
    align-items: center;
    gap: 6px;
    padding: 4px 28px 24px;
    max-width: 640px;
    width: 100%;
    margin: 0 auto;
  }
  .ob-progress-step {
    position: relative;
    height: 2px;
    background: rgba(20, 22, 31, 0.1);
    transition: background 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .ob-progress-step.done {
    background: var(--ink, #14161F);
  }
  .ob-progress-step.active {
    background: var(--ink, #14161F);
  }
  .ob-progress-step.active::after {
    content: '';
    position: absolute;
    left: 0; top: -1px; bottom: -1px;
    width: 100%;
    background: var(--terracotta, #D97757);
    animation: ob-sweep 1.8s cubic-bezier(0.65, 0, 0.35, 1) infinite;
    transform-origin: left center;
  }
  @keyframes ob-sweep {
    0%   { transform: scaleX(0); opacity: 0.9; }
    60%  { transform: scaleX(1); opacity: 0.9; }
    100% { transform: scaleX(1); opacity: 0; }
  }
  .ob-step-label {
    display: flex;
    align-items: center;
    gap: 10px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.28em;
    text-transform: uppercase;
    color: rgba(20, 22, 31, 0.55);
  }
  .ob-step-label-dot {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: var(--terracotta, #D97757);
  }
  .ob-content {
    flex: 1;
    display: flex;
    justify-content: center;
    padding: clamp(16px, 3vw, 32px) 24px 48px;
  }
  .ob-content > * {
    width: 100%;
    max-width: 560px;
  }
  @media (prefers-reduced-motion: reduce) {
    .ob-progress-step.active::after { animation: none; transform: scaleX(1); opacity: 0.5; }
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
          <button className="ob-back" disabled={!canGoBack} onClick={onBack} aria-label="Voltar">
            <ArrowLeft size={18} />
          </button>
          <Logo size={22} variant="dark" />
          <div className="ob-step-label" aria-live="polite">
            <span className="ob-step-label-dot" aria-hidden />
            {String(currentStep + 1).padStart(2, '0')} / {String(totalSteps).padStart(2, '0')}
          </div>
        </div>
        <div className="ob-progress" role="progressbar" aria-valuenow={currentStep + 1} aria-valuemin={1} aria-valuemax={totalSteps}>
          {Array.from({ length: totalSteps }, (_, i) => (
            <div
              key={i}
              className={`ob-progress-step ${i < currentStep ? 'done' : i === currentStep ? 'active' : ''}`}
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
