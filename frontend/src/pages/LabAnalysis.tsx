import React, { useEffect, useState } from 'react';
import { labAnalysisApi, LabResult } from '../services/lab-analysis.api';
import Layout from '../components/Layout';
import { formatBR } from '../utils/format';
import { FlaskRound, Upload, TrendingUp, AlertTriangle, ChevronDown, ChevronUp, X } from 'lucide-react';

/* ── marker definitions ── */
const MARKERS = [
  { key: 'hemoglobina', label: 'Hemoglobina', unit: 'g/dL', min: 12, max: 16 },
  { key: 'ferritina', label: 'Ferritina', unit: 'ng/mL', min: 12, max: 150 },
  { key: 'glicemia_jejum', label: 'Glicemia jejum', unit: 'mg/dL', min: 70, max: 99 },
  { key: 'tsh', label: 'TSH', unit: 'mUI/L', min: 0.4, max: 4.0 },
  { key: 't4_livre', label: 'T4 livre', unit: 'ng/dL', min: 0.8, max: 1.8 },
  { key: 'colesterol_total', label: 'Colesterol total', unit: 'mg/dL', min: 0, max: 200 },
  { key: 'hdl', label: 'HDL', unit: 'mg/dL', min: 40, max: 999 },
  { key: 'ldl', label: 'LDL', unit: 'mg/dL', min: 0, max: 130 },
  { key: 'triglicerides', label: 'Triglicerides', unit: 'mg/dL', min: 0, max: 150 },
  { key: 'vitamina_d', label: 'Vitamina D', unit: 'ng/mL', min: 30, max: 100 },
  { key: 'vitamina_b12', label: 'Vitamina B12', unit: 'pg/mL', min: 200, max: 900 },
] as const;

type MarkerKey = (typeof MARKERS)[number]['key'];

function markerStatus(key: string, val: number): 'normal' | 'low' | 'high' | 'critical' {
  const m = MARKERS.find((x) => x.key === key);
  if (!m) return 'normal';
  if (val < m.min * 0.7 || val > m.max * 1.5) return 'critical';
  if (val < m.min || val > m.max) return (val < m.min ? 'low' : 'high');
  return 'normal';
}

const STATUS_COLORS: Record<string, { bg: string; color: string; label: string }> = {
  normal: { bg: '#DCFCE7', color: '#166534', label: 'Normal' },
  low: { bg: '#FEF3C7', color: '#92400E', label: 'Baixo' },
  high: { bg: '#FEF3C7', color: '#92400E', label: 'Alto' },
  critical: { bg: '#FEE2E2', color: '#991B1B', label: 'Critico' },
};

function Badge({ status }: { status: string }) {
  const s = STATUS_COLORS[status] ?? STATUS_COLORS.normal;
  return (
    <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 999, fontSize: 11, fontWeight: 600, background: s.bg, color: s.color }}>
      {s.label}
    </span>
  );
}

/* ── simple line chart ── */
function MiniChart({ data }: { data: { date: string; value: number }[] }) {
  if (!data.length) return <p className="muted small">Sem dados suficientes.</p>;
  const vals = data.map((d) => d.value);
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const range = max - min || 1;
  const h = 120;
  const w = 300;
  const stepX = data.length > 1 ? w / (data.length - 1) : w / 2;
  const points = data.map((d, i) => `${i * stepX},${h - ((d.value - min) / range) * (h - 20) - 10}`).join(' ');

  return (
    <div style={{ overflowX: 'auto' }}>
      <svg width={w + 20} height={h + 24} style={{ display: 'block' }}>
        <polyline points={points} fill="none" stroke="#7C3AED" strokeWidth={2} />
        {data.map((d, i) => (
          <g key={i}>
            <circle cx={i * stepX} cy={parseFloat(points.split(' ')[i].split(',')[1])} r={3} fill="#7C3AED" />
            <text x={i * stepX} y={h + 16} textAnchor="middle" fontSize={9} fill="#6B7280">{formatBR(d.date).slice(0, 5)}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}

/* ── page ── */
export default function LabAnalysis() {
  const [exams, setExams] = useState<LabResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<any>(null);

  // form
  const [examDate, setExamDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [labName, setLabName] = useState('');
  const [reportFileUrl, setReportFileUrl] = useState('');
  const [values, setValues] = useState<Record<string, number | ''>>({});

  // history
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // evolution
  const [evoMarker, setEvoMarker] = useState<string | null>(null);
  const [evoData, setEvoData] = useState<{ date: string; value: number }[]>([]);
  const [evoLoading, setEvoLoading] = useState(false);

  const refresh = async () => {
    try {
      const list = await labAnalysisApi.list();
      setExams(list);
    } catch {
      setError('Nao foi possivel carregar exames.');
    }
  };

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setAnalysis(null);
    setSubmitting(true);
    try {
      const filtered: Record<string, number> = {};
      for (const [k, v] of Object.entries(values)) {
        if (v !== '' && v !== undefined) filtered[k] = Number(v);
      }
      const result = await labAnalysisApi.create({
        examDate,
        labName: labName || undefined,
        reportFileUrl: reportFileUrl || undefined,
        values: filtered,
      });
      setAnalysis(result);
      setValues({});
      setLabName('');
      setReportFileUrl('');
      await refresh();
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Falha ao enviar exame.';
      setError(Array.isArray(msg) ? msg.join(', ') : msg);
    } finally {
      setSubmitting(false);
    }
  };

  const showEvolution = async (marker: string) => {
    if (evoMarker === marker) { setEvoMarker(null); return; }
    setEvoMarker(marker);
    setEvoLoading(true);
    try {
      const data = await labAnalysisApi.evolution(marker);
      setEvoData(Array.isArray(data) ? data : (data.points ?? []));
    } catch {
      setEvoData([]);
    } finally {
      setEvoLoading(false);
    }
  };

  const countAlerts = (vals: Record<string, any>) => {
    let c = 0;
    for (const [k, v] of Object.entries(vals)) {
      if (typeof v === 'number') {
        const s = markerStatus(k, v);
        if (s !== 'normal') c++;
      }
    }
    return c;
  };

  return (
    <Layout title="Exames laboratoriais" subtitle="Envie seus exames e receba analise inteligente.">
      <style>{`
        .la-card { background:#fff; border-radius:12px; padding:20px; margin-bottom:16px; border:1px solid #E5E7EB; }
        .la-card h3 { font-size:16px; font-weight:600; color:#2D1B4E; margin:0 0 16px; display:flex; align-items:center; gap:8px; }
        .la-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(200px,1fr)); gap:12px; }
        .la-field label { display:block; font-size:12px; font-weight:500; color:#6B7280; margin-bottom:4px; }
        .la-field input, .la-field textarea { width:100%; padding:8px 10px; border:1px solid #D1D5DB; border-radius:8px; font-size:14px; font-family:inherit; box-sizing:border-box; }
        .la-field input:focus, .la-field textarea:focus { outline:none; border-color:#7C3AED; box-shadow:0 0 0 2px rgba(124,58,237,0.15); }
        .la-unit { font-size:10px; color:#9CA3AF; font-weight:400; }
        .la-btn { display:inline-flex; align-items:center; gap:6px; padding:10px 20px; background:#7C3AED; color:#fff; border:none; border-radius:8px; font-size:14px; font-weight:600; cursor:pointer; font-family:inherit; margin-top:8px; }
        .la-btn:disabled { opacity:0.6; cursor:not-allowed; }
        .la-btn:hover:not(:disabled) { background:#6D28D9; }
        .la-ai { background:#F5F3FF; border:1px solid #DDD6FE; border-radius:10px; padding:16px; margin-top:16px; white-space:pre-wrap; font-size:14px; line-height:1.6; color:#374151; }
        .la-ai h4 { font-size:14px; font-weight:600; color:#7C3AED; margin:0 0 8px; }
        .la-hist { list-style:none; padding:0; margin:0; }
        .la-hist li { border:1px solid #E5E7EB; border-radius:10px; padding:12px 16px; margin-bottom:8px; cursor:pointer; transition:background 0.15s; }
        .la-hist li:hover { background:#FAFAFA; }
        .la-hist-head { display:flex; align-items:center; justify-content:space-between; }
        .la-hist-meta { font-size:13px; color:#374151; font-weight:500; }
        .la-hist-sub { font-size:12px; color:#6B7280; margin-top:2px; }
        .la-vals { display:grid; grid-template-columns:repeat(auto-fill,minmax(180px,1fr)); gap:8px; margin-top:12px; padding-top:12px; border-top:1px solid #E5E7EB; }
        .la-val { display:flex; align-items:center; justify-content:space-between; font-size:13px; padding:4px 0; }
        .la-val-label { color:#6B7280; }
        .la-val-num { font-weight:600; color:#111827; }
        .la-evo-btn { background:none; border:none; cursor:pointer; color:#7C3AED; font-size:12px; font-weight:500; display:inline-flex; align-items:center; gap:4px; padding:2px 6px; border-radius:4px; }
        .la-evo-btn:hover { background:#F5F3FF; }
        .la-alert-count { display:inline-flex; align-items:center; gap:4px; font-size:11px; font-weight:600; padding:2px 8px; border-radius:999px; }
        .la-result-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(220px,1fr)); gap:10px; margin-top:12px; }
        .la-result-item { display:flex; align-items:center; justify-content:space-between; background:#FAFAFA; padding:8px 12px; border-radius:8px; }
        .la-result-item .la-val-label { font-size:13px; }
        .la-result-item .la-val-num { font-size:14px; }
        .la-top-row { display:grid; grid-template-columns:1fr 1fr 1fr; gap:12px; margin-bottom:16px; }
        @media(max-width:600px) { .la-top-row { grid-template-columns:1fr; } .la-grid { grid-template-columns:1fr 1fr; } }
      `}</style>

      {loading ? (
        <p className="muted">Carregando...</p>
      ) : (
        <>
          {/* ── Section A: Upload / Create exam ── */}
          <section className="la-card">
            <h3><FlaskRound size={18} style={{ color: '#7C3AED' }} /> Novo exame</h3>
            <form onSubmit={handleSubmit}>
              <div className="la-top-row">
                <div className="la-field">
                  <label>Data do exame</label>
                  <input type="date" value={examDate} onChange={(e) => setExamDate(e.target.value)} required />
                </div>
                <div className="la-field">
                  <label>Laboratorio</label>
                  <input type="text" value={labName} onChange={(e) => setLabName(e.target.value)} placeholder="Ex: Fleury, Dasa..." />
                </div>
                <div className="la-field">
                  <label><Upload size={12} style={{ marginRight: 4 }} />URL do laudo (opcional)</label>
                  <input type="text" value={reportFileUrl} onChange={(e) => setReportFileUrl(e.target.value)} placeholder="https://..." />
                </div>
              </div>

              <p style={{ fontSize: 13, fontWeight: 600, color: '#2D1B4E', marginBottom: 12 }}>Marcadores</p>
              <div className="la-grid">
                {MARKERS.map((m) => (
                  <div key={m.key} className="la-field">
                    <label>{m.label} <span className="la-unit">({m.unit})</span></label>
                    <input
                      type="number"
                      step="any"
                      min={0}
                      value={values[m.key] ?? ''}
                      onChange={(e) => setValues((prev) => ({ ...prev, [m.key]: e.target.value === '' ? '' : Number(e.target.value) }))}
                      placeholder="—"
                    />
                  </div>
                ))}
              </div>

              {error && <div style={{ color: '#DC2626', fontSize: 13, marginTop: 12 }}>{error}</div>}

              <button type="submit" className="la-btn" disabled={submitting}>
                <FlaskRound size={16} />
                {submitting ? 'Analisando...' : 'Analisar exame'}
              </button>
            </form>

            {/* AI analysis result */}
            {analysis && (
              <div style={{ marginTop: 20 }}>
                {/* Show submitted values with badges */}
                {analysis.values && (
                  <div className="la-result-grid">
                    {Object.entries(analysis.values as Record<string, number>).map(([k, v]) => {
                      const m = MARKERS.find((x) => x.key === k);
                      const status = markerStatus(k, v as number);
                      return (
                        <div key={k} className="la-result-item">
                          <div>
                            <span className="la-val-label">{m?.label ?? k}</span>
                            <div className="la-val-num">{String(v)} <span className="la-unit">{m?.unit ?? ''}</span></div>
                          </div>
                          <Badge status={status} />
                        </div>
                      );
                    })}
                  </div>
                )}
                {analysis.aiAnalysis && (
                  <div className="la-ai">
                    <h4>Analise IA</h4>
                    {analysis.aiAnalysis}
                  </div>
                )}
              </div>
            )}
          </section>

          {/* ── Section B: History ── */}
          <section className="la-card">
            <h3><TrendingUp size={18} style={{ color: '#7C3AED' }} /> Historico de exames</h3>
            {exams.length === 0 ? (
              <p className="muted small">Nenhum exame registrado ainda.</p>
            ) : (
              <ul className="la-hist">
                {exams.map((ex) => {
                  const alerts = countAlerts(ex.values ?? {});
                  const markerCount = Object.keys(ex.values ?? {}).length;
                  const isOpen = expandedId === ex.id;
                  return (
                    <li key={ex.id} onClick={() => setExpandedId(isOpen ? null : ex.id)}>
                      <div className="la-hist-head">
                        <div>
                          <div className="la-hist-meta">
                            {formatBR(ex.examDate)}
                            {ex.labName && <span style={{ color: '#9CA3AF' }}> - {ex.labName}</span>}
                          </div>
                          <div className="la-hist-sub">
                            {markerCount} marcador{markerCount !== 1 ? 'es' : ''}
                            {alerts > 0 && (
                              <span className="la-alert-count" style={{ background: '#FEF3C7', color: '#92400E', marginLeft: 8 }}>
                                <AlertTriangle size={11} /> {alerts} alerta{alerts !== 1 ? 's' : ''}
                              </span>
                            )}
                          </div>
                        </div>
                        {isOpen ? <ChevronUp size={16} color="#9CA3AF" /> : <ChevronDown size={16} color="#9CA3AF" />}
                      </div>

                      {isOpen && ex.values && (
                        <div className="la-vals">
                          {Object.entries(ex.values).map(([k, v]) => {
                            const m = MARKERS.find((x) => x.key === k);
                            const status = typeof v === 'number' ? markerStatus(k, v) : 'normal';
                            return (
                              <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <div style={{ flex: 1 }}>
                                  <span className="la-val-label">{m?.label ?? k}</span>{' '}
                                  <span className="la-val-num">{String(v)}</span>{' '}
                                  <span className="la-unit">{m?.unit ?? ''}</span>
                                </div>
                                <Badge status={status} />
                                <button
                                  className="la-evo-btn"
                                  onClick={(ev) => { ev.stopPropagation(); showEvolution(k); }}
                                  title="Ver evolucao"
                                >
                                  <TrendingUp size={12} /> Evolucao
                                </button>
                              </div>
                            );
                          })}
                          {/* Evolution chart overlay */}
                          {evoMarker && Object.keys(ex.values).includes(evoMarker) && (
                            <div style={{ gridColumn: '1/-1', marginTop: 8, background: '#F5F3FF', padding: 12, borderRadius: 8, position: 'relative' }}>
                              <button
                                onClick={(ev) => { ev.stopPropagation(); setEvoMarker(null); }}
                                style={{ position: 'absolute', top: 8, right: 8, background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280' }}
                              >
                                <X size={14} />
                              </button>
                              <p style={{ fontSize: 13, fontWeight: 600, color: '#7C3AED', marginBottom: 8 }}>
                                Evolucao: {MARKERS.find((m) => m.key === evoMarker)?.label ?? evoMarker}
                              </p>
                              {evoLoading ? <p className="muted small">Carregando...</p> : <MiniChart data={evoData} />}
                            </div>
                          )}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </>
      )}
    </Layout>
  );
}
