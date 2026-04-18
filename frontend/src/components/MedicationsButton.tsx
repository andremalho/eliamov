import React, { useState, useEffect } from 'react';
import { MedicationsSidebar } from './MedicationsSidebar';
import { medicationsApi } from '../services/medications.api';

export function MedicationsButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [count, setCount] = useState(0);

  useEffect(() => {
    medicationsApi.list().then(list => setCount(list.length)).catch(() => {});
  }, [isOpen]);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        aria-label="Medicações"
        style={{
          position: 'fixed',
          bottom: 92,
          left: 18,
          zIndex: 40,
          width: 48,
          height: 48,
          borderRadius: '50%',
          background: '#FDFAF3',
          border: '1px solid rgba(20,22,31,0.12)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 20,
          transition: 'border-color 0.3s cubic-bezier(0.16,1,0.3,1), transform 0.3s',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.borderColor = '#D97757';
          (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.borderColor = 'rgba(20,22,31,0.12)';
          (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
        }}
      >
        💊
        {count > 0 && (
          <span
            style={{
              position: 'absolute',
              top: -4,
              right: -4,
              minWidth: 20,
              height: 20,
              padding: '0 6px',
              borderRadius: '50%',
              background: '#14161F',
              color: '#F5EFE6',
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: '0.02em',
              fontFamily: "'JetBrains Mono', monospace",
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid #D97757',
            }}
          >
            {count}
          </span>
        )}
      </button>
      <MedicationsSidebar isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
