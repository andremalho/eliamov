import React, { useEffect, useState } from 'react';
import { fertilityApi, FertilityLogEntry, FertileWindow as FertileWindowData, FertilityChart } from '../services/fertility.api';
import Layout from '../components/Layout';
import { formatBR } from '../utils/format';
import { Heart } from 'lucide-react';

const card: React.CSSProperties = {
  background: '#fff', borderRadius: 14, border: '1px solid #E5E7EB', padding: 16, marginBottom: 14,
};
const labelStyle: React.CSSProperties = { fontSize: 13, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 4 };
const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 12px', border: '1.5px solid #E5E7EB', borderRadius: 10, fontSize: 14,
  outline: 'none', boxSizing: 'border-box' as const,
};
const btnPrimary: React.CSSProperties = {
  width: '100%', padding: 12, background: '#BE185D', color: '#fff', border: 'none', borderRadius: 12,
  fontSize: 14, fontWeight: 600, cursor: 'pointer',
};

const LH_OPTIONS = [
  { value: 'negative', label: 'Negativo', color: '#9CA3AF' },
  { value: 'low', label: 'Baixo', color: '#F59E0B' },
  { value: 'high', label: 'Alto', color: '#F97316' },
  { value: 'peak', label: 'Pico', color: '#DC2626' },
];

const MUCUS_OPTIONS = [
  { value: 'dry', label: 'Seco' },
  { value: 'sticky', label: 'Pegajoso' },
  { value: 'creamy', label: 'Cremoso' },
  { value: 'watery', label: 'Aquoso' },
  { value: 'egg_white', label: 'Clara de ovo' },
];

function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function isInWindow(start: string | null, end: string | null): boolean {
  if (!start || !end) return false;
  const today = todayISO();
  return today >= start && today <= end;
}

function daysUntil(dateStr: string | null): number | null {
  if (!dateStr) return null;
  const today = new Date(todayISO());
  const target = new Date(dateStr);
  const diff = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  return diff > 0 ? diff : null;
}

export default function Fertility() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Daily log form
  const [date, setDate] = useState(todayISO());
  const [basalTemp, setBasalTemp] = useState('');
  const [lhResult, setLhResult] = useState<string | null>(null);
  const [cervicalMucus, setCervicalMucus] = useState<string | null>(null);
  const [intercourse, setIntercourse] = useState(false);
  const [notes, setNotes] = useState('');

  // Data
  const [fertileWindow, setFertileWindow] = useState<FertileWindowData | null>(null);
  const [chartData, setChartData] = useState<FertilityChart | null>(null);

  const loadData = async () => {
    try {
      const [fw, ch] = await Promise.all([
        fertilityApi.fertileWindow().catch(() => null),
        fertilityApi.chart().catch(() => null),
      ]);
      setFertileWindow(fw);
      setChartData(ch);
    } catch { /* ignore */ }
  };

  useEffect(() => {
    setLoading(true);
    loadData().finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await fertilityApi.log({
        date,
        basalTemp: basalTemp ? Number(basalTemp) : null,
        lhResult,
        cervicalMucus,
        intercourse,
        notes: notes || null,
      });
      setBasalTemp('');
      setLhResult(null);
      setCervicalMucus(null);
      setIntercourse(false);
      setNotes('');
      await loadData();
    } catch { /* ignore */ } finally {
      setSubmitting(false);
    }
  };

  const inWindow = fertileWindow ? isInWindow(fertileWindow.fertileWindowStart, fertileWindow.fertileWindowEnd) : false;
  const daysToWindow = fertileWindow ? daysUntil(fertileWindow.fertileWindowStart) : null;

  // Chart rendering
  const renderChart = () => {
    if (!chartData || !chartData.bbt || chartData.bbt.length === 0) return null;
    const bbt = chartData.bbt;
    const W = 340;
    const H = 180;
    const PAD = { top: 20, right: 10, bottom: 30, left: 40 };
    const plotW = W - PAD.left - PAD.right;
    const plotH = H - PAD.top - PAD.bottom;
    const yMin = 35.5;
    const yMax = 37.5;
    const yRange = yMax - yMin;

    const xScale = (i: number) => PAD.left + (i / Math.max(bbt.length - 1, 1)) * plotW;
    const yScale = (t: number) => PAD.top + plotH - ((Math.min(Math.max(t, yMin), yMax) - yMin) / yRange) * plotH;

    const points = bbt.map((d, i) => `${xScale(i)},${yScale(d.temp)}`).join(' ');

    // LH peak indices
    const lhPeaks = chartData.lh
      ? chartData.lh
          .filter((l) => l.result === 'peak' || l.result === 'high')
          .map((l) => bbt.findIndex((b) => b.date === l.date))
          .filter((i) => i >= 0)
      : [];

    // Y-axis labels
    const yTicks = [35.5, 36.0, 36.5, 37.0, 37.5];

    // X-axis labels (show first, middle, last)
    const xLabels: { i: number; label: string }[] = [];
    if (bbt.length >= 1) xLabels.push({ i: 0, label: formatBR(bbt[0].date).slice(0, 5) });
    if (bbt.length >= 3) xLabels.push({ i: Math.floor(bbt.length / 2), label: formatBR(bbt[Math.floor(bbt.length / 2)].date).slice(0, 5) });
    if (bbt.length >= 2) xLabels.push({ i: bbt.length - 1, label: formatBR(bbt[bbt.length - 1].date).slice(0, 5) });

    return (
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: 400, display: 'block', margin: '0 auto' }}>
        {/* Grid lines */}
        {yTicks.map((t) => (
          <line key={t} x1={PAD.left} y1={yScale(t)} x2={W - PAD.right} y2={yScale(t)} stroke="#F3F4F6" strokeWidth={1} />
        ))}

        {/* Y-axis labels */}
        {yTicks.map((t) => (
          <text key={t} x={PAD.left - 4} y={yScale(t) + 3} textAnchor="end" fontSize={9} fill="#9CA3AF">{t.toFixed(1)}</text>
        ))}

        {/* X-axis labels */}
        {xLabels.map(({ i, label }) => (
          <text key={i} x={xScale(i)} y={H - 6} textAnchor="middle" fontSize={8} fill="#9CA3AF">{label}</text>
        ))}

        {/* Coverline */}
        {chartData.coverline && (
          <line
            x1={PAD.left} y1={yScale(chartData.coverline)}
            x2={W - PAD.right} y2={yScale(chartData.coverline)}
            stroke="#F59E0B" strokeWidth={1} strokeDasharray="4 3"
          />
        )}

        {/* Temperature line */}
        <polyline points={points} fill="none" stroke="#BE185D" strokeWidth={1.5} strokeLinejoin="round" />

        {/* Data points */}
        {bbt.map((d, i) => (
          <circle key={i} cx={xScale(i)} cy={yScale(d.temp)} r={2.5} fill="#BE185D" />
        ))}

        {/* LH peak markers */}
        {lhPeaks.map((i) => (
          <g key={`lh-${i}`}>
            <circle cx={xScale(i)} cy={yScale(bbt[i].temp)} r={5} fill="none" stroke="#DC2626" strokeWidth={1.5} />
            <text x={xScale(i)} y={yScale(bbt[i].temp) - 8} textAnchor="middle" fontSize={7} fill="#DC2626" fontWeight={600}>LH</text>
          </g>
        ))}

        {/* Ovulation estimate - use fertileWindow data */}
        {fertileWindow?.estimatedOvulation && (() => {
          const ovIdx = bbt.findIndex((b) => b.date === fertileWindow.estimatedOvulation);
          if (ovIdx < 0) return null;
          return (
            <g>
              <circle cx={xScale(ovIdx)} cy={yScale(bbt[ovIdx].temp)} r={6} fill="none" stroke="#14161F" strokeWidth={2} />
              <text x={xScale(ovIdx)} y={yScale(bbt[ovIdx].temp) - 10} textAnchor="middle" fontSize={7} fill="#14161F" fontWeight={700}>OV</text>
            </g>
          );
        })()}

        {/* Coverline label */}
        {chartData.coverline && (
          <text x={W - PAD.right + 2} y={yScale(chartData.coverline) + 3} fontSize={7} fill="#F59E0B">CL</text>
        )}
      </svg>
    );
  };

  return (
    <Layout>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
        <Heart size={26} color="#BE185D" />
        <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 26, fontWeight: 600, color: '#14161F', margin: 0 }}>
          Planejamento familiar
        </h1>
      </div>
      <p style={{ fontSize: 14, color: '#6B7280', margin: '0 0 20px' }}>Acompanhe sua fertilidade dia a dia</p>

      {/* Section A: Daily Log */}
      <div style={{ ...card, borderColor: '#FECDD3' }}>
        <p style={{ fontSize: 15, fontWeight: 600, color: '#9F1239', marginBottom: 14 }}>Registro diario</p>
        <form onSubmit={handleSave}>
          {/* Date */}
          <label style={labelStyle}>Data</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={{ ...inputStyle, marginBottom: 12 }} />

          {/* Basal temperature */}
          <label style={labelStyle}>Temperatura basal (C)</label>
          <input
            type="number" step="0.01" min="35" max="39" placeholder="36.50"
            value={basalTemp} onChange={(e) => setBasalTemp(e.target.value)}
            style={{ ...inputStyle, marginBottom: 12 }}
          />

          {/* LH test */}
          <label style={labelStyle}>Teste LH</label>
          <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
            {LH_OPTIONS.map((opt) => (
              <button
                key={opt.value} type="button"
                onClick={() => setLhResult(lhResult === opt.value ? null : opt.value)}
                style={{
                  flex: 1, minWidth: 70, padding: '8px 4px', borderRadius: 999, border: 'none', fontSize: 12, fontWeight: 600,
                  cursor: 'pointer', transition: 'all 0.15s',
                  background: lhResult === opt.value ? opt.color : '#F3F4F6',
                  color: lhResult === opt.value ? '#fff' : '#6B7280',
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Cervical mucus */}
          <label style={labelStyle}>Muco cervical</label>
          <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
            {MUCUS_OPTIONS.map((opt) => (
              <button
                key={opt.value} type="button"
                onClick={() => setCervicalMucus(cervicalMucus === opt.value ? null : opt.value)}
                style={{
                  padding: '8px 10px', borderRadius: 999, border: 'none', fontSize: 12, fontWeight: 600,
                  cursor: 'pointer', transition: 'all 0.15s',
                  background: cervicalMucus === opt.value ? '#BE185D' : '#F3F4F6',
                  color: cervicalMucus === opt.value ? '#fff' : '#6B7280',
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Intercourse toggle */}
          <label style={labelStyle}>Relação sexual</label>
          <div style={{ marginBottom: 12 }}>
            <button
              type="button"
              onClick={() => setIntercourse(!intercourse)}
              style={{
                padding: '8px 20px', borderRadius: 999, border: 'none', fontSize: 13, fontWeight: 600,
                cursor: 'pointer', transition: 'all 0.15s',
                background: intercourse ? '#BE185D' : '#F3F4F6',
                color: intercourse ? '#fff' : '#6B7280',
              }}
            >
              {intercourse ? 'Sim' : 'Não'}
            </button>
          </div>

          {/* Notes */}
          <label style={labelStyle}>Observações</label>
          <textarea
            value={notes} onChange={(e) => setNotes(e.target.value)}
            placeholder="Anotações do dia..."
            rows={3}
            style={{ ...inputStyle, resize: 'vertical', marginBottom: 14, fontFamily: 'inherit' }}
          />

          <button type="submit" disabled={submitting} style={{ ...btnPrimary, opacity: submitting ? 0.5 : 1 }}>
            {submitting ? 'Salvando...' : 'Salvar registro'}
          </button>
        </form>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 32, color: '#9CA3AF' }}>Carregando...</div>
      ) : (
        <>
          {/* Section B: Fertile Window */}
          {fertileWindow && (
            <div style={{ ...card, borderColor: inWindow ? '#BBF7D0' : '#E5E7EB' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <p style={{ fontSize: 15, fontWeight: 600, color: '#374151', margin: 0 }}>Janela fertil</p>
                <span style={{
                  padding: '4px 12px', borderRadius: 999, fontSize: 12, fontWeight: 600,
                  background: inWindow ? '#DCFCE7' : '#F3F4F6',
                  color: inWindow ? '#16A34A' : '#9CA3AF',
                }}>
                  {inWindow ? 'Janela fertil' : 'Fora da janela'}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
                <div style={{ background: '#FFF1F2', borderRadius: 10, padding: 12 }}>
                  <p style={{ fontSize: 11, color: '#9CA3AF', margin: 0, textTransform: 'uppercase', fontWeight: 600 }}>Inicio</p>
                  <p style={{ fontSize: 14, fontWeight: 600, color: '#9F1239', margin: '4px 0 0' }}>
                    {formatBR(fertileWindow.fertileWindowStart)}
                  </p>
                </div>
                <div style={{ background: '#FFF1F2', borderRadius: 10, padding: 12 }}>
                  <p style={{ fontSize: 11, color: '#9CA3AF', margin: 0, textTransform: 'uppercase', fontWeight: 600 }}>Fim</p>
                  <p style={{ fontSize: 14, fontWeight: 600, color: '#9F1239', margin: '4px 0 0' }}>
                    {formatBR(fertileWindow.fertileWindowEnd)}
                  </p>
                </div>
              </div>

              {fertileWindow.estimatedOvulation && (
                <div style={{ background: '#FDFAF3', borderRadius: 10, padding: 12, marginBottom: 10 }}>
                  <p style={{ fontSize: 11, color: '#9CA3AF', margin: 0, textTransform: 'uppercase', fontWeight: 600 }}>Ovulação estimada</p>
                  <p style={{ fontSize: 14, fontWeight: 600, color: '#14161F', margin: '4px 0 0' }}>
                    {formatBR(fertileWindow.estimatedOvulation)}
                  </p>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: '#9CA3AF' }}>Metodo: {fertileWindow.method}</span>
                {daysToWindow !== null && (
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#BE185D' }}>
                    {daysToWindow} dia{daysToWindow !== 1 ? 's' : ''} até próxima janela
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Section C: BBT Chart */}
          {chartData && chartData.bbt && chartData.bbt.length > 0 && (
            <div style={card}>
              <p style={{ fontSize: 15, fontWeight: 600, color: '#374151', marginBottom: 4 }}>Gráfico de temperatura basal</p>
              <p style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 12 }}>Temperatura corporal basal (BBT)</p>
              {renderChart()}
              <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 10, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 10, color: '#BE185D', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#BE185D', display: 'inline-block' }} /> Temperatura
                </span>
                {chartData.coverline && (
                  <span style={{ fontSize: 10, color: '#F59E0B', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ width: 12, height: 0, borderTop: '2px dashed #F59E0B', display: 'inline-block' }} /> Coverline
                  </span>
                )}
                <span style={{ fontSize: 10, color: '#DC2626', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', border: '1.5px solid #DC2626', display: 'inline-block' }} /> LH
                </span>
                <span style={{ fontSize: 10, color: '#14161F', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', border: '2px solid #14161F', display: 'inline-block' }} /> Ovulação
                </span>
              </div>
              <p style={{ fontSize: 10, color: '#9CA3AF', marginTop: 12, textAlign: 'center', fontStyle: 'italic' }}>
                Ref.: American Society for Reproductive Medicine (ASRM)
              </p>
            </div>
          )}
        </>
      )}
    </Layout>
  );
}
