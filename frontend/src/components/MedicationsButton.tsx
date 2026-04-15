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
      <button onClick={() => setIsOpen(true)} style={{
        position: 'fixed', bottom: 90, left: 16, zIndex: 40,
        width: 48, height: 48, borderRadius: '50%',
        background: '#fff', border: '1.5px solid #E5E7EB',
        boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 22, transition: 'transform 0.2s',
      }}>
        💊
        {count > 0 && (
          <span style={{
            position: 'absolute', top: -2, right: -2,
            width: 18, height: 18, borderRadius: '50%',
            background: '#7C3AED', color: '#fff',
            fontSize: 10, fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>{count}</span>
        )}
      </button>
      <MedicationsSidebar isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
