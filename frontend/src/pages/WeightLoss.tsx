import React, { useEffect, useState, useMemo } from 'react';
import Layout from '../components/Layout';
import {
  weightLossApi,
  WeightLossAssessment,
  ProgressData,
  CreateAssessmentInput,
} from '../services/weight-loss.api';
import { ChevronDown, ChevronUp, Plus } from 'lucide-react';

const V = '#7C3AED';
const DARK = '#2D1B4E';

const COMORBIDITY_LABELS: Record<string, string> = {
  none: 'Nenhuma',
  dm2: 'Diabetes tipo 2',
  hypertension: 'Hipertensao',
  metabolic_syndrome: 'Sindrome metabolica',
  pcos: 'SOP / PCOS',
};

const ACTIVITY_OPTIONS = [
  { value: 1.2, label: 'Sedentaria (1.2)' },
  { value: 1.375, label: 'Leve (1.375)' },
  { value: 1.55, label: 'Moderada (1.55)' },
  { value: 1.725, label: 'Ativa (1.725)' },
  { value: 1.9, label: 'Muito ativa (1.9)' },
];

export default function WeightLoss() {
  const [assessment, setAssessment] = useState<WeightLossAssessment | null>(null);
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Assessment form
  const [age, setAge] = useState<number | ''>(30);
  const [sex, setSex] = useState<'M' | 'F'>('F');
  const [weight, setWeight] = useState<number | ''>('');
  const [height, setHeight] = useState<number | ''>('');
  const [targetWeight, setTargetWeight] = useState<number | ''>('');
  const [deadline, setDeadline] = useState(6);
  const [activity, setActivity] = useState(1.55);
  const [comorbidity, setComorbidity] = useState<CreateAssessmentInput['comorbidity']>('none');
  const [submitting, setSubmitting] = useState(false);

  // Checkin form
  const [checkinOpen, setCheckinOpen] = useState(false);
  const [ciWeek, setCiWeek] = useState<number | ''>(1);
  const [ciWeight, setCiWeight] = useState<number | ''>('');
  const [ciAdherence, setCiAdherence] = useState(80);
  const [ciNotes, setCiNotes] = useState('');
  const [submittingCI, setSubmittingCI] = useState(false);

  // Plan accordion
  const [planOpen, setPlanOpen] = useState(false);

  const bmiPreview = useMemo(() => {
    if (weight === '' || height === '' || Number(height) === 0) return null;
    const h = Number(height) / 100;
    return (Number(weight) / (h * h)).toFixed(1);
  }, [weight, height]);

  const refresh = async () => {
    try {
      const a = await weightLossApi.getAssessment();
      setAssessment(a);
      // auto-suggest next week
      const lastWeek = a.checkins?.length ? Math.max(...a.checkins.map(c => c.weekNumber)) : 0;
      setCiWeek(lastWeek + 1);
      try {
        const p = await weightLossApi.progress(a.id);
        setProgress(p);
      } catch {
        // no progress yet is fine
      }
    } catch (err: any) {
      if (err?.response?.status === 404) {
        setAssessment(null);
      } else {
        setError('Nao foi possivel carregar dados.');
      }
    }
  };

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, []);

  const handleCreateAssessment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (weight === '' || height === '' || targetWeight === '' || age === '') return;
    setSubmitting(true);
    setError(null);
    try {
      const dto: CreateAssessmentInput = {
        age: Number(age),
        biologicalSex: sex,
        weightKg: Number(weight),
        heightCm: Number(height),
        targetWeightKg: Number(targetWeight),
        deadlineMonths: deadline,
        activityFactor: activity,
        comorbidity,
      };
      const a = await weightLossApi.createAssessment(dto);
      setAssessment(a);
      try {
        const p = await weightLossApi.progress(a.id);
        setProgress(p);
      } catch {}
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Falha ao criar avaliacao';
      setError(Array.isArray(msg) ? msg.join(', ') : msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCheckin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assessment || ciWeight === '' || ciWeek === '') return;
    setSubmittingCI(true);
    setError(null);
    try {
      await weightLossApi.checkin({
        assessmentId: assessment.id,
        weekNumber: Number(ciWeek),
        weightKg: Number(ciWeight),
        adherencePercent: ciAdherence,
        notes: ciNotes || undefined,
      });
      setCiWeight('');
      setCiNotes('');
      setCiAdherence(80);
      setCheckinOpen(false);
      await refresh();
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Falha ao registrar check-in';
      setError(Array.isArray(msg) ? msg.join(', ') : msg);
    } finally {
      setSubmittingCI(false);
    }
  };

  const checkins = assessment?.checkins ?? [];
  const weeklyPlan = assessment?.weeklyPlan ?? [];
  const comorbProto = assessment?.comorbidityProtocol;

  // Build expected curve from assessment data
  const expectedCurve = useMemo(() => {
    if (!assessment) return [];
    const pts: { week: number; expected: number }[] = [];
    const totalWeeks = assessment.estimatedWeeksToGoal || 12;
    const wPerWeek = assessment.estimatedWeeklyLossKg || 0.5;
    for (let w = 0; w <= Math.min(totalWeeks, 24); w++) {
      pts.push({ week: w, expected: Math.max(assessment.weightKg - w * wPerWeek, assessment.targetWeightKg) });
    }
    return pts;
  }, [assessment]);

  // Progress curve
  const curve = progress?.curve ?? [];

  // Chart bounds
  const allWeights = useMemo(() => {
    const vals: number[] = [];
    expectedCurve.forEach(p => vals.push(p.expected));
    curve.forEach(p => { if (p.real) vals.push(p.real); vals.push(p.expected); });
    checkins.forEach(c => vals.push(c.weightKg));
    if (assessment) { vals.push(assessment.weightKg); vals.push(assessment.targetWeightKg); }
    return vals;
  }, [expectedCurve, curve, checkins, assessment]);

  const chartMin = allWeights.length ? Math.min(...allWeights) - 1 : 50;
  const chartMax = allWeights.length ? Math.max(...allWeights) + 1 : 100;
  const chartRange = chartMax - chartMin || 1;

  const displayCurve = curve.length > 0 ? curve : expectedCurve.map(p => ({ week: p.week, expected: p.expected, real: 0, delta: 0, adherence: 0 }));
  const maxWeek = displayCurve.length > 0 ? Math.max(...displayCurve.map(d => d.week)) : 12;

  return (
    <Layout title="Programa de Emagrecimento" subtitle="Avaliacao clinica baseada em evidencias">
      <style>{`
        .wl-card { background:#fff; border:1px solid #E5E7EB; border-radius:14px; padding:16px; margin-bottom:16px; }
        .wl-section { margin-bottom:28px; }
        .wl-section-title { font-size:16px; font-weight:600; color:#111827; margin-bottom:12px; }
        .wl-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(160px,1fr)); gap:12px; margin-bottom:16px; }
        .wl-stat-label { font-size:12px; color:#6B7280; margin-bottom:2px; }
        .wl-stat-value { font-size:20px; font-weight:700; color:${DARK}; }
        .wl-form-row { display:flex; gap:10px; flex-wrap:wrap; margin-bottom:10px; }
        .wl-label { font-size:13px; font-weight:500; color:#374151; margin-bottom:4px; display:block; }
        .wl-input { padding:9px 12px; border:1.5px solid #E5E7EB; border-radius:10px; font-size:14px; font-family:inherit; width:100%; box-sizing:border-box; outline:none; transition:border-color 0.15s; }
        .wl-input:focus { border-color:${V}; }
        .wl-select { padding:9px 12px; border:1.5px solid #E5E7EB; border-radius:10px; font-size:14px; font-family:inherit; background:#fff; width:100%; box-sizing:border-box; outline:none; }
        .wl-select:focus { border-color:${V}; }
        .wl-field { flex:1; min-width:140px; }
        .wl-btn { padding:10px 20px; border-radius:10px; border:none; font-size:14px; font-weight:600; cursor:pointer; font-family:inherit; display:inline-flex; align-items:center; gap:6px; }
        .wl-btn-primary { background:${V}; color:#fff; }
        .wl-btn-primary:disabled { opacity:0.5; cursor:not-allowed; }
        .wl-error { background:#FEF2F2; color:#DC2626; padding:10px 14px; border-radius:8px; font-size:13px; margin-bottom:16px; }
        .wl-bmi-preview { background:#EDE9FE; color:${V}; padding:8px 14px; border-radius:10px; font-size:14px; font-weight:600; display:inline-block; margin-bottom:12px; }
        .wl-macro-bar { height:10px; border-radius:5px; margin-bottom:4px; }
        .wl-macro-row { display:flex; align-items:center; gap:10px; margin-bottom:10px; }
        .wl-macro-label { font-size:13px; color:#374151; min-width:110px; font-weight:500; }
        .wl-macro-value { font-size:13px; font-weight:700; color:#111827; min-width:50px; text-align:right; }
        .wl-chart { position:relative; height:200px; display:flex; align-items:flex-end; gap:0; padding:0 4px; }
        .wl-chart-col { flex:1; display:flex; flex-direction:column; align-items:center; position:relative; min-width:0; }
        .wl-dot { width:10px; height:10px; border-radius:50%; position:absolute; z-index:2; }
        .wl-dot-expected { background:#D1D5DB; border:2px solid #9CA3AF; }
        .wl-dot-real { background:${V}; border:2px solid ${V}; }
        .wl-line-segment { position:absolute; height:2px; z-index:1; }
        .wl-week-label { font-size:9px; color:#9CA3AF; margin-top:4px; position:absolute; bottom:-18px; }
        .wl-checkin-item { display:flex; align-items:center; justify-content:space-between; padding:10px 0; border-bottom:1px solid #F3F4F6; font-size:13px; }
        .wl-delta-pos { color:#DC2626; font-weight:600; }
        .wl-delta-neg { color:#059669; font-weight:600; }
        .wl-toggle { display:flex; align-items:center; gap:8px; cursor:pointer; background:none; border:none; font-size:14px; font-weight:600; color:${V}; padding:8px 0; font-family:inherit; }
        .wl-phase { border:1px solid #E5E7EB; border-radius:10px; padding:14px; margin-bottom:10px; background:#FAFAFA; }
        .wl-phase-title { font-size:14px; font-weight:600; color:${DARK}; margin-bottom:6px; }
        .wl-phase-detail { font-size:12px; color:#6B7280; margin-bottom:2px; }
        .wl-checklist-item { font-size:13px; color:#374151; padding:2px 0; }
        .wl-proto { background:#FEF3C7; border:1px solid #FDE68A; border-radius:12px; padding:16px; margin-bottom:16px; }
        .wl-proto-title { font-size:15px; font-weight:600; color:#92400E; margin-bottom:8px; }
        .wl-proto-ref { font-size:11px; color:#B45309; margin-bottom:8px; }
        .wl-proto-item { font-size:13px; color:#78350F; padding:3px 0; }
        .wl-range-wrap { display:flex; align-items:center; gap:12px; flex:1; min-width:200px; }
        .wl-range { flex:1; accent-color:${V}; }
        .wl-range-val { font-size:14px; font-weight:700; color:${V}; min-width:40px; text-align:center; }
        .wl-textarea { padding:9px 12px; border:1.5px solid #E5E7EB; border-radius:10px; font-size:14px; font-family:inherit; width:100%; min-height:60px; resize:vertical; box-sizing:border-box; outline:none; }
        .wl-textarea:focus { border-color:${V}; }
        .wl-arrow { color:${V}; font-size:20px; margin:0 6px; }
        .wl-empty { text-align:center; color:#9CA3AF; padding:24px; font-size:14px; }
      `}</style>

      {loading && <p style={{ color: '#6B7280' }}>Carregando...</p>}
      {error && <div className="wl-error">{error}</div>}

      {!loading && !assessment && (
        /* ========== VIEW 1: ASSESSMENT FORM ========== */
        <form onSubmit={handleCreateAssessment}>
          <div className="wl-card">
            {bmiPreview && (
              <div className="wl-bmi-preview">IMC estimado: {bmiPreview} kg/m2</div>
            )}

            <div className="wl-form-row">
              <div className="wl-field">
                <label className="wl-label">Idade</label>
                <input type="number" className="wl-input" min={16} max={80} value={age}
                  onChange={e => setAge(e.target.value === '' ? '' : Number(e.target.value))} />
              </div>
              <div className="wl-field">
                <label className="wl-label">Sexo biologico</label>
                <select className="wl-select" value={sex} onChange={e => setSex(e.target.value as 'M' | 'F')}>
                  <option value="F">Feminino</option>
                  <option value="M">Masculino</option>
                </select>
              </div>
            </div>

            <div className="wl-form-row">
              <div className="wl-field">
                <label className="wl-label">Peso atual (kg)</label>
                <input type="number" step="0.1" className="wl-input" value={weight}
                  onChange={e => setWeight(e.target.value === '' ? '' : Number(e.target.value))} />
              </div>
              <div className="wl-field">
                <label className="wl-label">Altura (cm)</label>
                <input type="number" className="wl-input" value={height}
                  onChange={e => setHeight(e.target.value === '' ? '' : Number(e.target.value))} />
              </div>
            </div>

            <div className="wl-form-row">
              <div className="wl-field">
                <label className="wl-label">Peso meta (kg)</label>
                <input type="number" step="0.1" className="wl-input" value={targetWeight}
                  onChange={e => setTargetWeight(e.target.value === '' ? '' : Number(e.target.value))} />
              </div>
              <div className="wl-field">
                <label className="wl-label">Prazo</label>
                <select className="wl-select" value={deadline} onChange={e => setDeadline(Number(e.target.value))}>
                  <option value={3}>3 meses</option>
                  <option value={6}>6 meses</option>
                  <option value={12}>12 meses</option>
                </select>
              </div>
            </div>

            <div className="wl-form-row">
              <div className="wl-field">
                <label className="wl-label">Nivel de atividade</label>
                <select className="wl-select" value={activity} onChange={e => setActivity(Number(e.target.value))}>
                  {ACTIVITY_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
              <div className="wl-field">
                <label className="wl-label">Comorbidade</label>
                <select className="wl-select" value={comorbidity} onChange={e => setComorbidity(e.target.value as CreateAssessmentInput['comorbidity'])}>
                  <option value="none">Nenhuma</option>
                  <option value="dm2">Diabetes tipo 2</option>
                  <option value="hypertension">Hipertensao</option>
                  <option value="metabolic_syndrome">Sindrome metabolica</option>
                  <option value="pcos">SOP / PCOS</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
              <button type="submit" className="wl-btn wl-btn-primary" disabled={submitting || weight === '' || height === '' || targetWeight === ''}>
                {submitting ? 'Criando...' : 'Iniciar programa'}
              </button>
            </div>
          </div>
        </form>
      )}

      {!loading && assessment && (
        /* ========== VIEW 2: DASHBOARD ========== */
        <>
          {/* A) Resumo */}
          <div className="wl-section">
            <div className="wl-section-title">Resumo</div>
            <div className="wl-grid">
              <div className="wl-card" style={{ textAlign: 'center' }}>
                <div className="wl-stat-label">Peso</div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                  <span className="wl-stat-value">{assessment.weightKg}</span>
                  <span className="wl-arrow">&rarr;</span>
                  <span className="wl-stat-value" style={{ color: V }}>{assessment.targetWeightKg}</span>
                </div>
                <div style={{ fontSize: 11, color: '#6B7280' }}>kg</div>
              </div>
              <div className="wl-card">
                <div className="wl-stat-label">Deficit</div>
                <div className="wl-stat-value">{assessment.caloricDeficit}</div>
                <div style={{ fontSize: 11, color: '#6B7280' }}>kcal/dia</div>
              </div>
              <div className="wl-card">
                <div className="wl-stat-label">Perda estimada</div>
                <div className="wl-stat-value">{assessment.estimatedWeeklyLossKg}</div>
                <div style={{ fontSize: 11, color: '#6B7280' }}>kg/semana</div>
              </div>
              <div className="wl-card">
                <div className="wl-stat-label">Meta em</div>
                <div className="wl-stat-value">{assessment.estimatedWeeksToGoal}</div>
                <div style={{ fontSize: 11, color: '#6B7280' }}>semanas</div>
              </div>
            </div>
          </div>

          {/* B) Macros diarios */}
          <div className="wl-section">
            <div className="wl-section-title">Macros diarios</div>
            <div className="wl-card">
              <div className="wl-macro-row">
                <span className="wl-macro-label">Proteina</span>
                <div style={{ flex: 1 }}>
                  <div className="wl-macro-bar" style={{ background: V, width: `${Math.min((assessment.proteinG / (assessment.proteinG + assessment.carbsG + assessment.fatsG)) * 100 * 2.5, 100)}%` }} />
                </div>
                <span className="wl-macro-value">{assessment.proteinG}g</span>
              </div>
              <div className="wl-macro-row">
                <span className="wl-macro-label">Carboidratos</span>
                <div style={{ flex: 1 }}>
                  <div className="wl-macro-bar" style={{ background: '#10B981', width: `${Math.min((assessment.carbsG / (assessment.proteinG + assessment.carbsG + assessment.fatsG)) * 100 * 2.5, 100)}%` }} />
                </div>
                <span className="wl-macro-value">{assessment.carbsG}g</span>
              </div>
              <div className="wl-macro-row">
                <span className="wl-macro-label">Gordura</span>
                <div style={{ flex: 1 }}>
                  <div className="wl-macro-bar" style={{ background: '#F59E0B', width: `${Math.min((assessment.fatsG / (assessment.proteinG + assessment.carbsG + assessment.fatsG)) * 100 * 2.5, 100)}%` }} />
                </div>
                <span className="wl-macro-value">{assessment.fatsG}g</span>
              </div>
              <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: 10, marginTop: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 13, fontWeight: 500, color: '#374151' }}>Calorias totais</span>
                <span style={{ fontSize: 18, fontWeight: 700, color: DARK }}>{assessment.dailyCalorieGoal} kcal</span>
              </div>
            </div>
          </div>

          {/* C) Curva de progresso */}
          <div className="wl-section">
            <div className="wl-section-title">Curva de progresso</div>
            <div className="wl-card" style={{ paddingBottom: 32, overflowX: 'auto' }}>
              {displayCurve.length === 0 ? (
                <div className="wl-empty">Nenhum dado de progresso ainda.</div>
              ) : (
                <div style={{ position: 'relative', height: 200, minWidth: Math.max(displayCurve.length * 36, 300) }}>
                  {/* Expected line (dashed gray) */}
                  {displayCurve.map((pt, i) => {
                    if (i === 0) return null;
                    const prev = displayCurve[i - 1];
                    const x1 = ((prev.week / maxWeek) * 100);
                    const x2 = ((pt.week / maxWeek) * 100);
                    const y1 = ((chartMax - prev.expected) / chartRange) * 100;
                    const y2 = ((chartMax - pt.expected) / chartRange) * 100;
                    const dx = x2 - x1;
                    const dy = y2 - y1;
                    const len = Math.sqrt(dx * dx + dy * dy);
                    const angle = Math.atan2(dy, dx) * (180 / Math.PI);
                    return (
                      <div key={`el-${i}`} className="wl-line-segment" style={{
                        left: `${x1}%`, top: `${y1}%`,
                        width: `${len}%`, transform: `rotate(${angle}deg)`, transformOrigin: '0 0',
                        borderTop: '2px dashed #D1D5DB',
                        background: 'transparent', height: 0,
                      }} />
                    );
                  })}
                  {/* Real line (violet solid) */}
                  {curve.filter(pt => pt.real > 0).map((pt, i, arr) => {
                    if (i === 0) return null;
                    const prev = arr[i - 1];
                    const x1 = ((prev.week / maxWeek) * 100);
                    const x2 = ((pt.week / maxWeek) * 100);
                    const y1 = ((chartMax - prev.real) / chartRange) * 100;
                    const y2 = ((chartMax - pt.real) / chartRange) * 100;
                    const dx = x2 - x1;
                    const dy = y2 - y1;
                    const len = Math.sqrt(dx * dx + dy * dy);
                    const angle = Math.atan2(dy, dx) * (180 / Math.PI);
                    return (
                      <div key={`rl-${i}`} className="wl-line-segment" style={{
                        left: `${x1}%`, top: `${y1}%`,
                        width: `${len}%`, transform: `rotate(${angle}deg)`, transformOrigin: '0 0',
                        background: V, height: 2,
                      }} />
                    );
                  })}
                  {/* Expected dots */}
                  {displayCurve.map((pt, i) => {
                    const x = (pt.week / maxWeek) * 100;
                    const y = ((chartMax - pt.expected) / chartRange) * 100;
                    return (
                      <React.Fragment key={`ed-${i}`}>
                        <div className="wl-dot wl-dot-expected" style={{ left: `calc(${x}% - 5px)`, top: `calc(${y}% - 5px)`, position: 'absolute' }}
                          title={`Sem ${pt.week}: esperado ${pt.expected.toFixed(1)} kg`} />
                        {i % Math.max(1, Math.floor(displayCurve.length / 8)) === 0 && (
                          <div className="wl-week-label" style={{ left: `calc(${x}% - 8px)`, position: 'absolute', bottom: -18 }}>
                            S{pt.week}
                          </div>
                        )}
                      </React.Fragment>
                    );
                  })}
                  {/* Real dots */}
                  {curve.filter(pt => pt.real > 0).map((pt, i) => {
                    const x = (pt.week / maxWeek) * 100;
                    const y = ((chartMax - pt.real) / chartRange) * 100;
                    return (
                      <div key={`rd-${i}`} className="wl-dot wl-dot-real" style={{ left: `calc(${x}% - 5px)`, top: `calc(${y}% - 5px)`, position: 'absolute' }}
                        title={`Sem ${pt.week}: real ${pt.real.toFixed(1)} kg`} />
                    );
                  })}
                </div>
              )}
              <div style={{ display: 'flex', gap: 16, marginTop: 8, fontSize: 11, color: '#6B7280' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#D1D5DB', border: '2px solid #9CA3AF', display: 'inline-block' }} /> Esperado
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: V, display: 'inline-block' }} /> Real
                </span>
              </div>
            </div>
          </div>

          {/* D) Check-in semanal */}
          <div className="wl-section">
            <button className="wl-toggle" onClick={() => setCheckinOpen(!checkinOpen)}>
              {checkinOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              {checkinOpen ? 'Fechar check-in' : 'Check-in semanal'}
            </button>
            {checkinOpen && (
              <form onSubmit={handleCheckin} className="wl-card">
                <div className="wl-form-row">
                  <div className="wl-field" style={{ maxWidth: 120 }}>
                    <label className="wl-label">Semana</label>
                    <input type="number" className="wl-input" min={1} value={ciWeek}
                      onChange={e => setCiWeek(e.target.value === '' ? '' : Number(e.target.value))} />
                  </div>
                  <div className="wl-field" style={{ maxWidth: 160 }}>
                    <label className="wl-label">Peso atual (kg)</label>
                    <input type="number" step="0.1" className="wl-input" value={ciWeight}
                      onChange={e => setCiWeight(e.target.value === '' ? '' : Number(e.target.value))} />
                  </div>
                </div>
                <div className="wl-form-row">
                  <div className="wl-field">
                    <label className="wl-label">Aderencia ao plano</label>
                    <div className="wl-range-wrap">
                      <input type="range" min={0} max={100} className="wl-range" value={ciAdherence}
                        onChange={e => setCiAdherence(Number(e.target.value))} />
                      <span className="wl-range-val">{ciAdherence}%</span>
                    </div>
                  </div>
                </div>
                <div className="wl-form-row">
                  <div className="wl-field">
                    <label className="wl-label">Notas (opcional)</label>
                    <textarea className="wl-textarea" value={ciNotes} onChange={e => setCiNotes(e.target.value)} placeholder="Como foi a semana..." />
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                  <button type="submit" className="wl-btn wl-btn-primary" disabled={submittingCI || ciWeight === ''}>
                    <Plus size={14} /> {submittingCI ? 'Salvando...' : 'Registrar check-in'}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* E) Historico de check-ins */}
          {checkins.length > 0 && (
            <div className="wl-section">
              <div className="wl-section-title">Historico de check-ins</div>
              <div className="wl-card">
                {[...checkins].reverse().map(ci => (
                  <div className="wl-checkin-item" key={ci.id}>
                    <div>
                      <span style={{ fontWeight: 600 }}>Semana {ci.weekNumber}</span>
                      <span style={{ marginLeft: 10, color: '#6B7280' }}>{ci.weightKg} kg</span>
                      <span style={{ marginLeft: 6, fontSize: 12, color: '#9CA3AF' }}>
                        (esperado: {ci.expectedWeightKg} kg)
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span className={ci.deltaFromExpected <= 0 ? 'wl-delta-neg' : 'wl-delta-pos'}>
                        {ci.deltaFromExpected > 0 ? '+' : ''}{ci.deltaFromExpected.toFixed(1)} kg
                      </span>
                      <span style={{ fontSize: 12, color: '#6B7280' }}>{ci.adherencePercent}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* F) Plano semanal */}
          {weeklyPlan.length > 0 && (
            <div className="wl-section">
              <button className="wl-toggle" onClick={() => setPlanOpen(!planOpen)}>
                {planOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                {planOpen ? 'Fechar plano' : 'Plano de ' + weeklyPlan.length + ' semanas'}
              </button>
              {planOpen && weeklyPlan.map((phase: any, idx: number) => (
                <div className="wl-phase" key={idx}>
                  <div className="wl-phase-title">{phase.name || `Fase ${idx + 1}`}</div>
                  {phase.weeks && <div className="wl-phase-detail">Semanas {phase.weeks}</div>}
                  {phase.dailyCalories && <div className="wl-phase-detail">Calorias: {phase.dailyCalories} kcal | Proteina: {phase.proteinG}g | Carbs: {phase.carbsG}g | Gordura: {phase.fatsG}g</div>}
                  {phase.focus && Array.isArray(phase.focus) && phase.focus.map((item: string, fi: number) => (
                    <div className="wl-checklist-item" key={fi}>&#x2610; {item}</div>
                  ))}
                </div>
              ))}
            </div>
          )}

          {/* G) Protocolo de comorbidade */}
          {assessment.comorbidity !== 'none' && comorbProto && (
            <div className="wl-section">
              <div className="wl-section-title">Protocolo de comorbidade</div>
              <div className="wl-proto">
                <div className="wl-proto-title">{comorbProto.name || COMORBIDITY_LABELS[assessment.comorbidity]}</div>
                {comorbProto.reference && <div className="wl-proto-ref">Ref: {comorbProto.reference}</div>}
                {comorbProto.guidelines && Array.isArray(comorbProto.guidelines) && comorbProto.guidelines.map((g: string, i: number) => (
                  <div className="wl-proto-item" key={i}>&#x2022; {g}</div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </Layout>
  );
}
