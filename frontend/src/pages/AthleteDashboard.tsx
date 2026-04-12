import React, { useEffect, useState } from 'react';
import { athleteApi, PerformanceLog, ACWR } from '../services/athlete.api';
import Layout from '../components/Layout';
import { formatBR } from '../utils/format';
import { Activity, Heart, Zap, Moon, TrendingUp, AlertTriangle, Shield } from 'lucide-react';

const RPE_LABELS: Record<number, string> = {
  1: 'Muito facil',
  2: 'Facil',
  3: 'Leve',
  4: 'Moderado-',
  5: 'Moderado',
  6: 'Moderado+',
  7: 'Dificil',
  8: 'Muito dificil',
  9: 'Quase maximo',
  10: 'Maximo',
};

const RISK_MAP: Record<string, { label: string; color: string; bg: string }> = {
  undertrained: { label: 'Subtreino', color: '#1D4ED8', bg: '#DBEAFE' },
  optimal: { label: 'Otimo', color: '#166534', bg: '#DCFCE7' },
  elevated: { label: 'Elevado', color: '#92400E', bg: '#FEF3C7' },
  high_injury_risk: { label: 'Risco de lesao', color: '#991B1B', bg: '#FEE2E2' },
};

export default function AthleteDashboard() {
  const [logs, setLogs] = useState<PerformanceLog[]>([]);
  const [acwr, setAcwr] = useState<ACWR | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // form state
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [hrv, setHrv] = useState<number | ''>('');
  const [restingHR, setRestingHR] = useState<number | ''>('');
  const [rpe, setRpe] = useState(5);
  const [duration, setDuration] = useState<number | ''>('');
  const [sleepScore, setSleepScore] = useState<number | ''>('');
  const [fatigue, setFatigue] = useState(3);
  const [vigor, setVigor] = useState(3);
  const [notes, setNotes] = useState('');

  const trainingLoad = rpe && duration ? rpe * Number(duration) : 0;

  const refresh = async () => {
    try {
      const [dash, acwrData] = await Promise.all([athleteApi.dashboard(), athleteApi.acwr()]);
      setLogs(Array.isArray(dash) ? dash : (dash.logs ?? dash.last7Days ?? []));
      setAcwr(acwrData);
    } catch {
      setError('Nao foi possivel carregar dados.');
    }
  };

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setSubmitting(true);
    try {
      await athleteApi.log({
        date,
        hrv: hrv !== '' ? Number(hrv) : undefined,
        restingHR: restingHR !== '' ? Number(restingHR) : undefined,
        rpe,
        trainingDuration: duration !== '' ? Number(duration) : undefined,
        trainingLoad: trainingLoad || undefined,
        sleepScore: sleepScore !== '' ? Number(sleepScore) : undefined,
        fatigueScore: fatigue,
        vigorScore: vigor,
        notes: notes || undefined,
      });
      setSuccess(true);
      setHrv('');
      setRestingHR('');
      setRpe(5);
      setDuration('');
      setSleepScore('');
      setFatigue(3);
      setVigor(3);
      setNotes('');
      await refresh();
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Falha ao registrar.';
      setError(Array.isArray(msg) ? msg.join(', ') : msg);
    } finally {
      setSubmitting(false);
    }
  };

  const maxLoad = Math.max(...logs.map((l) => l.trainingLoad ?? 0), 1);

  return (
    <Layout title="Desempenho atletico" subtitle="Registre treinos e monitore carga e recuperacao.">
      <style>{`
        .ad-card { background:#fff; border-radius:12px; padding:20px; margin-bottom:16px; border:1px solid #E5E7EB; }
        .ad-card h3 { font-size:16px; font-weight:600; color:#1F2937; margin:0 0 16px; display:flex; align-items:center; gap:8px; }
        .ad-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(180px,1fr)); gap:12px; }
        .ad-field label { display:block; font-size:12px; font-weight:500; color:#6B7280; margin-bottom:4px; }
        .ad-field input, .ad-field textarea, .ad-field select { width:100%; padding:8px 10px; border:1px solid #D1D5DB; border-radius:8px; font-size:14px; font-family:inherit; box-sizing:border-box; }
        .ad-field input:focus, .ad-field textarea:focus { outline:none; border-color:#7C3AED; box-shadow:0 0 0 2px rgba(124,58,237,0.15); }
        .ad-field .ad-unit { font-size:10px; color:#9CA3AF; font-weight:400; }
        .ad-btn { display:inline-flex; align-items:center; gap:6px; padding:10px 20px; background:#7C3AED; color:#fff; border:none; border-radius:8px; font-size:14px; font-weight:600; cursor:pointer; font-family:inherit; margin-top:8px; }
        .ad-btn:disabled { opacity:0.6; cursor:not-allowed; }
        .ad-btn:hover:not(:disabled) { background:#6D28D9; }
        .ad-slider-wrap { display:flex; flex-direction:column; gap:4px; }
        .ad-slider-val { display:flex; align-items:center; justify-content:space-between; }
        .ad-slider-val span { font-size:12px; color:#6B7280; }
        .ad-slider-val strong { font-size:18px; color:#7C3AED; }
        .ad-slider { width:100%; accent-color:#7C3AED; }
        .ad-load-box { background:#F5F3FF; border-radius:8px; padding:12px 16px; margin-top:12px; display:flex; align-items:center; gap:12px; }
        .ad-load-label { font-size:12px; color:#6B7280; }
        .ad-load-num { font-size:22px; font-weight:700; color:#7C3AED; }
        .ad-load-unit { font-size:12px; color:#9CA3AF; }
        .ad-acwr-big { font-size:42px; font-weight:700; line-height:1; }
        .ad-acwr-risk { display:inline-flex; align-items:center; gap:4px; padding:4px 12px; border-radius:999px; font-size:13px; font-weight:600; margin-top:8px; }
        .ad-bars { display:flex; align-items:flex-end; gap:6px; margin-top:16px; }
        .ad-bar-wrap { flex:1; display:flex; flex-direction:column; align-items:center; gap:2px; }
        .ad-bar-label { font-size:10px; color:#9CA3AF; text-align:center; }
        .ad-bar-val { font-size:10px; font-weight:600; color:#374151; }
        .ad-bar { border-radius:4px 4px 0 0; width:100%; min-height:4px; transition:height 0.3s; }
        .ad-tbl { width:100%; border-collapse:collapse; font-size:13px; }
        .ad-tbl th { text-align:left; font-size:11px; font-weight:600; color:#9CA3AF; text-transform:uppercase; letter-spacing:0.5px; padding:6px 8px; border-bottom:1px solid #E5E7EB; }
        .ad-tbl td { padding:8px; border-bottom:1px solid #F3F4F6; color:#374151; }
        .ad-tbl tr:last-child td { border-bottom:none; }
        .ad-compare { display:flex; gap:16px; margin-top:16px; align-items:center; }
        .ad-compare-bar { height:24px; border-radius:6px; display:flex; align-items:center; padding:0 10px; font-size:12px; font-weight:600; color:#fff; min-width:40px; }
        .ad-compare-label { font-size:12px; color:#6B7280; min-width:70px; }
        .ad-ref { font-size:11px; color:#9CA3AF; margin-top:12px; }
        .ad-success { background:#DCFCE7; color:#166534; padding:8px 12px; border-radius:8px; font-size:13px; font-weight:500; margin-top:8px; }
        @media(max-width:600px) { .ad-grid { grid-template-columns:1fr 1fr; } .ad-tbl { font-size:11px; } }
      `}</style>

      {loading ? (
        <p className="muted">Carregando...</p>
      ) : (
        <>
          {/* ── Section A: Daily Log ── */}
          <section className="ad-card">
            <h3><Activity size={18} style={{ color: '#7C3AED' }} /> Registro diario</h3>
            <form onSubmit={handleSubmit}>
              <div className="ad-grid">
                <div className="ad-field">
                  <label>Data</label>
                  <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
                </div>
                <div className="ad-field">
                  <label>HRV <span className="ad-unit">(ms)</span></label>
                  <input type="number" min={0} max={300} value={hrv} onChange={(e) => setHrv(e.target.value === '' ? '' : Number(e.target.value))} placeholder="—" />
                </div>
                <div className="ad-field">
                  <label><Heart size={12} style={{ marginRight: 3, color: '#EF4444' }} />FC repouso <span className="ad-unit">(bpm)</span></label>
                  <input type="number" min={30} max={200} value={restingHR} onChange={(e) => setRestingHR(e.target.value === '' ? '' : Number(e.target.value))} placeholder="—" />
                </div>
                <div className="ad-field">
                  <label>Duracao treino <span className="ad-unit">(min)</span></label>
                  <input type="number" min={0} max={600} value={duration} onChange={(e) => setDuration(e.target.value === '' ? '' : Number(e.target.value))} placeholder="—" />
                </div>
                <div className="ad-field">
                  <label><Moon size={12} style={{ marginRight: 3 }} />Sono <span className="ad-unit">(0-100)</span></label>
                  <input type="number" min={0} max={100} value={sleepScore} onChange={(e) => setSleepScore(e.target.value === '' ? '' : Number(e.target.value))} placeholder="—" />
                </div>
              </div>

              {/* RPE slider */}
              <div style={{ marginTop: 16 }}>
                <div className="ad-slider-wrap">
                  <div className="ad-slider-val">
                    <span><Zap size={12} /> PSE (RPE)</span>
                    <strong>{rpe}</strong>
                  </div>
                  <input type="range" className="ad-slider" min={1} max={10} value={rpe} onChange={(e) => setRpe(Number(e.target.value))} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#9CA3AF' }}>
                    <span>1 - Muito facil</span>
                    <span>5 - Moderado</span>
                    <span>10 - Maximo</span>
                  </div>
                </div>
              </div>

              {/* Fatigue & Vigor */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16 }}>
                <div className="ad-slider-wrap">
                  <div className="ad-slider-val">
                    <span style={{ fontSize: 12, color: '#6B7280' }}>Fadiga</span>
                    <strong style={{ fontSize: 16 }}>{fatigue}</strong>
                  </div>
                  <input type="range" className="ad-slider" min={1} max={5} value={fatigue} onChange={(e) => setFatigue(Number(e.target.value))} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#9CA3AF' }}>
                    <span>1</span><span>5</span>
                  </div>
                </div>
                <div className="ad-slider-wrap">
                  <div className="ad-slider-val">
                    <span style={{ fontSize: 12, color: '#6B7280' }}>Vigor</span>
                    <strong style={{ fontSize: 16 }}>{vigor}</strong>
                  </div>
                  <input type="range" className="ad-slider" min={1} max={5} value={vigor} onChange={(e) => setVigor(Number(e.target.value))} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#9CA3AF' }}>
                    <span>1</span><span>5</span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="ad-field" style={{ marginTop: 16 }}>
                <label>Observacoes</label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="Opcional..." />
              </div>

              {/* Training load display */}
              <div className="ad-load-box">
                <div>
                  <div className="ad-load-label">Carga de treino (RPE x duracao)</div>
                  <div>
                    <span className="ad-load-num">{trainingLoad || '—'}</span>{' '}
                    <span className="ad-load-unit">UA</span>
                  </div>
                </div>
              </div>

              {error && <div style={{ color: '#DC2626', fontSize: 13, marginTop: 12 }}>{error}</div>}
              {success && <div className="ad-success">Registro salvo com sucesso!</div>}

              <button type="submit" className="ad-btn" disabled={submitting}>
                <Activity size={16} />
                {submitting ? 'Salvando...' : 'Registrar'}
              </button>
            </form>
          </section>

          {/* ── Section B: ACWR Card ── */}
          <section className="ad-card">
            <h3><Shield size={18} style={{ color: '#7C3AED' }} /> Razao carga aguda:cronica (ACWR)</h3>
            {acwr ? (
              <>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20 }}>
                  <div>
                    <div className="ad-acwr-big" style={{ color: RISK_MAP[acwr.risk]?.color ?? '#374151' }}>
                      {acwr.acwr !== null ? acwr.acwr.toFixed(2) : '—'}
                    </div>
                    <div
                      className="ad-acwr-risk"
                      style={{ background: RISK_MAP[acwr.risk]?.bg ?? '#F3F4F6', color: RISK_MAP[acwr.risk]?.color ?? '#374151' }}
                    >
                      {acwr.risk === 'high_injury_risk' && <AlertTriangle size={13} />}
                      {RISK_MAP[acwr.risk]?.label ?? acwr.risk}
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: '#6B7280', lineHeight: 1.6 }}>
                    <div><strong>Zona ideal:</strong> 0.8 - 1.3</div>
                    <div>{'< 0.8'}: Subtreino</div>
                    <div>1.3 - 1.5: Elevado</div>
                    <div>{'> 1.5'}: Risco de lesao</div>
                  </div>
                </div>

                {/* Acute vs Chronic bars */}
                <div className="ad-compare">
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <span className="ad-compare-label">Aguda</span>
                      <div
                        className="ad-compare-bar"
                        style={{
                          width: `${Math.min(100, acwr.chronic > 0 ? (acwr.acute / Math.max(acwr.acute, acwr.chronic)) * 100 : 50)}%`,
                          background: '#7C3AED',
                        }}
                      >
                        {Math.round(acwr.acute)}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span className="ad-compare-label">Cronica</span>
                      <div
                        className="ad-compare-bar"
                        style={{
                          width: `${Math.min(100, acwr.acute > 0 ? (acwr.chronic / Math.max(acwr.acute, acwr.chronic)) * 100 : 50)}%`,
                          background: '#A78BFA',
                        }}
                      >
                        {Math.round(acwr.chronic)}
                      </div>
                    </div>
                  </div>
                </div>
                <p className="ad-ref">Ref: Gabbett TJ (2016). The training-injury prevention paradox. BJSM.</p>
              </>
            ) : (
              <p className="muted small">Dados insuficientes para calcular ACWR. Registre ao menos 4 semanas.</p>
            )}
          </section>

          {/* ── Section C: Last 7 days ── */}
          <section className="ad-card">
            <h3><TrendingUp size={18} style={{ color: '#7C3AED' }} /> Ultimos 7 dias</h3>
            {logs.length === 0 ? (
              <p className="muted small">Nenhum registro nos ultimos 7 dias.</p>
            ) : (
              <>
                <div style={{ overflowX: 'auto' }}>
                  <table className="ad-tbl">
                    <thead>
                      <tr>
                        <th>Data</th>
                        <th>HRV</th>
                        <th><Heart size={10} /> FC</th>
                        <th>PSE</th>
                        <th>Carga</th>
                        <th><Moon size={10} /> Sono</th>
                        <th>Fadiga</th>
                        <th>Vigor</th>
                      </tr>
                    </thead>
                    <tbody>
                      {logs.map((l) => (
                        <tr key={l.id}>
                          <td style={{ fontWeight: 500 }}>{formatBR(l.date).slice(0, 5)}</td>
                          <td>{l.hrv ?? '—'}</td>
                          <td>{l.restingHR ?? '—'}</td>
                          <td>{l.rpe ?? '—'}</td>
                          <td style={{ fontWeight: 600, color: '#7C3AED' }}>{l.trainingLoad ?? '—'}</td>
                          <td>{l.sleepScore ?? '—'}</td>
                          <td>{l.fatigueScore ?? '—'}</td>
                          <td>{l.vigorScore ?? '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Bar chart for training load */}
                <div style={{ marginTop: 20 }}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: '#6B7280', marginBottom: 8 }}>Carga de treino</p>
                  <div className="ad-bars" style={{ height: 120, alignItems: 'flex-end' }}>
                    {logs.map((l) => {
                      const load = l.trainingLoad ?? 0;
                      const pct = maxLoad > 0 ? (load / maxLoad) * 100 : 0;
                      return (
                        <div key={l.id} className="ad-bar-wrap">
                          <div className="ad-bar-val">{load || ''}</div>
                          <div className="ad-bar" style={{ height: `${Math.max(pct, 4)}%`, background: load > 0 ? '#7C3AED' : '#E5E7EB' }} />
                          <div className="ad-bar-label">{formatBR(l.date).slice(0, 5)}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </section>
        </>
      )}
    </Layout>
  );
}
