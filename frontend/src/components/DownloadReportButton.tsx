import React, { useState } from 'react';
import api from '../services/api';

export function DownloadReportButton({ patientName }: { patientName: string }) {
  const [loading, setLoading] = useState(false);

  async function handleDownload() {
    try {
      setLoading(true);
      const response = await api.get(
        `/report/consultation?name=${encodeURIComponent(patientName)}`,
        { responseType: 'blob' },
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `relatorio-saude-${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      alert('Erro ao gerar relatorio. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <button onClick={handleDownload} disabled={loading} style={{
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '10px 18px', borderRadius: 12, border: 'none',
      background: '#7C3AED', color: '#fff', fontSize: 14, fontWeight: 600,
      cursor: loading ? 'wait' : 'pointer', opacity: loading ? 0.6 : 1,
      fontFamily: "'DM Sans', sans-serif", transition: 'background 0.15s',
    }}>
      {loading ? '⏳ Gerando PDF...' : '📄 Baixar relatorio para consulta'}
    </button>
  );
}
