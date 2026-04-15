import React, { useState } from 'react';
import { usePhaseContext } from '../hooks/usePhaseContext';

type TabKey = 'training' | 'nutrition' | 'mental' | 'tips';

const PHASE_LABELS: Record<string, string> = {
  menstrual: 'Menstrual', follicular: 'Folicular', ovulatory: 'Ovulatoria', luteal: 'Lutea', unknown: 'Desconhecida',
};
const PHASE_COLORS: Record<string, string> = {
  menstrual: '#EC4899', follicular: '#22C55E', ovulatory: '#F59E0B', luteal: '#F97316', unknown: '#9CA3AF',
};
const INTENSITY_COLORS: Record<string, string> = {
  rest: '#9CA3AF', light: '#86EFAC', moderate: '#FCD34D', high: '#FB923C', peak: '#EF4444',
};
const INTENSITY_LABELS: Record<string, string> = {
  rest: 'Descanso', light: 'Leve', moderate: 'Moderado', high: 'Alta', peak: 'Maximo',
};
const ALERT_STYLES: Record<string, { bg: string; border: string; color: string }> = {
  info: { bg: '#EFF6FF', border: '#BFDBFE', color: '#1E40AF' },
  warning: { bg: '#FFFBEB', border: '#FDE68A', color: '#92400E' },
  alert: { bg: '#FEF2F2', border: '#FECACA', color: '#991B1B' },
};

const TABS: { key: TabKey; icon: string; label: string }[] = [
  { key: 'training', icon: '🏋️', label: 'Treino' },
  { key: 'nutrition', icon: '🥗', label: 'Nutricao' },
  { key: 'mental', icon: '🧠', label: 'Saude Mental' },
  { key: 'tips', icon: '💡', label: 'Dicas' },
];

const card: React.CSSProperties = { background: '#fff', borderRadius: 16, border: '1px solid #E5E7EB', padding: 18, marginBottom: 16 };

export function PhaseContextCard({ activeTab: initialTab }: { activeTab?: TabKey } = {}) {
  const { data, loading } = usePhaseContext();
  const [tab, setTab] = useState<TabKey>(initialTab ?? 'training');

  if (loading) return <div style={{ ...card, color: '#9CA3AF', fontSize: 13 }}>Carregando contexto...</div>;
  if (!data) return null;

  const pc = PHASE_COLORS[data.phase] || '#9CA3AF';

  return (
    <div style={card}>
      {/* Phase header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: pc }} />
          <span style={{ fontSize: 15, fontWeight: 600, color: '#1F2937' }}>Fase {PHASE_LABELS[data.phase]}</span>
          {data.cycleDay && <span style={{ fontSize: 12, color: '#6B7280' }}>Dia {data.cycleDay}</span>}
        </div>
        {data.daysUntilNextPeriod !== null && data.daysUntilNextPeriod > 0 && (
          <span style={{ fontSize: 11, color: '#9CA3AF' }}>Proxima menstruacao em {data.daysUntilNextPeriod} dias</span>
        )}
      </div>

      {/* Tab icons */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            flex: 1, padding: '8px 4px', borderRadius: 10, border: 'none',
            background: tab === t.key ? '#F5F3FF' : 'transparent',
            cursor: 'pointer', fontSize: 11, fontWeight: tab === t.key ? 600 : 400,
            color: tab === t.key ? '#7C3AED' : '#6B7280',
            fontFamily: "'DM Sans', sans-serif", transition: 'all 0.15s',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
          }}>
            <span style={{ fontSize: 18 }}>{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {/* Training tab */}
      {tab === 'training' && (() => {
        const r = data.trainingRecommendation;
        return (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <span style={{ padding: '4px 12px', borderRadius: 999, fontSize: 12, fontWeight: 600, color: '#fff', background: INTENSITY_COLORS[r.intensity] || '#9CA3AF' }}>
                {INTENSITY_LABELS[r.intensity] || r.intensity}
              </span>
              <span style={{ fontSize: 15, fontWeight: 600, color: '#1F2937' }}>{r.label}</span>
            </div>
            <div style={{ marginBottom: 10 }}>
              {r.types.map((t, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#374151', padding: '3px 0' }}>
                  <span style={{ color: '#22C55E' }}>✓</span> {t}
                </div>
              ))}
            </div>
            {r.avoid.length > 0 && (
              <div style={{ marginBottom: 10 }}>
                {r.avoid.map((a, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#DC2626', padding: '3px 0' }}>
                    <span>✗</span> {a}
                  </div>
                ))}
              </div>
            )}
            <p style={{ fontSize: 12, color: '#9CA3AF', fontStyle: 'italic', margin: 0 }}>{r.rationale}</p>
          </div>
        );
      })()}

      {/* Nutrition tab */}
      {tab === 'nutrition' && (() => {
        const r = data.nutritionRecommendation;
        return (
          <div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
              {r.focus.map((f, i) => (
                <span key={i} style={{ padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 600, background: '#F5F3FF', color: '#7C3AED' }}>{f}</span>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 12 }}>
              {r.foods.map((f, i) => (
                <div key={i} style={{ fontSize: 13, color: '#374151', padding: '4px 0' }}>🥬 {f}</div>
              ))}
            </div>
            {r.avoid.length > 0 && (
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
                {r.avoid.map((a, i) => (
                  <span key={i} style={{ padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 500, background: '#FEF2F2', color: '#DC2626' }}>{a}</span>
                ))}
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#3B82F6' }}>
              <span>💧</span> {r.hydration}
            </div>
          </div>
        );
      })()}

      {/* Mental health tab */}
      {tab === 'mental' && (
        <div>
          {data.mentalHealthAlert ? (() => {
            const s = ALERT_STYLES[data.mentalHealthAlert.level] || ALERT_STYLES.info;
            return (
              <div style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: 12, padding: '12px 14px', fontSize: 13, color: s.color, lineHeight: 1.6, marginBottom: 12 }}>
                {data.mentalHealthAlert.message}
              </div>
            );
          })() : (
            <p style={{ fontSize: 13, color: '#16A34A', marginBottom: 12 }}>Nenhum alerta de saude mental para esta fase. Continue cuidando de voce!</p>
          )}
          {data.medicationInteractions.length > 0 && (
            <div>
              {data.medicationInteractions.map((m, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 6, fontSize: 12, color: '#6B7280', padding: '4px 0' }}>
                  <span>💊</span> {m}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tips tab */}
      {tab === 'tips' && (
        <div>
          {data.wellnessTips.map((tip, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13, color: '#374151', padding: '6px 0', lineHeight: 1.5 }}>
              <span style={{ flexShrink: 0 }}>✨</span> {tip}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
