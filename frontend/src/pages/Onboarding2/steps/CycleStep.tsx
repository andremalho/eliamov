import React from 'react';
import { motion } from 'framer-motion';

interface CycleStepProps {
  data: Record<string, any>;
  onChange: (data: Record<string, any>) => void;
  onContinue: () => void;
}

const styles = `
  .ob-range-container {
    margin-top: 8px;
  }
  .ob-range {
    -webkit-appearance: none;
    appearance: none;
    width: 100%;
    height: 6px;
    border-radius: 3px;
    background: #E5E7EB;
    outline: none;
  }
  .ob-range::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: #7C3AED;
    cursor: pointer;
    border: 3px solid #fff;
    box-shadow: 0 1px 4px rgba(0,0,0,0.15);
  }
  .ob-range::-moz-range-thumb {
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: #7C3AED;
    cursor: pointer;
    border: 3px solid #fff;
    box-shadow: 0 1px 4px rgba(0,0,0,0.15);
  }
  .ob-range:disabled {
    opacity: 0.4;
  }
  .ob-range-value {
    display: inline-block;
    background: #7C3AED;
    color: #fff;
    font-size: 13px;
    font-weight: 600;
    padding: 2px 10px;
    border-radius: 999px;
    margin-left: 8px;
  }
  .ob-checkbox-row {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-top: 20px;
    padding: 12px 16px;
    background: #FFF7ED;
    border-radius: 10px;
    cursor: pointer;
  }
  .ob-checkbox-row input[type="checkbox"] {
    accent-color: #7C3AED;
    width: 18px;
    height: 18px;
  }
`;

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

const CycleStep: React.FC<CycleStepProps> = ({ data, onChange, onContinue }) => {
  const skipCycle = !!data.skipCycle;

  const update = (field: string, value: any) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <>
      <style>{styles}</style>
      <motion.div
        key="cycle"
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -30 }}
        transition={{ duration: 0.3 }}
      >
        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, color: '#2D1B4E', marginBottom: 4 }}>
          Sobre seu ciclo
        </h2>
        <p style={{ color: '#6B7280', fontSize: 14, marginBottom: 24 }}>
          Essas informacoes sao privadas e ajudam a personalizar seu plano de treino.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, opacity: skipCycle ? 0.4 : 1, pointerEvents: skipCycle ? 'none' : 'auto', transition: 'opacity 0.3s' }}>
          <div>
            <label style={labelStyle}>Quando foi seu ultimo periodo?</label>
            <input
              type="date"
              style={inputStyle}
              value={data.lastPeriodDate || ''}
              onChange={(e) => update('lastPeriodDate', e.target.value)}
              disabled={skipCycle}
            />
          </div>

          <div>
            <label style={labelStyle}>
              Quantos dias dura seu ciclo normalmente?
              <span className="ob-range-value">{data.cycleDuration || 28} dias</span>
            </label>
            <div className="ob-range-container">
              <input
                type="range"
                className="ob-range"
                min={21}
                max={35}
                value={data.cycleDuration || 28}
                onChange={(e) => update('cycleDuration', Number(e.target.value))}
                disabled={skipCycle}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#9CA3AF', marginTop: 4 }}>
                <span>21</span>
                <span>35</span>
              </div>
            </div>
          </div>

          <div>
            <label style={labelStyle}>
              Quantos dias dura seu periodo?
              <span className="ob-range-value">{data.periodDuration || 5} dias</span>
            </label>
            <div className="ob-range-container">
              <input
                type="range"
                className="ob-range"
                min={3}
                max={7}
                value={data.periodDuration || 5}
                onChange={(e) => update('periodDuration', Number(e.target.value))}
                disabled={skipCycle}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#9CA3AF', marginTop: 4 }}>
                <span>3</span>
                <span>7</span>
              </div>
            </div>
          </div>
        </div>

        <label className="ob-checkbox-row" onClick={() => update('skipCycle', !skipCycle)}>
          <input type="checkbox" checked={skipCycle} onChange={() => update('skipCycle', !skipCycle)} />
          <span style={{ fontSize: 14, color: '#92400E' }}>Prefiro nao informar agora</span>
        </label>

        <div style={{ marginTop: 24 }}>
          <button
            onClick={onContinue}
            style={{
              width: '100%',
              padding: '14px 24px',
              border: 'none',
              borderRadius: 999,
              background: '#7C3AED',
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
    </>
  );
};

export default CycleStep;
