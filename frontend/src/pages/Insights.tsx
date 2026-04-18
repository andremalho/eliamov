import React, { useState } from 'react';
import { insightsApi, InsightsResponse } from '../services/insights.api';
import { formatDateTimeBR } from '../utils/format';
import Markdown from '../components/Markdown';
import Layout from '../components/Layout';

const s = {
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 20,
    fontFamily: "'Figtree', sans-serif",
  },
  header: {
    textAlign: 'center' as const,
    marginBottom: 4,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #FBEAE1 0%, #EEE7DB 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 14px',
  },
  title: {
    fontSize: 16,
    fontWeight: 600,
    color: '#111827',
    margin: '0 0 4px',
  },
  subtitle: {
    fontSize: 12,
    color: '#6B7280',
    margin: 0,
  },
  button: (loading: boolean) => ({
    width: '100%',
    padding: '13px 0',
    border: 'none',
    borderRadius: 12,
    background: loading
      ? 'linear-gradient(135deg, #D97757 0%, #14161F 100%)'
      : 'linear-gradient(135deg, #14161F 0%, #14161F 100%)',
    color: '#fff',
    fontSize: 14,
    fontWeight: 600,
    fontFamily: "'Figtree', sans-serif",
    cursor: loading ? 'not-allowed' : 'pointer',
    opacity: loading ? 0.8 : 1,
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    boxShadow: '0 2px 8px rgba(124, 58, 237, 0.25)',
  }),
  resultCard: {
    background: '#fff',
    border: '1px solid #E5E7EB',
    borderLeft: '3px solid #14161F',
    borderRadius: 14,
    padding: 18,
    marginTop: 0,
  },
  resultHeader: {
    display: 'flex',
    justifyContent: 'space-between' as const,
    alignItems: 'center',
    marginBottom: 14,
    paddingBottom: 12,
    borderBottom: '1px solid #F3F4F6',
  },
  resultTitle: {
    fontSize: 14,
    fontWeight: 600,
    color: '#111827',
    margin: 0,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  timestamp: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  badge: (isAi: boolean) => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    fontSize: 10,
    fontWeight: 600,
    padding: '3px 8px',
    borderRadius: 20,
    background: isAi ? '#FBEAE1' : '#FEF3C7',
    color: isAi ? '#14161F' : '#D97706',
  }),
  error: {
    background: '#FEF2F2',
    border: '1px solid #FECACA',
    borderRadius: 10,
    padding: '10px 14px',
    fontSize: 13,
    color: '#DC2626',
  },
  emptyState: {
    textAlign: 'center' as const,
    padding: '48px 20px',
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: '50%',
    background: '#FDFAF3',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 16px',
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: 600,
    color: '#374151',
    margin: '0 0 6px',
  },
  emptyText: {
    fontSize: 12,
    color: '#9CA3AF',
    margin: 0,
  },
  spinner: {
    display: 'inline-block',
    width: 16,
    height: 16,
    border: '2px solid rgba(255,255,255,0.3)',
    borderTopColor: '#fff',
    borderRadius: '50%',
    animation: 'spin 0.6s linear infinite',
  },
};

const BrainIcon = ({ size = 24, color = '#14161F' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2a5 5 0 0 1 5 5c0 .8-.2 1.5-.5 2.2A5 5 0 0 1 19 14a5 5 0 0 1-3 4.6V22h-4v-3.4A5 5 0 0 1 9 14a5 5 0 0 1 2.5-4.3A5 5 0 0 1 7 7a5 5 0 0 1 5-5z" />
    <path d="M12 2v20" />
    <path d="M9 8.5c-1 .3-2 1.2-2 2.5" />
    <path d="M15 8.5c1 .3 2 1.2 2 2.5" />
    <path d="M9 14c-1 .5-2 1.5-2 3" />
    <path d="M15 14c1 .5 2 1.5 2 3" />
  </svg>
);

const SparkleIcon = () => (
  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3v18M3 12h18M5.6 5.6l12.8 12.8M18.4 5.6L5.6 18.4" />
  </svg>
);

export default function Insights() {
  const [data, setData] = useState<InsightsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await insightsApi.generate();
      setData(res);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Falha ao gerar insights');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="" subtitle="">
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={s.container}>
        {/* Header */}
        <div style={s.header}>
          <div style={s.iconCircle}>
            <BrainIcon size={28} color="#14161F" />
          </div>
          <h1 style={s.title}>Insights IA</h1>
          <p style={s.subtitle}>Análise personalizada baseada nos seus dados</p>
        </div>

        {/* Generate Button */}
        <button
          style={s.button(loading)}
          onClick={generate}
          disabled={loading}
        >
          {loading ? (
            <>
              <span style={s.spinner} />
              Analisando...
            </>
          ) : (
            <>
              <SparkleIcon />
              {data ? 'Gerar novamente' : 'Gerar insights'}
            </>
          )}
        </button>

        {/* Error */}
        {error && <div style={s.error}>{error}</div>}

        {/* Result Card */}
        {data && (
          <div style={s.resultCard}>
            <div style={s.resultHeader}>
              <div>
                <h3 style={s.resultTitle}>
                  <BrainIcon size={16} color="#14161F" />
                  Sua análise
                </h3>
                <span style={s.timestamp}>
                  {formatDateTimeBR(data.generatedAt)}
                </span>
              </div>
              <span style={s.badge(data.usingAi)}>
                {data.usingAi ? '✦ AI' : '○ Offline'}
              </span>
            </div>
            <Markdown>{data.text}</Markdown>
          </div>
        )}

        {/* Empty State */}
        {!data && !loading && !error && (
          <div style={s.emptyState}>
            <div style={s.emptyIcon}>
              <BrainIcon size={32} color="#E89A80" />
            </div>
            <p style={s.emptyTitle}>Nenhum insight gerado ainda</p>
            <p style={s.emptyText}>
              Toque no botao acima para gerar sua análise personalizada
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}
