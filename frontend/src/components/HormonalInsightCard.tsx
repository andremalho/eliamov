import React from 'react';
import { useHormonalInsight } from '../hooks/useHormonalInsight';

const riskColors: Record<string, string> = { low: '#16a34a', moderate: '#d97706', high: '#dc2626' };
const riskLabels: Record<string, string> = { low: 'Baixo', moderate: 'Moderado', high: 'Alto' };
const statusLabels: Record<string, string> = {
  stable: 'Padrão estável',
  possible_anovulatory_pattern: 'Padrão irregular',
  possible_perimenopause_transition: 'Possível transição hormonal',
  needs_clinical_review: 'Atenção clínica recomendada',
};

const S = {
  card: { borderRadius: 16, border: '1px solid #E5E7EB', background: '#fff', padding: 16, display: 'flex', flexDirection: 'column' as const, gap: 12 },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: 16, fontWeight: 600, color: '#1F2937', margin: 0 },
  btn: { fontSize: 12, color: '#7C3AED', background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" },
  error: { fontSize: 12, color: '#DC2626' },
  empty: { fontSize: 14, color: '#6B7280' },
  loading: { fontSize: 14, color: '#6B7280' },
  statusRow: { display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' as const },
  statusText: { fontSize: 14, color: '#374151' },
  badge: (bg: string) => ({ fontSize: 12, fontWeight: 500, padding: '2px 10px', borderRadius: 999, color: '#fff', background: bg }),
  grid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, textAlign: 'center' as const },
  metricBox: { background: '#F9FAFB', borderRadius: 12, padding: 8 },
  metricLabel: { fontSize: 12, color: '#6B7280', margin: 0 },
  metricValue: { fontSize: 20, fontWeight: 700, color: '#1F2937', margin: 0 },
  metricUnit: { fontSize: 12, color: '#9CA3AF', margin: 0 },
  summary: { borderRadius: 12, background: '#F5F3FF', padding: 12, fontSize: 13, color: '#374151', lineHeight: 1.6 },
  footer: { fontSize: 12, color: '#9CA3AF' },
};

export function HormonalInsightCard() {
  const { data, loading, recomputing, error, recompute } = useHormonalInsight();

  if (loading) return <div style={{ ...S.card, ...S.loading }}>Carregando análise hormonal...</div>;

  return (
    <div style={S.card}>
      <div style={S.header}>
        <h3 style={S.title}>Análise Hormonal</h3>
        <button onClick={recompute} disabled={recomputing} style={{ ...S.btn, opacity: recomputing ? 0.4 : 1 }}>
          {recomputing ? 'Recalculando...' : '↻ Atualizar'}
        </button>
      </div>

      {error && <p style={S.error}>{error}</p>}

      {!data && !error && (
        <p style={S.empty}>Nenhuma análise disponível. Registre pelo menos 3 ciclos e clique em Atualizar.</p>
      )}

      {data && (
        <>
          <div style={S.statusRow}>
            <span style={S.statusText}>{statusLabels[data.hormonalStatus]}</span>
            <span style={S.badge(riskColors[data.aubRiskLevel])}>
              AUB: {riskLabels[data.aubRiskLevel]}
            </span>
          </div>

          <div style={S.grid}>
            <div style={S.metricBox}>
              <p style={S.metricLabel}>Média ciclo</p>
              <p style={S.metricValue}>{data.avgCycleLength ?? '—'}</p>
              <p style={S.metricUnit}>dias</p>
            </div>
            <div style={S.metricBox}>
              <p style={S.metricLabel}>Variabilidade</p>
              <p style={S.metricValue}>{data.cycleVariability ?? '—'}</p>
              <p style={S.metricUnit}>dias</p>
            </div>
            <div style={S.metricBox}>
              <p style={S.metricLabel}>Score</p>
              <p style={S.metricValue}>{data.perimenopauseScore}</p>
              <p style={S.metricUnit}>perimeno</p>
            </div>
          </div>

          <div style={S.summary}>{data.patientSummary}</div>

          <p style={S.footer}>Baseado em {data.analyzedCycleCount} ciclos registrados.</p>
        </>
      )}
    </div>
  );
}
