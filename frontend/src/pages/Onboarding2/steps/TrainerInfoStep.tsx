import React from 'react';
import { motion } from 'framer-motion';

interface TrainerInfoStepProps {
  data: Record<string, any>;
  onChange: (data: Record<string, any>) => void;
  onContinue: () => void;
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 16px',
  border: '1px solid #D1D5DB',
  borderRadius: 10,
  fontSize: 15,
  outline: 'none',
  background: '#fff',
  boxSizing: 'border-box',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 13,
  fontWeight: 600,
  color: '#374151',
  marginBottom: 6,
};

const TrainerInfoStep: React.FC<TrainerInfoStepProps> = ({ data, onChange, onContinue }) => {
  const update = (field: string, value: string) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <motion.div
      key="trainer-info"
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.3 }}
    >
      <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 28, color: '#14161F', marginBottom: 4 }}>
        Dados profissionais
      </h2>
      <p style={{ color: '#6B7280', fontSize: 14, marginBottom: 24 }}>
        Complete suas informações para começar a atender.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label style={labelStyle}>Registro CREF</label>
          <input
            type="text"
            style={inputStyle}
            value={data.cref || ''}
            onChange={(e) => update('cref', e.target.value)}
            placeholder="Registro CREF"
          />
        </div>
        <div>
          <label style={labelStyle}>Sua especialidade</label>
          <input
            type="text"
            style={inputStyle}
            value={data.specialty || ''}
            onChange={(e) => update('specialty', e.target.value)}
            placeholder="Sua especialidade"
          />
        </div>
        <div>
          <label style={labelStyle}>Bio profissional</label>
          <textarea
            style={{ ...inputStyle, resize: 'vertical' }}
            rows={4}
            value={data.bio || ''}
            onChange={(e) => update('bio', e.target.value)}
            placeholder="Bio profissional"
          />
        </div>
        <div>
          <label style={labelStyle}>Foto de perfil</label>
          <input
            type="text"
            style={inputStyle}
            value={data.avatarUrl || ''}
            onChange={(e) => update('avatarUrl', e.target.value)}
            placeholder="URL da sua foto"
          />
        </div>
      </div>

      <div style={{ marginTop: 24 }}>
        <button
          onClick={onContinue}
          style={{
            width: '100%',
            padding: '14px 24px',
            border: 'none',
            borderRadius: 999,
            background: '#14161F',
            color: '#fff',
            fontSize: 16,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Continuar
        </button>
      </div>
    </motion.div>
  );
};

export default TrainerInfoStep;
