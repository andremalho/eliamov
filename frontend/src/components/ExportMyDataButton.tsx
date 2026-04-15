import React, { useState } from 'react';
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
      link.setAttribute('download', `meus-dados-eliamov-${new Date().toISOString().split('T')[0]}.json`);
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
    <div style={{ border: '1px solid #E5E7EB', borderRadius: 16, padding: 16, background: '#fff' }}>
      <h3 style={{ fontSize: 14, fontWeight: 600, color: '#1F2937', marginBottom: 4 }}>Meus dados (LGPD)</h3>
      <p style={{ fontSize: 12, color: '#6B7280', marginBottom: 12, lineHeight: 1.5 }}>
        Voce tem direito de baixar todos os seus dados registrados no EliaMov a qualquer momento, conforme a Lei Geral de Protecao de Dados.
      </p>
      <button onClick={handleExport} disabled={loading} style={{
        fontSize: 13, color: '#7C3AED', background: 'none', border: 'none',
        cursor: loading ? 'wait' : 'pointer', opacity: loading ? 0.5 : 1,
        fontWeight: 500, fontFamily: "'DM Sans', sans-serif",
      }}>
        {loading ? 'Exportando...' : '⬇ Baixar meus dados em JSON'}
      </button>
    </div>
  );
}
