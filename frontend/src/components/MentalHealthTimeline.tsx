import React, { useEffect, useState } from 'react';
import api from '../services/api';

interface TimelinePoint {
  date: string;
  score: number;
  phase: string;
  severityLevel: string;
}

// Tons Lunar Bloom — preservando semântica de fase
const PHASE_COLORS: Record<string, string> = {
  menstrual: '#B85A3D',   // terracotta deep
  follicular: '#9CA89A',  // sage
  ovulatory: '#C9A977',   // brass
  luteal: '#D97757',      // terracotta
  unknown: 'rgba(20,22,31,0.35)',
};
const PHASE_LABELS: Record<string, string> = {
  menstrual: 'Menstrual', follicular: 'Folicular', ovulatory: 'Ovulatória', luteal: 'Lútea', unknown: 'Desconhecida',
};
const MAX_SCORES: Record<string, number> = { phq9: 27, gad7: 21, pss10: 40 };
const SEVERITY_ZONES_PHQ9 = [
  { from: 0,  to: 4,  color: 'rgba(156,168,154,0.10)', label: 'Mínimo' },   // sage
  { from: 5,  to: 9,  color: 'rgba(201,169,119,0.10)', label: 'Leve' },     // brass
  { from: 10, to: 14, color: 'rgba(217,119,87,0.10)',  label: 'Moderado' }, // terracotta
  { from: 15, to: 27, color: 'rgba(139,58,47,0.10)',   label: 'Severo' },   // oxide
];

export function MentalHealthTimeline({ type }: { type: 'phq9' | 'gad7' | 'pss10' }) {
  const [points, setPoints] = useState<TimelinePoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  useEffect(() => {
    setLoading(true);
    api.get(`/mental-health/timeline?type=${type}`)
      .then(r => setPoints(r.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [type]);

  const emptyStyle: React.CSSProperties = {
    color: 'rgba(20,22,31,0.5)',
    fontSize: 11,
    padding: 24,
    textAlign: 'center',
    fontFamily: "'JetBrains Mono', monospace",
    letterSpacing: '0.2em',
    textTransform: 'uppercase',
  };
  if (loading) return <div style={emptyStyle}>Carregando…</div>;
  if (points.length < 2) return <div style={{ ...emptyStyle, letterSpacing: 'normal', textTransform: 'none', fontFamily: "'Figtree', sans-serif", fontSize: 13 }}>Avaliações insuficientes para linha do tempo (mínimo 2).</div>;

  const maxScore = MAX_SCORES[type] || 27;
  const chartW = Math.max(points.length * 60, 300);
  const chartH = 180;
  const padX = 40;
  const padY = 20;
  const innerW = chartW - padX * 2;
  const innerH = chartH - padY * 2;

  const getX = (i: number) => padX + (i / (points.length - 1)) * innerW;
  const getY = (score: number) => padY + innerH - (score / maxScore) * innerH;

  return (
    <div>
      <div style={{ overflowX: 'auto', position: 'relative' }}>
        <svg width={chartW} height={chartH + 30} style={{ display: 'block' }}>
          {/* Severity zones (PHQ-9 only for now) */}
          {type === 'phq9' && SEVERITY_ZONES_PHQ9.map((z, i) => (
            <rect key={i} x={padX} y={getY(z.to)} width={innerW} height={getY(z.from) - getY(z.to)} fill={z.color} />
          ))}

          {/* Grid lines */}
          {[0, Math.round(maxScore / 4), Math.round(maxScore / 2), Math.round(maxScore * 3 / 4), maxScore].map(v => (
            <g key={v}>
              <line x1={padX} y1={getY(v)} x2={padX + innerW} y2={getY(v)} stroke="rgba(20,22,31,0.08)" strokeWidth={0.5} />
              <text
                x={padX - 8}
                y={getY(v) + 4}
                fontSize={10}
                fill="rgba(20,22,31,0.5)"
                textAnchor="end"
                fontFamily="'JetBrains Mono', monospace"
                letterSpacing="0.05em"
              >
                {v}
              </text>
            </g>
          ))}

          {/* Line connecting points */}
          <polyline
            fill="none"
            stroke="#14161F"
            strokeWidth={1.5}
            strokeLinejoin="round"
            strokeLinecap="round"
            points={points.map((p, i) => `${getX(i)},${getY(p.score)}`).join(' ')}
          />

          {/* Points */}
          {points.map((p, i) => (
            <g key={i} onMouseEnter={() => setHoveredIdx(i)} onMouseLeave={() => setHoveredIdx(null)} style={{ cursor: 'pointer' }}>
              <circle
                cx={getX(i)}
                cy={getY(p.score)}
                r={hoveredIdx === i ? 6 : 4}
                fill={PHASE_COLORS[p.phase] || 'rgba(20,22,31,0.35)'}
                stroke="#FDFAF3"
                strokeWidth={2}
              />
            </g>
          ))}

          {/* X-axis labels */}
          {points.map((p, i) => (
            <text
              key={i}
              x={getX(i)}
              y={chartH + 18}
              fontSize={9.5}
              fill="rgba(20,22,31,0.5)"
              textAnchor="middle"
              fontFamily="'JetBrains Mono', monospace"
              letterSpacing="0.06em"
            >
              {p.date.slice(5)}
            </text>
          ))}

          {/* Tooltip */}
          {hoveredIdx !== null && (() => {
            const p = points[hoveredIdx];
            const tx = getX(hoveredIdx);
            const ty = getY(p.score) - 14;
            return (
              <g>
                <rect x={tx - 70} y={ty - 48} width={140} height={44} rx={0} fill="#14161F" stroke="#D97757" strokeWidth={1} />
                <text
                  x={tx}
                  y={ty - 30}
                  fontSize={11}
                  fill="#F5EFE6"
                  textAnchor="middle"
                  fontWeight={500}
                  fontFamily="'Figtree', sans-serif"
                >
                  {p.date} · {p.score} pts
                </text>
                <text
                  x={tx}
                  y={ty - 14}
                  fontSize={9}
                  fill="#D97757"
                  textAnchor="middle"
                  fontFamily="'JetBrains Mono', monospace"
                  letterSpacing="0.12em"
                >
                  {PHASE_LABELS[p.phase].toUpperCase()} · {p.severityLevel.toUpperCase()}
                </text>
              </g>
            );
          })()}
        </svg>
      </div>

      {/* Legend */}
      <div
        style={{
          display: 'flex',
          gap: 18,
          justifyContent: 'center',
          marginTop: 16,
          flexWrap: 'wrap',
          fontFamily: "'JetBrains Mono', monospace",
        }}
      >
        {Object.entries(PHASE_LABELS).filter(([k]) => k !== 'unknown').map(([key, label]) => (
          <div
            key={key}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 10,
              color: 'rgba(20,22,31,0.6)',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
            }}
          >
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: PHASE_COLORS[key] }} />
            {label}
          </div>
        ))}
      </div>
    </div>
  );
}
