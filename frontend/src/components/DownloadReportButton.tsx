import React, { useState } from 'react';
import { FileText } from 'lucide-react';
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
      link.setAttribute('download', `relatório-saúde-${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      alert('Erro ao gerar relatório. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 10,
        padding: '14px 22px',
        border: 'none',
        borderRadius: 2,
        background: loading ? 'rgba(20,22,31,0.5)' : '#14161F',
        color: '#F5EFE6',
        fontSize: 12,
        fontWeight: 600,
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        cursor: loading ? 'wait' : 'pointer',
        fontFamily: "'Figtree', sans-serif",
        transition: 'background 0.3s ease',
      }}
      onMouseEnter={(e) => { if (!loading) (e.currentTarget as HTMLElement).style.background = '#D97757'; }}
      onMouseLeave={(e) => { if (!loading) (e.currentTarget as HTMLElement).style.background = '#14161F'; }}
    >
      <FileText size={14} />
      {loading ? 'Gerando PDF…' : 'Baixar relatório para consulta'}
    </button>
  );
}
