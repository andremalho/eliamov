import React from 'react';

export default function LoadingSpinner({ size = 36 }: { size?: number }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 40 }}>
      <style>{`@keyframes elia-spin { to { transform: rotate(360deg); } }`}</style>
      <div style={{
        width: size, height: size,
        border: '3px solid #EDE9FE',
        borderTopColor: '#7C3AED',
        borderRadius: '50%',
        animation: 'elia-spin 0.6s linear infinite',
      }} />
    </div>
  );
}
