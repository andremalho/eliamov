import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { nutritionApi, EvolutionData, BodyComposition, WeightEntry } from '../services/nutrition.api';
import { TrendingUp, TrendingDown, Plus, Trash2, Upload, ChevronDown, ChevronUp } from 'lucide-react';

const V = '#7C3AED';

const todayISO = () => new Date().toISOString().slice(0, 10);

const fmtDate = (d: string) => {
  const [y, m, dd] = (d ?? '').slice(0, 10).split('-');
  return dd && m ? `${dd}/${m}` : d;
};

const METHOD_LABELS: Record<string, string> = {
  bioimpedance: 'Bioimpedancia',
  dexa: 'DEXA',
  manual: 'Manual',
};

export default function Evolution() {
  const [data, setData] = useState<EvolutionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Body composition form
  const [formOpen, setFormOpen] = useState(false);
  const [bcDate, setBcDate] = useState(todayISO());
  const [bcMethod, setBcMethod] = useState<string>('manual');
  const [bcFat, setBcFat] = useState<number | ''>('');
  const [bcMuscle, setBcMuscle] = useState<number | ''>('');
  const [bcWater, setBcWater] = useState<number | ''>('');
  const [bcVisceral, setBcVisceral] = useState<number | ''>('');
  const [bcBasal, setBcBasal] = useState<number | ''>('');
  const [bcBone, setBcBone] = useState<number | ''>('');
  const [bcNotes, setBcNotes] = useState('');
  const [bcFile, setBcFile] = useState<File | null>(null);
  const [submittingBC, setSubmittingBC] = useState(false);

  // Weight quick-add
  const [wDate, setWDate] = useState(todayISO());
  const [wWeight, setWWeight] = useState<number | ''>('');
  const [submittingW, setSubmittingW] = useState(false);

  const refresh = async () => {
    try {
      const evo = await nutritionApi.evolution();
      setData(evo);
    } catch {
      setError('Nao foi possivel carregar dados de evolucao.');
    }
  };

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, []);

  const handleAddWeight = async (e: React.FormEvent) => {
    e.preventDefault();
    if (wWeight === '') return;
    setSubmittingW(true);
    setError(null);
    try {
      await nutritionApi.createWeight({ date: wDate, weight: Number(wWeight) });
      setWWeight('');
      setWDate(todayISO());
      await refresh();
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Falha ao registrar peso';
      setError(Array.isArray(msg) ? msg.join(', ') : msg);
    } finally {
      setSubmittingW(false);
    }
  };

  const handleAddBC = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingBC(true);
    setError(null);
    try {
      const dto: any = { date: bcDate, method: bcMethod };
      if (bcFat !== '') dto.bodyFatPercent = Number(bcFat);
      if (bcMuscle !== '') dto.muscleMassKg = Number(bcMuscle);
      if (bcWater !== '') dto.waterPercent = Number(bcWater);
      if (bcVisceral !== '') dto.visceralFat = Number(bcVisceral);
      if (bcBasal !== '') dto.basalMetabolism = Number(bcBasal);
      if (bcBone !== '') dto.boneMassKg = Number(bcBone);
      if (bcNotes) dto.notes = bcNotes;
      // File upload would need a separate media endpoint; store as note for now
      await nutritionApi.createBodyComp(dto);
      setBcFat(''); setBcMuscle(''); setBcWater(''); setBcVisceral('');
      setBcBasal(''); setBcBone(''); setBcNotes(''); setBcFile(null);
      setBcDate(todayISO()); setBcMethod('manual');
      setFormOpen(false);
      await refresh();
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Falha ao registrar composicao';
      setError(Array.isArray(msg) ? msg.join(', ') : msg);
    } finally {
      setSubmittingBC(false);
    }
  };

  const handleDeleteBC = async (id: string) => {
    if (!confirm('Remover este registro?')) return;
    try {
      await nutritionApi.removeBodyComp(id);
      await refresh();
    } catch {
      setError('Falha ao remover registro.');
    }
  };

  const weights = data?.weights ?? [];
  const compositions = data?.compositions ?? [];
  const highlights = data?.highlights ?? [];
  const goal = data?.goal ?? null;

  // Chart data: last 12 weight entries
  const chartWeights = weights.slice(-12);
  const chartVals = chartWeights.map(w => Number(w.weight));
  const chartMin = chartVals.length ? Math.min(...chartVals) - 1 : 0;
  const chartMax = chartVals.length ? Math.max(...chartVals) + 1 : 100;
  const chartRange = chartMax - chartMin || 1;
  const goalWeight = goal?.goal === 'weight_loss' && weights.length ? Number(weights[0].weight) * 0.9 : null;

  // Latest composition
  const latest = compositions.length ? compositions[compositions.length - 1] : null;

  return (
    <Layout title="Evolucao" subtitle="Acompanhe sua evolucao ao longo do tempo.">
      <style>{`
        .evo-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 12px; margin-bottom: 24px; }
        .evo-card { background: #fff; border-radius: 12px; padding: 16px; border: 1px solid #E5E7EB; }
        .evo-card-label { font-size: 12px; color: #6B7280; margin-bottom: 4px; }
        .evo-card-value { font-size: 20px; font-weight: 700; display: flex; align-items: center; gap: 6px; }
        .evo-section { margin-bottom: 28px; }
        .evo-section-title { font-size: 16px; font-weight: 600; color: #111827; margin-bottom: 12px; }
        .evo-chart { background: #fff; border-radius: 12px; padding: 16px; border: 1px solid #E5E7EB; overflow-x: auto; }
        .evo-bars { display: flex; align-items: flex-end; gap: 6px; height: 160px; min-width: fit-content; position: relative; }
        .evo-bar-col { display: flex; flex-direction: column; align-items: center; gap: 4px; flex: 1; min-width: 40px; }
        .evo-bar { background: ${V}; border-radius: 4px 4px 0 0; min-width: 24px; width: 100%; transition: height 0.3s; }
        .evo-bar-label { font-size: 10px; color: #6B7280; white-space: nowrap; }
        .evo-bar-val { font-size: 10px; font-weight: 600; color: #374151; }
        .evo-goal-line { position: absolute; left: 0; right: 0; border-top: 2px dashed #F59E0B; pointer-events: none; }
        .evo-goal-tag { position: absolute; right: 0; top: -14px; font-size: 9px; color: #F59E0B; font-weight: 600; }
        .evo-comp-cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 10px; margin-bottom: 16px; }
        .evo-comp-card { background: #F3F4F6; border-radius: 10px; padding: 12px; text-align: center; }
        .evo-comp-card-label { font-size: 11px; color: #6B7280; }
        .evo-comp-card-value { font-size: 18px; font-weight: 700; color: #111827; }
        .evo-history-item { display: flex; align-items: center; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #F3F4F6; }
        .evo-badge { font-size: 10px; padding: 2px 8px; border-radius: 99px; font-weight: 600; }
        .evo-badge-bio { background: #DBEAFE; color: #1D4ED8; }
        .evo-badge-dexa { background: #FEF3C7; color: #B45309; }
        .evo-badge-manual { background: #E5E7EB; color: #374151; }
        .evo-form { background: #fff; border-radius: 12px; padding: 16px; border: 1px solid #E5E7EB; }
        .evo-form-row { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 10px; }
        .evo-input { padding: 8px 10px; border: 1px solid #D1D5DB; border-radius: 8px; font-size: 13px; flex: 1; min-width: 120px; font-family: inherit; }
        .evo-select { padding: 8px 10px; border: 1px solid #D1D5DB; border-radius: 8px; font-size: 13px; background: #fff; font-family: inherit; }
        .evo-btn { padding: 8px 16px; border-radius: 8px; border: none; font-size: 13px; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; font-family: inherit; }
        .evo-btn-primary { background: ${V}; color: #fff; }
        .evo-btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
        .evo-btn-outline { background: #fff; color: ${V}; border: 1px solid ${V}; }
        .evo-btn-ghost { background: none; color: #6B7280; padding: 4px; }
        .evo-btn-danger { background: none; color: #DC2626; padding: 4px; border: none; cursor: pointer; }
        .evo-toggle { display: flex; align-items: center; gap: 8px; cursor: pointer; background: none; border: none; font-size: 14px; font-weight: 600; color: ${V}; padding: 8px 0; font-family: inherit; }
        .evo-textarea { padding: 8px 10px; border: 1px solid #D1D5DB; border-radius: 8px; font-size: 13px; width: 100%; min-height: 60px; resize: vertical; font-family: inherit; }
        .evo-upload-btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 14px; border: 1px dashed #D1D5DB; border-radius: 8px; background: #F9FAFB; color: #6B7280; font-size: 12px; cursor: pointer; font-family: inherit; }
        .evo-upload-btn input { display: none; }
        .evo-error { background: #FEF2F2; color: #DC2626; padding: 10px 14px; border-radius: 8px; font-size: 13px; margin-bottom: 16px; }
        .evo-empty { text-align: center; color: #9CA3AF; padding: 24px; font-size: 14px; }
      `}</style>

      {loading && <p style={{ color: '#6B7280' }}>Carregando...</p>}
      {error && <div className="evo-error">{error}</div>}

      {!loading && (
        <>
          {/* A) Highlights */}
          {highlights.length > 0 && (
            <div className="evo-section">
              <div className="evo-grid">
                {highlights.map((h, i) => (
                  <div className="evo-card" key={i}>
                    <div className="evo-card-label">{h.label}</div>
                    <div className="evo-card-value" style={{ color: h.positive ? '#059669' : '#DC2626' }}>
                      {h.positive ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                      {h.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* B) Weight chart */}
          <div className="evo-section">
            <div className="evo-section-title">Peso</div>
            {chartWeights.length === 0 ? (
              <div className="evo-chart"><div className="evo-empty">Nenhum registro de peso ainda.</div></div>
            ) : (
              <div className="evo-chart">
                <div className="evo-bars">
                  {goalWeight != null && (
                    <div
                      className="evo-goal-line"
                      style={{ bottom: `${((goalWeight - chartMin) / chartRange) * 100}%` }}
                    >
                      <span className="evo-goal-tag">Meta {goalWeight.toFixed(0)} kg</span>
                    </div>
                  )}
                  {chartWeights.map((w, i) => {
                    const val = Number(w.weight);
                    const pct = ((val - chartMin) / chartRange) * 100;
                    return (
                      <div className="evo-bar-col" key={i}>
                        <div className="evo-bar-val">{val.toFixed(1)}</div>
                        <div className="evo-bar" style={{ height: `${Math.max(pct, 4)}%` }} />
                        <div className="evo-bar-label">{fmtDate(w.date)}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* E) Weight quick-add */}
          <div className="evo-section">
            <div className="evo-section-title">Registrar peso</div>
            <form onSubmit={handleAddWeight} className="evo-form">
              <div className="evo-form-row">
                <input
                  type="date" className="evo-input" value={wDate}
                  onChange={e => setWDate(e.target.value)}
                  style={{ maxWidth: 160 }}
                />
                <input
                  type="number" step="0.1" className="evo-input" placeholder="Peso (kg)"
                  value={wWeight} onChange={e => setWWeight(e.target.value === '' ? '' : Number(e.target.value))}
                  style={{ maxWidth: 130 }}
                />
                <button type="submit" className="evo-btn evo-btn-primary" disabled={submittingW || wWeight === ''}>
                  {submittingW ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>

          {/* C) Body composition */}
          <div className="evo-section">
            <div className="evo-section-title">Composicao corporal</div>

            {latest ? (
              <div className="evo-comp-cards">
                {latest.bodyFatPercent != null && (
                  <div className="evo-comp-card">
                    <div className="evo-comp-card-label">Gordura (%)</div>
                    <div className="evo-comp-card-value">{Number(latest.bodyFatPercent).toFixed(1)}</div>
                  </div>
                )}
                {latest.muscleMassKg != null && (
                  <div className="evo-comp-card">
                    <div className="evo-comp-card-label">Massa muscular (kg)</div>
                    <div className="evo-comp-card-value">{Number(latest.muscleMassKg).toFixed(1)}</div>
                  </div>
                )}
                {latest.waterPercent != null && (
                  <div className="evo-comp-card">
                    <div className="evo-comp-card-label">Agua (%)</div>
                    <div className="evo-comp-card-value">{Number(latest.waterPercent).toFixed(1)}</div>
                  </div>
                )}
                {latest.visceralFat != null && (
                  <div className="evo-comp-card">
                    <div className="evo-comp-card-label">Gordura visceral</div>
                    <div className="evo-comp-card-value">{Number(latest.visceralFat).toFixed(0)}</div>
                  </div>
                )}
              </div>
            ) : (
              <div className="evo-chart"><div className="evo-empty">Nenhuma medicao de composicao corporal.</div></div>
            )}

            {/* History list */}
            {compositions.length > 0 && (
              <div className="evo-form" style={{ marginTop: 12 }}>
                {[...compositions].reverse().map(c => (
                  <div className="evo-history-item" key={c.id}>
                    <div>
                      <span style={{ fontWeight: 600, fontSize: 13, color: '#111827' }}>{fmtDate(c.date)}</span>
                      <span className={`evo-badge ${c.method === 'bioimpedance' ? 'evo-badge-bio' : c.method === 'dexa' ? 'evo-badge-dexa' : 'evo-badge-manual'}`} style={{ marginLeft: 8 }}>
                        {METHOD_LABELS[c.method] || c.method}
                      </span>
                      <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>
                        {c.bodyFatPercent != null && `Gordura: ${Number(c.bodyFatPercent).toFixed(1)}%  `}
                        {c.muscleMassKg != null && `Musculo: ${Number(c.muscleMassKg).toFixed(1)} kg  `}
                        {c.waterPercent != null && `Agua: ${Number(c.waterPercent).toFixed(1)}%`}
                      </div>
                    </div>
                    <button className="evo-btn-danger" onClick={() => handleDeleteBC(c.id)} title="Remover">
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* D) Add measurement form */}
          <div className="evo-section">
            <button className="evo-toggle" onClick={() => setFormOpen(!formOpen)}>
              {formOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              {formOpen ? 'Fechar formulario' : 'Nova medicao de composicao'}
            </button>

            {formOpen && (
              <form onSubmit={handleAddBC} className="evo-form">
                <div className="evo-form-row">
                  <input type="date" className="evo-input" value={bcDate} onChange={e => setBcDate(e.target.value)} style={{ maxWidth: 160 }} />
                  <select className="evo-select" value={bcMethod} onChange={e => setBcMethod(e.target.value)}>
                    <option value="manual">Manual</option>
                    <option value="bioimpedance">Bioimpedancia</option>
                    <option value="dexa">DEXA</option>
                  </select>
                </div>
                <div className="evo-form-row">
                  <input type="number" step="0.1" className="evo-input" placeholder="Gordura corporal (%)" value={bcFat} onChange={e => setBcFat(e.target.value === '' ? '' : Number(e.target.value))} />
                  <input type="number" step="0.1" className="evo-input" placeholder="Massa muscular (kg)" value={bcMuscle} onChange={e => setBcMuscle(e.target.value === '' ? '' : Number(e.target.value))} />
                </div>
                <div className="evo-form-row">
                  <input type="number" step="0.1" className="evo-input" placeholder="Agua (%)" value={bcWater} onChange={e => setBcWater(e.target.value === '' ? '' : Number(e.target.value))} />
                  <input type="number" step="0.1" className="evo-input" placeholder="Gordura visceral" value={bcVisceral} onChange={e => setBcVisceral(e.target.value === '' ? '' : Number(e.target.value))} />
                </div>
                <div className="evo-form-row">
                  <input type="number" step="0.1" className="evo-input" placeholder="Massa ossea (kg)" value={bcBone} onChange={e => setBcBone(e.target.value === '' ? '' : Number(e.target.value))} />
                  <input type="number" step="1" className="evo-input" placeholder="Metabolismo basal (kcal)" value={bcBasal} onChange={e => setBcBasal(e.target.value === '' ? '' : Number(e.target.value))} />
                </div>
                <div className="evo-form-row">
                  <textarea className="evo-textarea" placeholder="Observacoes (opcional)" value={bcNotes} onChange={e => setBcNotes(e.target.value)} />
                </div>
                <div className="evo-form-row" style={{ alignItems: 'center' }}>
                  <label className="evo-upload-btn">
                    <Upload size={14} />
                    {bcFile ? bcFile.name : 'Upload laudo (PDF/imagem)'}
                    <input type="file" accept="image/*,application/pdf" onChange={e => setBcFile(e.target.files?.[0] ?? null)} />
                  </label>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                  <button type="submit" className="evo-btn evo-btn-primary" disabled={submittingBC}>
                    <Plus size={14} /> {submittingBC ? 'Salvando...' : 'Salvar medicao'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </>
      )}
    </Layout>
  );
}
