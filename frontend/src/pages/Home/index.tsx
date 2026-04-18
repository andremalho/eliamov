import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDashboard } from '../../hooks/useDashboard';
import { DailyLogQuickEntry } from '../../components/DailyLogQuickEntry';
import { PhaseContextCard } from '../../components/PhaseContextCard';
import Layout from '../../components/Layout';

const PHASE_NAMES: Record<string, string> = {
  menstrual: 'Menstrual', follicular: 'Folicular', ovulatory: 'Ovulatória', luteal: 'Lútea', unknown: 'Ciclo não registrado',
};
const PHASE_TINTS: Record<string, string> = {
  menstrual: '#B85A3D',
  follicular: '#9CA89A',
  ovulatory: '#C9A977',
  luteal: '#D97757',
  unknown: 'rgba(245,239,230,0.3)',
};
const TREND_LABELS: Record<string, string> = {
  improving: '↓ Melhorando', stable: '→ Estável', worsening: '↑ Atenção', insufficient_data: '— Sem dados',
};

const SHORTCUTS = [
  { label: 'Treino', icon: '🏋️', path: '/training' },
  { label: 'Nutrição', icon: '🥗', path: '/nutrition' },
  { label: 'Ciclo', icon: '🩸', path: '/cycle' },
  { label: 'Mente', icon: '🧠', path: '/mental-health' },
];

const ALERT_STYLES: Record<string, { bg: string; border: string; color: string }> = {
  alert: { bg: 'rgba(139,58,47,0.06)', border: '#8B3A2F', color: '#8B3A2F' },
  warning: { bg: 'rgba(201,169,119,0.1)', border: '#C9A977', color: '#7A5F2E' },
  info: { bg: 'rgba(20,22,31,0.04)', border: '#14161F', color: '#14161F' },
};

const GRAIN =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='200' height='200' filter='url(%23n)' opacity='0.9'/></svg>";

function CardShell({ children, onClick, clickable }: { children: React.ReactNode; onClick?: () => void; clickable?: boolean }) {
  const style: React.CSSProperties = {
    background: '#FDFAF3',
    border: '1px solid rgba(20,22,31,0.08)',
    padding: 18,
    textAlign: 'left',
    cursor: clickable ? 'pointer' : 'default',
    fontFamily: "'Figtree', sans-serif",
    transition: 'border-color 0.3s ease, transform 0.3s cubic-bezier(0.16,1,0.3,1)',
    display: 'block',
    width: '100%',
  };
  if (clickable) {
    return (
      <button
        type="button"
        onClick={onClick}
        style={style}
        onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.borderColor = '#D97757')}
        onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.borderColor = 'rgba(20,22,31,0.08)')}
      >
        {children}
      </button>
    );
  }
  return <div style={style}>{children}</div>;
}

export default function Home() {
  const { data, loading } = useDashboard();
  const navigate = useNavigate();

  if (loading) {
    return (
      <Layout>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
          <div
            style={{
              width: 28,
              height: 28,
              border: '2px solid rgba(20,22,31,0.1)',
              borderTopColor: '#D97757',
              borderRadius: '50%',
              animation: 'elia-spin 0.8s linear infinite',
            }}
          />
          <style>{`@keyframes elia-spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </Layout>
    );
  }

  const phase = data?.phaseContext?.phase ?? 'unknown';
  const phaseTint = PHASE_TINTS[phase] ?? '#9CA89A';
  const phaseName = PHASE_NAMES[phase] ?? 'Desconhecida';

  return (
    <Layout>
      <div
        style={{
          maxWidth: 560,
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          fontFamily: "'Figtree', sans-serif",
        }}
      >
        {/* ════ CARD PRINCIPAL — FASE DO CICLO ════ */}
        <div
          style={{
            position: 'relative',
            background: '#14161F',
            color: '#F5EFE6',
            padding: '28px 24px',
            overflow: 'hidden',
          }}
        >
          {/* Grain */}
          <div
            aria-hidden
            style={{
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
              opacity: 0.05,
              mixBlendMode: 'overlay',
              backgroundImage: `url("${GRAIN}")`,
            }}
          />
          {/* Aurora com cor da fase */}
          <div
            aria-hidden
            style={{
              position: 'absolute',
              top: '-40%',
              right: '-30%',
              width: '90%',
              height: '140%',
              background: `radial-gradient(closest-side, ${phaseTint}55, transparent 70%)`,
              filter: 'blur(40px)',
              pointerEvents: 'none',
            }}
          />
          <div style={{ position: 'relative' }}>
            <div
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 10,
                letterSpacing: '0.3em',
                textTransform: 'uppercase',
                color: 'rgba(245,239,230,0.55)',
                marginBottom: 12,
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: phaseTint, display: 'inline-block' }} />
              Fase atual
            </div>
            <h1
              style={{
                fontFamily: "'Fraunces', serif",
                fontSize: 38,
                fontWeight: 400,
                letterSpacing: '-0.03em',
                margin: '0 0 8px',
                lineHeight: 1,
                color: '#F5EFE6',
              }}
            >
              {phaseName}
            </h1>
            {data?.phaseContext?.cycleDay && (
              <p
                style={{
                  fontFamily: "'Figtree', sans-serif",
                  fontSize: 13.5,
                  color: 'rgba(245,239,230,0.72)',
                  margin: 0,
                }}
              >
                Dia {data.phaseContext.cycleDay} do ciclo
              </p>
            )}
            {data?.nextPeriodDays !== null && data?.nextPeriodDays !== undefined && data.nextPeriodDays > 0 && (
              <p
                style={{
                  fontFamily: "'Figtree', sans-serif",
                  fontSize: 13,
                  color: 'rgba(245,239,230,0.6)',
                  margin: '3px 0 0',
                }}
              >
                Próxima menstruação em {data.nextPeriodDays} dias
              </p>
            )}
            {(data?.streakDays ?? 0) > 0 && (
              <div
                style={{
                  marginTop: 18,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  border: '1px solid rgba(245,239,230,0.18)',
                  padding: '6px 14px',
                  fontSize: 12,
                  fontFamily: "'Figtree', sans-serif",
                  letterSpacing: '0.04em',
                  color: 'rgba(245,239,230,0.9)',
                }}
              >
                <span style={{ color: '#D97757' }}>●</span>
                {data!.streakDays} dia{data!.streakDays > 1 ? 's' : ''} de registro contínuo
              </div>
            )}
          </div>
        </div>

        {/* ════ MÉTRICAS RÁPIDAS ════ */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          <CardShell clickable onClick={() => navigate('/mental-health')}>
            <p
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 10,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: 'rgba(20,22,31,0.5)',
                margin: 0,
              }}
            >
              Humor
            </p>
            <p
              style={{
                fontFamily: "'Fraunces', serif",
                fontSize: 28,
                fontWeight: 400,
                letterSpacing: '-0.02em',
                color: '#14161F',
                margin: '6px 0 2px',
                lineHeight: 1,
              }}
            >
              {data?.lastPhq9 ? data.lastPhq9.score : '—'}
            </p>
            <p
              style={{
                fontFamily: "'Figtree', sans-serif",
                fontSize: 11,
                color: 'rgba(20,22,31,0.55)',
                margin: 0,
              }}
            >
              {data?.lastPhq9 ? TREND_LABELS[data.lastPhq9.trend] : 'Avaliar'}
            </p>
          </CardShell>

          <CardShell>
            <p
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 10,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: 'rgba(20,22,31,0.5)',
                margin: 0,
              }}
            >
              Medicações
            </p>
            <p
              style={{
                fontFamily: "'Fraunces', serif",
                fontSize: 28,
                fontWeight: 400,
                letterSpacing: '-0.02em',
                color: '#14161F',
                margin: '6px 0 2px',
                lineHeight: 1,
              }}
            >
              {data?.activeMedicationsCount ?? 0}
            </p>
            <p
              style={{
                fontFamily: "'Figtree', sans-serif",
                fontSize: 11,
                color: 'rgba(20,22,31,0.55)',
                margin: 0,
              }}
            >
              ativas
            </p>
          </CardShell>

          <CardShell clickable onClick={() => navigate('/cycle')}>
            <p
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 10,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: 'rgba(20,22,31,0.5)',
                margin: 0,
              }}
            >
              AUB
            </p>
            <p
              style={{
                fontFamily: "'Fraunces', serif",
                fontSize: 22,
                fontWeight: 450,
                letterSpacing: '-0.015em',
                color: '#14161F',
                margin: '6px 0 2px',
                lineHeight: 1,
              }}
            >
              {data?.hormonalInsight?.aubRiskLevel
                ? data.hormonalInsight.aubRiskLevel === 'low' ? 'Baixo' : data.hormonalInsight.aubRiskLevel === 'moderate' ? 'Mod.' : 'Alto'
                : '—'}
            </p>
            <p
              style={{
                fontFamily: "'Figtree', sans-serif",
                fontSize: 11,
                color: 'rgba(20,22,31,0.55)',
                margin: 0,
              }}
            >
              risco
            </p>
          </CardShell>
        </div>

        {/* ════ ALERTA DE SAÚDE MENTAL ════ */}
        {data?.phaseContext?.mentalHealthAlert &&
          (() => {
            const a = data.phaseContext.mentalHealthAlert;
            const s = ALERT_STYLES[a.level] || ALERT_STYLES.info;
            return (
              <div
                style={{
                  padding: '14px 18px',
                  fontSize: 13,
                  lineHeight: 1.6,
                  background: s.bg,
                  borderLeft: `2px solid ${s.border}`,
                  color: s.color,
                  fontFamily: "'Figtree', sans-serif",
                }}
              >
                {a.message}
              </div>
            );
          })()}

        {/* ════ REGISTRO DO DIA ════ */}
        <DailyLogQuickEntry />

        {/* ════ RECOMENDAÇÕES DA FASE ════ */}
        <PhaseContextCard />

        {/* ════ ATALHOS ════ */}
        <div
          style={{
            background: '#FDFAF3',
            border: '1px solid rgba(20,22,31,0.08)',
            padding: 20,
          }}
        >
          <p
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 10,
              letterSpacing: '0.24em',
              textTransform: 'uppercase',
              color: '#D97757',
              marginBottom: 16,
              marginTop: 0,
            }}
          >
            Acesso rápido
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
            {SHORTCUTS.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 8,
                  padding: '14px 8px',
                  border: '1px solid transparent',
                  background: 'transparent',
                  cursor: 'pointer',
                  fontFamily: "'Figtree', sans-serif",
                  transition: 'border-color 0.3s ease, background 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(20,22,31,0.1)';
                  (e.currentTarget as HTMLElement).style.background = 'rgba(217,119,87,0.05)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'transparent';
                  (e.currentTarget as HTMLElement).style.background = 'transparent';
                }}
              >
                <span style={{ fontSize: 24 }}>{item.icon}</span>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 500,
                    color: '#14161F',
                    textAlign: 'center',
                    letterSpacing: '0.02em',
                  }}
                >
                  {item.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
