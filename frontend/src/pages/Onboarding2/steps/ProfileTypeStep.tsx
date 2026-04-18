import React from 'react';
import { motion } from 'framer-motion';
import { User, ClipboardList, Heart, Building2 } from 'lucide-react';

const PROFILES = [
  { value: 'female_user', label: 'Sou aluna', desc: 'Treino, ciclo e saúde feminina', Icon: User },
  { value: 'personal_trainer', label: 'Sou personal trainer', desc: 'Acompanhe suas alunas', Icon: ClipboardList },
  { value: 'family_companion', label: 'Sou familiar/parceiro', desc: 'Acompanhe quem você ama', Icon: Heart },
  { value: 'academy_admin', label: 'Sou gestor de academia', desc: 'Gerencie sua academia', Icon: Building2 },
];

interface ProfileTypeStepProps {
  selected: string | null;
  onSelect: (v: string) => void;
  onContinue: () => void;
}

const styles = `
  .ob-profile-cards {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-top: 24px;
  }
  .ob-profile-card {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 16px;
    border: 2px solid transparent;
    border-radius: 12px;
    background: #fff;
    cursor: pointer;
    transition: all 0.2s;
  }
  .ob-profile-card:hover {
    transform: scale(1.02);
  }
  .ob-profile-card.selected {
    border-color: #14161F;
    background: rgba(217,119,87, 0.05);
    transform: scale(1.02);
  }
  .ob-profile-icon {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: #14161F;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    color: #fff;
  }
  .ob-profile-label {
    font-weight: 600;
    font-size: 16px;
    color: #1F2937;
  }
  .ob-profile-desc {
    font-size: 13px;
    color: #6B7280;
    margin-top: 2px;
  }
  .ob-btn {
    width: 100%;
    padding: 14px 24px;
    border: none;
    border-radius: 999px;
    background: #14161F;
    color: #fff;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s;
  }
  .ob-btn:hover {
    background: #14161F;
  }
  .ob-btn:disabled {
    opacity: 0.5;
    cursor: default;
  }
`;

const ProfileTypeStep: React.FC<ProfileTypeStepProps> = ({ selected, onSelect, onContinue }) => {
  return (
    <>
      <style>{styles}</style>
      <motion.div
        key="profile-type"
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -30 }}
        transition={{ duration: 0.3 }}
      >
        <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 28, color: '#14161F', marginBottom: 4 }}>
          Quem e você?
        </h2>
        <p style={{ color: '#6B7280', fontSize: 14, marginBottom: 8 }}>Selecione seu perfil para personalizarmos sua experiência.</p>

        <div className="ob-profile-cards">
          {PROFILES.map(({ value, label, desc, Icon }) => (
            <div
              key={value}
              className={`ob-profile-card ${selected === value ? 'selected' : ''}`}
              onClick={() => onSelect(value)}
            >
              <div className="ob-profile-icon">
                <Icon size={24} />
              </div>
              <div>
                <div className="ob-profile-label">{label}</div>
                <div className="ob-profile-desc">{desc}</div>
              </div>
            </div>
          ))}
        </div>

        {selected && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            style={{ marginTop: 24 }}
          >
            <button className="ob-btn" onClick={onContinue}>
              Continuar
            </button>
          </motion.div>
        )}
      </motion.div>
    </>
  );
};

export default ProfileTypeStep;
