import React from 'react';
import { motion } from 'framer-motion';

interface BasicInfoStepProps {
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

const BasicInfoStep: React.FC<BasicInfoStepProps> = ({ data, onChange, onContinue }) => {
  const update = (field: string, value: string) => {
    onChange({ ...data, [field]: value });
  };

  const canContinue = !!(data.name && data.birthDate);

  return (
    <motion.div
      key="basic-info"
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.3 }}
    >
      <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 28, color: '#14161F', marginBottom: 4 }}>
        Suas informações
      </h2>
      <p style={{ color: '#6B7280', fontSize: 14, marginBottom: 24 }}>Conte-nos um pouco sobre você.</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label style={labelStyle}>Nome</label>
          <input
            type="text"
            style={inputStyle}
            value={data.name || ''}
            onChange={(e) => update('name', e.target.value)}
            placeholder="Seu nome"
          />
        </div>
        <div>
          <label style={labelStyle}>Data de nascimento</label>
          <input
            type="date"
            style={inputStyle}
            value={data.birthDate || ''}
            onChange={(e) => update('birthDate', e.target.value)}
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
          className="ob-btn"
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
  );
};

export default BasicInfoStep;
