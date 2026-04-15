import React, { useEffect, useState } from 'react';
import api from '../services/api';

interface TimelinePoint {
  date: string;
  score: number;
  phase: string;
  severityLevel: string;
}

const PHASE_COLORS: Record<string, string> = {
  menstrual: '#ef4444', follicular: '#22c55e', ovulatory: '#eab308', luteal: '#f97316', unknown: '#9ca3af',
};
const PHASE_LABELS: Record<string, string> = {
  menstrual: 'Menstrual', follicular: 'Folicular', ovulatory: 'Ovulatoria', luteal: 'Lutea', unknown: 'Desconhecida',
};
const MAX_SCORES: Record<string, number> = { phq9: 27, gad7: 21, pss10: 40 };
const SEVERITY_ZONES_PHQ9 = [
  { from: 0, to: 4, color: 'rgba(22,163,74,0.08)', label: 'Minimo' },
  { from: 5, to: 9, color: 'rgba(234,179,8,0.08)', label: 'Leve' },
  { from: 10, to: 14, color: 'rgba(249,115,22,0.08)', label: 'Moderado' },
  { from: 15, to: 27, color: 'rgba(220,38,38,0.08)', label: 'Severo' },
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

  if (loading) return <div style={{ color: '#9CA3AF', fontSize: 13, padding: 20, textAlign: 'center' }}>Carregando...</div>;
  if (points.length < 2) return <div style={{ color: '#9CA3AF', fontSize: 13, padding: 20, textAlign: 'center' }}>Avaliacoes insuficientes para exibir linha do tempo (minimo 2).</div>;

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
              <line x1={padX} y1={getY(v)} x2={padX + innerW} y2={getY(v)} stroke="#E5E7EB" strokeWidth={0.5} />
              <text x={padX - 6} y={getY(v) + 4} fontSize={10} fill="#9CA3AF" textAnchor="end">{v}</text>
            </g>
          ))}

          {/* Line connecting points */}
          <polyline
            fill="none" stroke="#7C5CBF" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round"
            points={points.map((p, i) => `${getX(i)},${getY(p.score)}`).join(' ')}
          />

          {/* Points */}
          {points.map((p, i) => (
            <g key={i} onMouseEnter={() => setHoveredIdx(i)} onMouseLeave={() => setHoveredIdx(null)} style={{ cursor: 'pointer' }}>
              <circle cx={getX(i)} cy={getY(p.score)} r={hoveredIdx === i ? 7 : 5} fill={PHASE_COLORS[p.phase] || '#9CA3AF'} stroke="#fff" strokeWidth={2} />
            </g>
          ))}

          {/* X-axis labels */}
          {points.map((p, i) => (
            <text key={i} x={getX(i)} y={chartH + 16} fontSize={10} fill="#9CA3AF" textAnchor="middle">
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
                <rect x={tx - 60} y={ty - 42} width={120} height={40} rx={8} fill="#1F2937" opacity={0.92} />
                <text x={tx} y={ty - 26} fontSize={11} fill="#fff" textAnchor="middle" fontWeight={600}>{p.date} — {p.score} pts</text>
                <text x={tx} y={ty - 12} fontSize={10} fill="#C4B5FD" textAnchor="middle">{PHASE_LABELS[p.phase]} · {p.severityLevel}</text>
              </g>
            );
          })()}
        </svg>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 8, flexWrap: 'wrap' }}>
        {Object.entries(PHASE_LABELS).filter(([k]) => k !== 'unknown').map(([key, label]) => (
          <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#6B7280' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: PHASE_COLORS[key] }} />
            {label}
          </div>
        ))}
      </div>
    </div>
  );
}
