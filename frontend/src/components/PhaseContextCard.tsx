import React, { useState } from 'react';
import { usePhaseContext } from '../hooks/usePhaseContext';

type TabKey = 'training' | 'nutrition' | 'mental' | 'tips';

const PHASE_LABELS: Record<string, string> = {
  menstrual: 'Menstrual', follicular: 'Folicular', ovulatory: 'Ovulatória', luteal: 'Lútea', unknown: 'Desconhecida',
};

/** Tons remapeados para a paleta Lunar Bloom — preservam semântica clínica */
const PHASE_TINTS: Record<string, string> = {
  menstrual: '#B85A3D',    // terracotta deep
  follicular: '#9CA89A',   // sage
  ovulatory: '#C9A977',    // brass
  luteal: '#D97757',       // terracotta
  unknown: 'rgba(20,22,31,0.35)',
};

const INTENSITY_LABELS: Record<string, string> = {
  rest: 'Descanso', light: 'Leve', moderate: 'Moderado', high: 'Alta', peak: 'Máximo',
};
const INTENSITY_TINTS: Record<string, { bg: string; fg: string }> = {
  rest:     { bg: 'rgba(20,22,31,0.06)',  fg: 'rgba(20,22,31,0.68)' },
  light:    { bg: 'rgba(156,168,154,0.16)', fg: '#5B6B5C' },
  moderate: { bg: 'rgba(201,169,119,0.18)', fg: '#7A5F2E' },
  high:     { bg: 'rgba(217,119,87,0.18)',  fg: '#B85A3D' },
  peak:     { bg: 'rgba(139,58,47,0.14)',   fg: '#8B3A2F' },
};

const ALERT_STYLES: Record<string, { bg: string; border: string; color: string }> = {
  info:    { bg: 'rgba(20,22,31,0.04)',  border: '#14161F', color: '#14161F' },
  warning: { bg: 'rgba(201,169,119,0.10)', border: '#C9A977', color: '#7A5F2E' },
  alert:   { bg: 'rgba(139,58,47,0.06)',  border: '#8B3A2F', color: '#8B3A2F' },
};

const TABS: { key: TabKey; icon: string; label: string }[] = [
  { key: 'training', icon: '🏋️', label: 'Treino' },
  { key: 'nutrition', icon: '🥗', label: 'Nutrição' },
  { key: 'mental', icon: '🧠', label: 'Mente' },
  { key: 'tips', icon: '💡', label: 'Dicas' },
];

const card: React.CSSProperties = {
  background: '#FDFAF3',
  border: '1px solid rgba(20,22,31,0.08)',
  padding: 22,
  marginBottom: 16,
  fontFamily: "'Figtree', sans-serif",
  color: '#14161F',
};

export function PhaseContextCard({ activeTab: initialTab }: { activeTab?: TabKey } = {}) {
  const { data, loading } = usePhaseContext();
  const [tab, setTab] = useState<TabKey>(initialTab ?? 'training');

  if (loading) {
    return (
      <div
        style={{
          ...card,
          color: 'rgba(20,22,31,0.5)',
          fontSize: 12,
          fontFamily: "'JetBrains Mono', monospace",
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
        }}
      >
        Carregando contexto…
      </div>
    );
  }
  if (!data) return null;

  const phaseTint = PHASE_TINTS[data.phase] ?? PHASE_TINTS.unknown;

  return (
    <div style={card}>
      {/* Phase header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 18,
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span
            aria-hidden
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: phaseTint,
              display: 'inline-block',
            }}
          />
          <div>
            <div
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 10,
                letterSpacing: '0.28em',
                textTransform: 'uppercase',
                color: 'rgba(20,22,31,0.55)',
              }}
            >
              Fase atual
            </div>
            <div
              style={{
                fontFamily: "'Fraunces', serif",
                fontSize: 22,
                fontWeight: 450,
                letterSpacing: '-0.015em',
                color: '#14161F',
                lineHeight: 1.1,
                marginTop: 2,
              }}
            >
              {PHASE_LABELS[data.phase]}
              {data.cycleDay && (
                <span
                  style={{
                    fontFamily: "'Figtree', sans-serif",
                    fontSize: 13,
                    fontWeight: 400,
                    color: 'rgba(20,22,31,0.55)',
                    marginLeft: 10,
                    letterSpacing: 0,
                  }}
                >
                  · dia {data.cycleDay}
                </span>
              )}
            </div>
          </div>
        </div>
        {data.daysUntilNextPeriod !== null && data.daysUntilNextPeriod > 0 && (
          <span
            style={{
              fontSize: 11,
              color: 'rgba(20,22,31,0.55)',
              fontFamily: "'JetBrains Mono', monospace",
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
            }}
          >
            Próxima em {data.daysUntilNextPeriod}d
          </span>
        )}
      </div>

      {/* Tab buttons */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 6,
          marginBottom: 22,
          padding: 4,
          background: 'rgba(20,22,31,0.04)',
          border: '1px solid rgba(20,22,31,0.06)',
        }}
      >
        {TABS.map(t => {
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                padding: '10px 4px',
                border: '1px solid transparent',
                background: active ? '#FDFAF3' : 'transparent',
                cursor: 'pointer',
                fontSize: 11,
                fontFamily: "'Figtree', sans-serif",
                fontWeight: active ? 600 : 500,
                color: active ? '#14161F' : 'rgba(20,22,31,0.55)',
                letterSpacing: '0.02em',
                transition: 'all 0.25s cubic-bezier(0.16,1,0.3,1)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 4,
                borderColor: active ? 'rgba(20,22,31,0.08)' : 'transparent',
              }}
            >
              <span style={{ fontSize: 18 }} aria-hidden>{t.icon}</span>
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Training tab */}
      {tab === 'training' && (() => {
        const r = data.trainingRecommendation;
        const tint = INTENSITY_TINTS[r.intensity] ?? INTENSITY_TINTS.rest;
        return (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
              <span
                style={{
                  padding: '5px 12px',
                  fontSize: 10.5,
                  fontWeight: 600,
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: tint.fg,
                  background: tint.bg,
                  border: `1px solid ${tint.fg}22`,
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                {INTENSITY_LABELS[r.intensity] || r.intensity}
              </span>
              <span
                style={{
                  fontFamily: "'Fraunces', serif",
                  fontSize: 17,
                  fontWeight: 450,
                  letterSpacing: '-0.01em',
                  color: '#14161F',
                }}
              >
                {r.label}
              </span>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 12px' }}>
              {r.types.map((t, i) => (
                <li
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: 12,
                    padding: '8px 0',
                    borderBottom: '1px solid rgba(20,22,31,0.06)',
                    fontSize: 13.5,
                    color: '#14161F',
                    lineHeight: 1.4,
                  }}
                >
                  <span
                    aria-hidden
                    style={{ width: 5, height: 5, borderRadius: '50%', background: '#D97757', flexShrink: 0 }}
                  />
                  {t}
                </li>
              ))}
            </ul>
            {r.avoid.length > 0 && (
              <div
                style={{
                  marginBottom: 12,
                  padding: '10px 14px',
                  borderLeft: '2px solid #8B3A2F',
                  background: 'rgba(139,58,47,0.04)',
                }}
              >
                <div
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 10,
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase',
                    color: '#8B3A2F',
                    marginBottom: 6,
                  }}
                >
                  Evitar
                </div>
                {r.avoid.map((a, i) => (
                  <div key={i} style={{ fontSize: 12.5, color: '#8B3A2F', padding: '3px 0', lineHeight: 1.5 }}>
                    · {a}
                  </div>
                ))}
              </div>
            )}
            <p
              style={{
                fontFamily: "'Fraunces', serif",
                fontSize: 13,
                fontStyle: 'italic',
                color: 'rgba(20,22,31,0.62)',
                margin: 0,
                lineHeight: 1.5,
              }}
            >
              {r.rationale}
            </p>
          </div>
        );
      })()}

      {/* Nutrition tab */}
      {tab === 'nutrition' && (() => {
        const r = data.nutritionRecommendation;
        return (
          <div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
              {r.focus.map((f, i) => (
                <span
                  key={i}
                  style={{
                    padding: '4px 12px',
                    fontSize: 11,
                    fontWeight: 500,
                    fontFamily: "'JetBrains Mono', monospace",
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    color: '#B85A3D',
                    background: '#FBEAE1',
                  }}
                >
                  {f}
                </span>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, marginBottom: 14 }}>
              {r.foods.map((f, i) => (
                <div
                  key={i}
                  style={{
                    fontSize: 13,
                    color: '#14161F',
                    padding: '6px 0',
                    borderBottom: '1px solid rgba(20,22,31,0.06)',
                  }}
                >
                  🥬 {f}
                </div>
              ))}
            </div>
            {r.avoid.length > 0 && (
              <div
                style={{
                  marginBottom: 14,
                  padding: '10px 14px',
                  borderLeft: '2px solid #8B3A2F',
                  background: 'rgba(139,58,47,0.04)',
                }}
              >
                <div
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 10,
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase',
                    color: '#8B3A2F',
                    marginBottom: 6,
                  }}
                >
                  Moderar
                </div>
                <div style={{ fontSize: 12.5, color: '#8B3A2F', lineHeight: 1.55 }}>
                  {r.avoid.join(' · ')}
                </div>
              </div>
            )}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontSize: 13,
                color: '#14161F',
                fontFamily: "'Fraunces', serif",
                fontStyle: 'italic',
              }}
            >
              <span aria-hidden>💧</span> {r.hydration}
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
              <div
                style={{
                  background: s.bg,
                  borderLeft: `2px solid ${s.border}`,
                  padding: '14px 16px',
                  fontSize: 13,
                  color: s.color,
                  lineHeight: 1.6,
                  marginBottom: 14,
                }}
              >
                {data.mentalHealthAlert.message}
              </div>
            );
          })() : (
            <div
              style={{
                padding: '14px 16px',
                borderLeft: '2px solid #9CA89A',
                background: 'rgba(156,168,154,0.1)',
                fontSize: 13,
                color: '#5B6B5C',
                lineHeight: 1.55,
              }}
            >
              Nenhum alerta de saúde mental para esta fase. Continue cuidando de você.
            </div>
          )}
          {data.medicationInteractions.length > 0 && (
            <div style={{ marginTop: 14 }}>
              <div
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 10,
                  letterSpacing: '0.24em',
                  textTransform: 'uppercase',
                  color: 'rgba(20,22,31,0.55)',
                  marginBottom: 8,
                }}
              >
                Interações de medicação
              </div>
              {data.medicationInteractions.map((m, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 8,
                    fontSize: 12.5,
                    color: 'rgba(20,22,31,0.68)',
                    padding: '6px 0',
                    lineHeight: 1.55,
                  }}
                >
                  <span aria-hidden>💊</span> {m}
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
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'baseline',
                gap: 12,
                padding: '10px 0',
                borderBottom: '1px solid rgba(20,22,31,0.06)',
                fontSize: 13.5,
                color: '#14161F',
                lineHeight: 1.55,
              }}
            >
              <span aria-hidden style={{ flexShrink: 0, color: '#C9A977' }}>✦</span> {tip}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
