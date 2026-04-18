import React from 'react';
import { motion } from 'framer-motion';

interface AcademyStepProps {
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

const AcademyStep: React.FC<AcademyStepProps> = ({ data, onChange, onContinue }) => {
  const update = (field: string, value: string) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <motion.div
      key="academy"
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.3 }}
    >
      <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 28, color: '#14161F', marginBottom: 4 }}>
        Sua academia
      </h2>
      <p style={{ color: '#6B7280', fontSize: 14, marginBottom: 24 }}>
        Conecte-se a sua academia para uma experiência integrada.
      </p>

      <div>
        <label style={labelStyle}>Codigo da academia</label>
        <input
          type="text"
          style={inputStyle}
          value={data.academyCode || ''}
          onChange={(e) => update('academyCode', e.target.value)}
          placeholder="Codigo da academia"
        />
        <p style={{ color: '#9CA3AF', fontSize: 12, marginTop: 8 }}>
          Digite o codigo fornecido pela sua academia ou deixe vazio para uso individual.
        </p>
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

export default AcademyStep;
