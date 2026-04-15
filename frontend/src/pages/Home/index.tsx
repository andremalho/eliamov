import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDashboard } from '../../hooks/useDashboard';
import { DailyLogQuickEntry } from '../../components/DailyLogQuickEntry';
import { PhaseContextCard } from '../../components/PhaseContextCard';
import Layout from '../../components/Layout';

const PHASE_NAMES: Record<string, string> = {
  menstrual: 'Menstrual', follicular: 'Folicular', ovulatory: 'Ovulatoria', luteal: 'Lutea', unknown: 'Ciclo nao registrado',
};
const PHASE_COLORS: Record<string, string> = {
  menstrual: '#ef4444', follicular: '#22c55e', ovulatory: '#eab308', luteal: '#f97316', unknown: '#9ca3af',
};
const TREND_LABELS: Record<string, string> = {
  improving: '↓ Melhorando', stable: '→ Estavel', worsening: '↑ Atencao', insufficient_data: '— Sem dados',
};

const SHORTCUTS = [
  { label: 'Treino', icon: '🏋️', path: '/training' },
  { label: 'Nutricao', icon: '🥗', path: '/nutrition' },
  { label: 'Ciclo', icon: '🩸', path: '/cycle' },
  { label: 'Saude Mental', icon: '🧠', path: '/mental-health' },
];

const ALERT_STYLES: Record<string, { bg: string; border: string; color: string }> = {
  alert: { bg: '#FEF2F2', border: '#FECACA', color: '#991B1B' },
  warning: { bg: '#FFFBEB', border: '#FDE68A', color: '#92400E' },
  info: { bg: '#EFF6FF', border: '#BFDBFE', color: '#1E40AF' },
};

export default function Home() {
  const { data, loading } = useDashboard();
  const navigate = useNavigate();

  if (loading) {
    return (
      <Layout>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
          <div style={{ width: 36, height: 36, border: '3px solid #EDE9FE', borderTopColor: '#7C3AED', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </Layout>
    );
  }

  const phase = data?.phaseContext?.phase ?? 'unknown';
  const phaseColor = PHASE_COLORS[phase] ?? '#9ca3af';
  const phaseName = PHASE_NAMES[phase] ?? 'Desconhecida';

  return (
    <Layout>
      <div style={{ maxWidth: 520, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* CARD PRINCIPAL — FASE DO CICLO */}
        <div style={{
          background: `linear-gradient(135deg, #0F1F3D, ${phaseColor}99)`,
          borderRadius: 18, padding: 22, color: '#fff',
        }}>
          <p style={{ fontSize: 12, opacity: 0.7, marginBottom: 4 }}>Fase atual</p>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 4px', fontFamily: "'Cormorant Garamond', serif" }}>{phaseName}</h1>
          {data?.phaseContext?.cycleDay && (
            <p style={{ fontSize: 14, opacity: 0.8, margin: 0 }}>Dia {data.phaseContext.cycleDay} do ciclo</p>
          )}
          {data?.nextPeriodDays !== null && data?.nextPeriodDays !== undefined && data.nextPeriodDays > 0 && (
            <p style={{ fontSize: 13, opacity: 0.8, margin: '2px 0 0' }}>Proxima menstruacao em {data.nextPeriodDays} dias</p>
          )}
          {(data?.streakDays ?? 0) > 0 && (
            <div style={{ marginTop: 12, display: 'inline-block', background: 'rgba(255,255,255,0.2)', borderRadius: 999, padding: '4px 12px', fontSize: 12, backdropFilter: 'blur(4px)' }}>
              🔥 {data!.streakDays} dia{data!.streakDays > 1 ? 's' : ''} seguidos de registro
            </div>
          )}
        </div>

        {/* GRID DE MÉTRICAS RÁPIDAS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          <button onClick={() => navigate('/mental-health')} style={{
            background: '#fff', borderRadius: 16, padding: 12, border: '1px solid #F3F4F6',
            textAlign: 'left', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
          }}>
            <p style={{ fontSize: 11, color: '#6B7280', margin: 0 }}>Humor</p>
            <p style={{ fontSize: 22, fontWeight: 700, color: '#1F2937', margin: '2px 0' }}>{data?.lastPhq9 ? data.lastPhq9.score : '—'}</p>
            <p style={{ fontSize: 11, color: '#9CA3AF', margin: 0 }}>{data?.lastPhq9 ? TREND_LABELS[data.lastPhq9.trend] : 'Avaliar'}</p>
          </button>

          <div style={{ background: '#fff', borderRadius: 16, padding: 12, border: '1px solid #F3F4F6' }}>
            <p style={{ fontSize: 11, color: '#6B7280', margin: 0 }}>Medicacoes</p>
            <p style={{ fontSize: 22, fontWeight: 700, color: '#1F2937', margin: '2px 0' }}>{data?.activeMedicationsCount ?? 0}</p>
            <p style={{ fontSize: 11, color: '#9CA3AF', margin: 0 }}>ativas</p>
          </div>

          <button onClick={() => navigate('/cycle')} style={{
            background: '#fff', borderRadius: 16, padding: 12, border: '1px solid #F3F4F6',
            textAlign: 'left', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
          }}>
            <p style={{ fontSize: 11, color: '#6B7280', margin: 0 }}>AUB</p>
            <p style={{ fontSize: 22, fontWeight: 700, color: '#1F2937', margin: '2px 0' }}>
              {data?.hormonalInsight?.aubRiskLevel
                ? data.hormonalInsight.aubRiskLevel === 'low' ? 'Baixo' : data.hormonalInsight.aubRiskLevel === 'moderate' ? 'Mod.' : 'Alto'
                : '—'}
            </p>
            <p style={{ fontSize: 11, color: '#9CA3AF', margin: 0 }}>risco</p>
          </button>
        </div>

        {/* ALERTA DE SAÚDE MENTAL */}
        {data?.phaseContext?.mentalHealthAlert && (() => {
          const a = data.phaseContext.mentalHealthAlert;
          const s = ALERT_STYLES[a.level] || ALERT_STYLES.info;
          return (
            <div style={{ borderRadius: 16, padding: 14, fontSize: 13, lineHeight: 1.6, background: s.bg, border: `1px solid ${s.border}`, color: s.color }}>
              {a.message}
            </div>
          );
        })()}

        {/* REGISTRO DO DIA */}
        <DailyLogQuickEntry />

        {/* RECOMENDAÇÕES DA FASE */}
        <PhaseContextCard />

        {/* ATALHOS RÁPIDOS */}
        <div style={{ background: '#fff', borderRadius: 16, padding: 16, border: '1px solid #F3F4F6' }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 12 }}>Acesso rapido</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
            {SHORTCUTS.map(item => (
              <button key={item.path} onClick={() => navigate(item.path)} style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                padding: 8, borderRadius: 12, border: 'none', background: 'transparent',
                cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
                transition: 'background 0.15s',
              }}>
                <span style={{ fontSize: 24 }}>{item.icon}</span>
                <span style={{ fontSize: 11, color: '#4B5563', textAlign: 'center' }}>{item.label}</span>
              </button>
            ))}
          </div>
        </div>

      </div>
    </Layout>
  );
}
