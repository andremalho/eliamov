import React from 'react';
import { motion } from 'framer-motion';
import { Flame, Zap, Heart, Activity, Leaf, Flower2, Check } from 'lucide-react';

const GOALS = [
  { value: 'weight_loss', label: 'Emagrecer', Icon: Flame, color: '#F97316' },
  { value: 'strength', label: 'Ganhar forca', Icon: Zap, color: '#EAB308' },
  { value: 'health', label: 'Melhorar saúde', Icon: Heart, color: '#B85A3D' },
  { value: 'conditioning', label: 'Condicionamento', Icon: Activity, color: '#3B82F6' },
  { value: 'stress', label: 'Reduzir estresse', Icon: Leaf, color: '#22C55E' },
  { value: 'pregnancy', label: 'Preparar gestação', Icon: Flower2, color: '#A855F7' },
];

interface GoalsStepProps {
  selected: string[];
  onChange: (goals: string[]) => void;
  onContinue: () => void;
}

const styles = `
  .ob-goals-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin-top: 16px;
  }
  .ob-goal-card {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 20px 12px;
    border: 2px solid #E5E7EB;
    border-radius: 12px;
    background: #fff;
    cursor: pointer;
    transition: all 0.2s;
    text-align: center;
  }
  .ob-goal-card:hover {
    transform: scale(1.03);
  }
  .ob-goal-card.selected {
    border-color: #14161F;
    background: rgba(217,119,87, 0.05);
  }
  .ob-goal-check {
    position: absolute;
    top: 8px;
    right: 8px;
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: #14161F;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
  }
  .ob-goal-icon {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
  }
  .ob-goal-label {
    font-size: 14px;
    font-weight: 600;
    color: #1F2937;
  }
`;

const GoalsStep: React.FC<GoalsStepProps> = ({ selected, onChange, onContinue }) => {
  const toggle = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value));
    } else if (selected.length < 3) {
      onChange([...selected, value]);
    }
  };

  const canContinue = selected.length > 0;

  return (
    <>
      <style>{styles}</style>
      <motion.div
        key="goals"
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -30 }}
        transition={{ duration: 0.3 }}
      >
        <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 28, color: '#14161F', marginBottom: 4 }}>
          Seus objetivos
        </h2>
        <p style={{ color: '#6B7280', fontSize: 14 }}>
          Selecione 1 a 3 objetivos ({selected.length}/3)
        </p>

        <div className="ob-goals-grid">
          {GOALS.map(({ value, label, Icon, color }) => (
            <div
              key={value}
              className={`ob-goal-card ${selected.includes(value) ? 'selected' : ''}`}
              onClick={() => toggle(value)}
            >
              {selected.includes(value) && (
                <motion.div
                  className="ob-goal-check"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                >
                  <Check size={14} />
                </motion.div>
              )}
              <div className="ob-goal-icon" style={{ background: color }}>
                <Icon size={20} />
              </div>
              <span className="ob-goal-label">{label}</span>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 24 }}>
          <button
            disabled={!canContinue}
            onClick={onContinue}
            style={{
              width: '100%',
              padding: '14px 24px',
              border: 'none',
              borderRadius: 999,
              background: canContinue ? '#14161F' : '#D1D5DB',
              color: '#fff',
              fontSize: 16,
              fontWeight: 600,
              cursor: canContinue ? 'pointer' : 'default',
            }}
          >
            Continuar
          </button>
        </div>
      </motion.div>
    </>
  );
};

export default GoalsStep;
