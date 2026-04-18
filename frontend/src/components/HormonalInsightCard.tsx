import React from 'react';
import { useHormonalInsight } from '../hooks/useHormonalInsight';

/** Tons Lunar Bloom preservando semântica clínica */
const riskTints: Record<string, { bg: string; fg: string; border: string }> = {
  low:      { bg: 'rgba(156,168,154,0.14)', fg: '#5B6B5C', border: '#9CA89A' },
  moderate: { bg: 'rgba(201,169,119,0.16)', fg: '#7A5F2E', border: '#C9A977' },
  high:     { bg: 'rgba(139,58,47,0.08)',   fg: '#8B3A2F', border: '#8B3A2F' },
};
const riskLabels: Record<string, string> = { low: 'Baixo', moderate: 'Moderado', high: 'Alto' };
const statusLabels: Record<string, string> = {
  stable: 'Padrão estável',
  possible_anovulatory_pattern: 'Padrão irregular',
  possible_perimenopause_transition: 'Possível transição hormonal',
  needs_clinical_review: 'Atenção clínica recomendada',
};

const S = {
  card: {
    background: '#FDFAF3',
    border: '1px solid rgba(20,22,31,0.08)',
    padding: 22,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 16,
    fontFamily: "'Figtree', sans-serif",
    color: '#14161F',
  },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  sectionLabel: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 10,
    letterSpacing: '0.28em',
    textTransform: 'uppercase' as const,
    color: '#D97757',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 10,
    marginBottom: 4,
  },
  title: {
    fontFamily: "'Fraunces', serif",
    fontSize: 22,
    fontWeight: 450,
    letterSpacing: '-0.015em',
    color: '#14161F',
    margin: 0,
    lineHeight: 1.15,
  },
  btn: {
    fontSize: 11,
    color: '#14161F',
    background: 'none',
    border: '1px solid rgba(20,22,31,0.12)',
    padding: '6px 14px',
    cursor: 'pointer',
    fontFamily: "'Figtree', sans-serif",
    letterSpacing: '0.14em',
    textTransform: 'uppercase' as const,
    fontWeight: 500,
    transition: 'all 0.25s cubic-bezier(0.16,1,0.3,1)',
  },
  error: { fontSize: 12.5, color: '#8B3A2F', lineHeight: 1.55 },
  empty: { fontSize: 13.5, color: 'rgba(20,22,31,0.62)', lineHeight: 1.55 },
  loading: {
    fontSize: 12,
    color: 'rgba(20,22,31,0.5)',
    fontFamily: "'JetBrains Mono', monospace",
    letterSpacing: '0.2em',
    textTransform: 'uppercase' as const,
  },
  statusRow: { display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' as const },
  statusText: { fontSize: 14, color: '#14161F', letterSpacing: '-0.005em' },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 0,
    borderTop: '1px solid rgba(20,22,31,0.08)',
    borderLeft: '1px solid rgba(20,22,31,0.08)',
  },
  metricBox: {
    padding: '14px 12px',
    borderRight: '1px solid rgba(20,22,31,0.08)',
    borderBottom: '1px solid rgba(20,22,31,0.08)',
    background: '#FDFAF3',
  },
  metricLabel: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 10,
    letterSpacing: '0.2em',
    textTransform: 'uppercase' as const,
    color: 'rgba(20,22,31,0.55)',
    margin: 0,
  },
  metricValue: {
    fontFamily: "'Fraunces', serif",
    fontSize: 26,
    fontWeight: 400,
    letterSpacing: '-0.02em',
    color: '#14161F',
    margin: '4px 0 0',
    lineHeight: 1,
  },
  metricUnit: {
    fontSize: 11,
    color: 'rgba(20,22,31,0.5)',
    margin: '2px 0 0',
    letterSpacing: '0.04em',
  },
  summary: {
    background: 'rgba(217,119,87,0.06)',
    borderLeft: '2px solid #D97757',
    padding: '14px 18px',
    fontFamily: "'Fraunces', serif",
    fontSize: 14,
    fontStyle: 'italic' as const,
    color: '#14161F',
    lineHeight: 1.55,
    letterSpacing: '-0.005em',
  },
  footer: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 10,
    color: 'rgba(20,22,31,0.45)',
    letterSpacing: '0.14em',
    textTransform: 'uppercase' as const,
  },
};

export function HormonalInsightCard() {
  const { data, loading, recomputing, error, recompute } = useHormonalInsight();

  if (loading) {
    return <div style={{ ...S.card, ...S.loading }}>Carregando análise hormonal…</div>;
  }

  return (
    <div style={S.card}>
      <div style={S.header}>
        <div>
          <div style={S.sectionLabel}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#D97757' }} aria-hidden />
            Análise hormonal
          </div>
          <h3 style={S.title}>Seu padrão em <span style={{ fontStyle: 'italic', color: '#B85A3D' }}>detalhes</span></h3>
        </div>
        <button
          onClick={recompute}
          disabled={recomputing}
          style={{ ...S.btn, opacity: recomputing ? 0.5 : 1 }}
          onMouseEnter={(e) => { if (!recomputing) (e.currentTarget as HTMLElement).style.borderColor = '#D97757'; }}
          onMouseLeave={(e) => { if (!recomputing) (e.currentTarget as HTMLElement).style.borderColor = 'rgba(20,22,31,0.12)'; }}
        >
          {recomputing ? 'Recalculando…' : 'Atualizar'}
        </button>
      </div>

      {error && <p style={S.error}>{error}</p>}

      {!data && !error && (
        <p style={S.empty}>
          Nenhuma análise disponível. Registre pelo menos 3 ciclos e clique em Atualizar.
        </p>
      )}

      {data && (() => {
        const risk = riskTints[data.aubRiskLevel] ?? riskTints.low;
        return (
          <>
            <div style={S.statusRow}>
              <span style={S.statusText}>{statusLabels[data.hormonalStatus]}</span>
              <span
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 10.5,
                  fontWeight: 500,
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  padding: '5px 12px',
                  color: risk.fg,
                  background: risk.bg,
                  border: `1px solid ${risk.border}44`,
                }}
              >
                AUB · {riskLabels[data.aubRiskLevel]}
              </span>
            </div>

            <div style={S.grid}>
              <div style={S.metricBox}>
                <p style={S.metricLabel}>Ciclo médio</p>
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

            <p style={S.footer}>Baseado em {data.analyzedCycleCount} ciclos registrados</p>
          </>
        );
      })()}
    </div>
  );
}
