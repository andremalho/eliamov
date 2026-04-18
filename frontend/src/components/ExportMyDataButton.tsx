import React, { useState } from 'react';
import { Download } from 'lucide-react';
import api from '../services/api';

export function ExportMyDataButton() {
  const [loading, setLoading] = useState(false);

  async function handleExport() {
    try {
      setLoading(true);
      const response = await api.get('/users/export-my-data', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `meus-dados-elia-${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      alert('Erro ao exportar dados. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        border: '1px solid rgba(20,22,31,0.08)',
        background: '#FDFAF3',
        padding: 20,
        fontFamily: "'Figtree', sans-serif",
      }}
    >
      <div
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 10,
          letterSpacing: '0.28em',
          textTransform: 'uppercase',
          color: '#D97757',
          marginBottom: 8,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#D97757' }} aria-hidden />
        LGPD
      </div>
      <h3
        style={{
          fontFamily: "'Fraunces', serif",
          fontSize: 18,
          fontWeight: 450,
          letterSpacing: '-0.015em',
          color: '#14161F',
          margin: '0 0 8px',
          lineHeight: 1.2,
        }}
      >
        Seus dados são <span style={{ fontStyle: 'italic', color: '#B85A3D' }}>seus</span>.
      </h3>
      <p
        style={{
          fontSize: 12.5,
          color: 'rgba(20,22,31,0.62)',
          lineHeight: 1.55,
          margin: '0 0 16px',
          maxWidth: 440,
        }}
      >
        Baixe todos os registros que você fez na plataforma em um arquivo JSON. Direito garantido pela Lei Geral de Proteção de Dados (Art. 18).
      </p>
      <button
        onClick={handleExport}
        disabled={loading}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          fontSize: 11,
          color: '#14161F',
          background: 'transparent',
          border: '1px solid rgba(20,22,31,0.14)',
          cursor: loading ? 'wait' : 'pointer',
          opacity: loading ? 0.5 : 1,
          fontWeight: 600,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          fontFamily: "'Figtree', sans-serif",
          padding: '10px 16px',
          transition: 'border-color 0.25s',
        }}
        onMouseEnter={(e) => { if (!loading) (e.currentTarget as HTMLElement).style.borderColor = '#D97757'; }}
        onMouseLeave={(e) => { if (!loading) (e.currentTarget as HTMLElement).style.borderColor = 'rgba(20,22,31,0.14)'; }}
      >
        <Download size={13} />
        {loading ? 'Exportando…' : 'Baixar em JSON'}
      </button>
    </div>
  );
}
