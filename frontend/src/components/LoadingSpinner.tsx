import React from 'react';

export default function LoadingSpinner({ size = 32 }: { size?: number }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 40 }}>
      <style>{`@keyframes elia-spin { to { transform: rotate(360deg); } }`}</style>
      <div
        style={{
          width: size,
          height: size,
          border: '2px solid rgba(20,22,31,0.1)',
          borderTopColor: '#D97757',
          borderRadius: '50%',
          animation: 'elia-spin 0.8s linear infinite',
        }}
      />
    </div>
  );
}
