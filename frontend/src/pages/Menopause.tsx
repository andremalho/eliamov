import React, { useEffect, useState } from 'react';
import { menopauseApi, MenopauseProfileData } from '../services/menopause.api';
import Layout from '../components/Layout';
import { formatBR } from '../utils/format';
import { Sun, ChevronRight, AlertTriangle } from 'lucide-react';

const STAGES = [
  { value: 'perimenopause', label: 'Perimenopausa' },
  { value: 'menopause', label: 'Menopausa' },
  { value: 'postmenopause', label: 'Pós-menopausa' },
];

const STAGE_LABELS: Record<string, string> = {
  perimenopause: 'Perimenopausa', menopause: 'Menopausa', postmenopause: 'Pós-menopausa',
};
const STAGE_COLORS: Record<string, string> = {
  perimenopause: '#D97706', menopause: '#14161F', postmenopause: '#059669',
};

const SYMPTOM_OPTIONS = [
  'Fogachos', 'Suor noturno', 'Insonia', 'Irritabilidade',
  'Dor articular', 'Ressecamento vaginal', 'Fadiga', 'Ganho de peso',
];

const MOOD_LABELS = ['', 'Muito baixo', 'Baixo', 'Normal', 'Bom', 'Otimo'];

const card: React.CSSProperties = {
  background: '#fff', borderRadius: 14, border: '1px solid #E5E7EB', padding: 16, marginBottom: 14,
};
const labelStyle: React.CSSProperties = { fontSize: 13, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 4 };
const inputStyle: React.CSSProperties = { width: '100%', padding: '10px 12px', border: '1.5px solid #E5E7EB', borderRadius: 10, fontSize: 14, outline: 'none', boxSizing: 'border-box' };
const btnPrimary: React.CSSProperties = { width: '100%', padding: 12, background: '#14161F', color: '#fff', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: 'pointer' };

function mrsColor(score: number): string {
  if (score <= 11) return '#16A34A';
  if (score <= 22) return '#D97706';
  return '#DC2626';
}

function mrsLabel(score: number): string {
  if (score <= 11) return 'Leve';
  if (score <= 22) return 'Moderado';
  return 'Severo';
}

export default function Menopause() {
  const [profile, setProfile] = useState<MenopauseProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [recs, setRecs] = useState<any>(null);
  const [dailyLogs, setDailyLogs] = useState<any[]>([]);
  const [mrsScore, setMrsScore] = useState<number | null>(null);

  // Setup form
  const [stage, setStage] = useState('perimenopause');
  const [ageAtOnset, setAgeAtOnset] = useState('');
  const [onHRT, setOnHRT] = useState(false);
  const [setupSymptoms, setSetupSymptoms] = useState<string[]>([]);

  // Daily log form
  const [showLogForm, setShowLogForm] = useState(false);
  const [hotFlashCount, setHotFlashCount] = useState('');
  const [intensity, setIntensity] = useState(3);
  const [sleepQuality, setSleepQuality] = useState(3);
  const [logMood, setLogMood] = useState(3);
  const [logSymptoms, setLogSymptoms] = useState<string[]>([]);
  const [logNotes, setLogNotes] = useState('');

  const load = async () => {
    try {
      const p = await menopauseApi.getProfile();
      setProfile(p);
      if (p) {
        const [r, l, mrs] = await Promise.all([
          menopauseApi.recommendations().catch(() => null),
          menopauseApi.logs().catch(() => []),
          menopauseApi.mrsScore().catch(() => null),
        ]);
        setRecs(r);
        setDailyLogs(Array.isArray(l) ? l.slice(0, 14) : []);
        setMrsScore(mrs?.score ?? p.mrsScore ?? null);
      }
    } catch {
      setProfile(null);
    }
  };

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await menopauseApi.createProfile({ stage, ageAtOnset: Number(ageAtOnset) || null, onHRT, symptoms: setupSymptoms });
      await load();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Falha ao criar perfil');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLog = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const entry = await menopauseApi.logDay({
        hotFlashCount: Number(hotFlashCount) || 0,
        intensity,
        sleepQuality,
        mood: logMood,
        symptoms: logSymptoms,
        notes: logNotes,
      });
      setDailyLogs(prev => [entry, ...prev].slice(0, 14));
      setShowLogForm(false);
      setHotFlashCount('');
      setIntensity(3);
      setSleepQuality(3);
      setLogMood(3);
      setLogSymptoms([]);
      setLogNotes('');
      // Refresh MRS score
      menopauseApi.mrsScore().then(r => setMrsScore(r?.score ?? null)).catch(() => {});
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Falha ao salvar registro');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleSetupSymptom = (s: string) => {
    setSetupSymptoms(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  };

  const toggleLogSymptom = (s: string) => {
    setLogSymptoms(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  };

  // 7-day summary
  const last7 = dailyLogs.slice(0, 7);
  const avg = (arr: number[]) => arr.length ? (arr.reduce((a, b) => a + b, 0) / arr.length) : 0;
  const avgFlashes = avg(last7.map((l: any) => l.hotFlashCount ?? 0));
  const avgSleep = avg(last7.map((l: any) => l.sleepQuality ?? 0));
  const avgMood = avg(last7.map((l: any) => l.mood ?? 0));

  const stageColor = STAGE_COLORS[profile?.stage ?? ''] ?? '#14161F';

  if (loading) {
    return (
      <Layout title="Saúde na menopausa" subtitle="Carregando...">
        <p style={{ color: '#6B7280', textAlign: 'center', padding: 20 }}>Carregando...</p>
      </Layout>
    );
  }

  // View 1: No profile
  if (!profile) {
    return (
      <Layout title="Saúde na menopausa" subtitle="Acompanhamento personalizado para cada fase.">
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <Sun size={36} color="#D97706" style={{ marginBottom: 8 }} />
          <p style={{ fontSize: 14, color: '#6B7280', margin: 0 }}>Crie seu perfil para receber orientações adaptadas ao seu estagio.</p>
        </div>

        <div style={card}>
          <div style={{ fontSize: 15, fontWeight: 600, color: '#111827', marginBottom: 12 }}>Criar perfil</div>
          <form onSubmit={handleSetup} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label style={labelStyle}>Estagio</label>
              <select value={stage} onChange={e => setStage(e.target.value)} style={inputStyle}>
                {STAGES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Idade de inicio dos sintomas</label>
              <input type="number" min={30} max={65} value={ageAtOnset} onChange={e => setAgeAtOnset(e.target.value)} placeholder="Ex: 48" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Terapia de reposição hormonal (TRH)</label>
              <button type="button" onClick={() => setOnHRT(!onHRT)}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', border: `1.5px solid ${onHRT ? '#14161F' : '#E5E7EB'}`, borderRadius: 10, background: onHRT ? '#FBEAE1' : '#fff', cursor: 'pointer', fontSize: 14, color: onHRT ? '#14161F' : '#6B7280', fontWeight: 500, width: '100%' }}>
                <div style={{ width: 36, height: 20, borderRadius: 999, background: onHRT ? '#14161F' : '#D1D5DB', position: 'relative', transition: 'background 0.2s' }}>
                  <div style={{ width: 16, height: 16, borderRadius: '50%', background: '#fff', position: 'absolute', top: 2, left: onHRT ? 18 : 2, transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
                </div>
                {onHRT ? 'Sim, faco TRH' : 'Não faco TRH'}
              </button>
            </div>
            <div>
              <label style={labelStyle}>Sintomas atuais</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {SYMPTOM_OPTIONS.map(s => (
                  <button key={s} type="button" onClick={() => toggleSetupSymptom(s)}
                    style={{ fontSize: 12, padding: '5px 12px', borderRadius: 999, border: `1.5px solid ${setupSymptoms.includes(s) ? '#14161F' : '#E5E7EB'}`, background: setupSymptoms.includes(s) ? '#FBEAE1' : '#fff', color: setupSymptoms.includes(s) ? '#14161F' : '#6B7280', fontWeight: 500, cursor: 'pointer' }}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
            {error && <div style={{ background: '#FEE2E2', color: '#991B1B', padding: '8px 12px', borderRadius: 8, fontSize: 13 }}>{error}</div>}
            <button type="submit" disabled={submitting} style={{ ...btnPrimary, opacity: submitting ? 0.6 : 1 }}>
              {submitting ? 'Salvando...' : 'Criar perfil'}
            </button>
          </form>
        </div>
      </Layout>
    );
  }

  // View 2: Dashboard
  const scoreVal = mrsScore ?? profile.mrsScore ?? 0;

  return (
    <Layout title="Saúde na menopausa" subtitle="Acompanhamento diario dos seus sintomas.">
      {/* Profile card with MRS gauge */}
      <div style={{ background: `linear-gradient(135deg, ${stageColor}18, ${stageColor}08)`, border: `1.5px solid ${stageColor}30`, borderRadius: 18, padding: 20, marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div>
            <div style={{ fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 600, color: '#14161F' }}>Seu perfil</div>
            <span style={{ display: 'inline-block', fontSize: 11, fontWeight: 600, padding: '2px 10px', borderRadius: 999, background: `${stageColor}20`, color: stageColor }}>
              {STAGE_LABELS[profile.stage] ?? profile.stage}
            </span>
            {profile.onHRT && (
              <span style={{ display: 'inline-block', fontSize: 11, fontWeight: 600, padding: '2px 10px', borderRadius: 999, background: '#DBEAFE', color: '#1D4ED8', marginLeft: 6 }}>TRH</span>
            )}
          </div>
        </div>

        {/* MRS Score Gauge */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 11, color: '#6B7280', marginBottom: 6 }}>Escore MRS</div>
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <svg width="120" height="70" viewBox="0 0 120 70">
              {/* Background arc */}
              <path d="M 10 65 A 50 50 0 0 1 110 65" fill="none" stroke="#E5E7EB" strokeWidth="10" strokeLinecap="round" />
              {/* Colored arc */}
              <path d="M 10 65 A 50 50 0 0 1 110 65" fill="none" stroke={mrsColor(scoreVal)} strokeWidth="10" strokeLinecap="round"
                strokeDasharray={`${(Math.min(scoreVal, 44) / 44) * 157} 157`} />
            </svg>
            <div style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: mrsColor(scoreVal) }}>{scoreVal}</div>
              <div style={{ fontSize: 10, color: '#6B7280' }}>{mrsLabel(scoreVal)} (0-44)</div>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 8, fontSize: 10, color: '#9CA3AF' }}>
            <span><span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#16A34A', marginRight: 3 }} />0-11</span>
            <span><span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#D97706', marginRight: 3 }} />12-22</span>
            <span><span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#DC2626', marginRight: 3 }} />23-44</span>
          </div>
        </div>
      </div>

      {/* Daily log form */}
      {!showLogForm ? (
        <button onClick={() => setShowLogForm(true)} style={{ ...btnPrimary, marginBottom: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          Registrar dia
        </button>
      ) : (
        <div style={card}>
          <div style={{ fontSize: 15, fontWeight: 600, color: '#111827', marginBottom: 12 }}>Registro diario</div>
          <form onSubmit={handleLog} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label style={labelStyle}>Fogachos (qtd)</label>
                <input type="number" min={0} max={50} value={hotFlashCount} onChange={e => setHotFlashCount(e.target.value)} placeholder="0" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Intensidade (1-5)</label>
                <div style={{ display: 'flex', gap: 4 }}>
                  {[1,2,3,4,5].map(v => (
                    <button key={v} type="button" onClick={() => setIntensity(v)}
                      style={{ flex: 1, padding: '8px 0', border: `1.5px solid ${intensity === v ? '#14161F' : '#E5E7EB'}`, borderRadius: 8, background: intensity === v ? '#FBEAE1' : '#fff', color: intensity === v ? '#14161F' : '#6B7280', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                      {v}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label style={labelStyle}>Qualidade do sono (1-5)</label>
                <div style={{ display: 'flex', gap: 4 }}>
                  {[1,2,3,4,5].map(v => (
                    <button key={v} type="button" onClick={() => setSleepQuality(v)}
                      style={{ flex: 1, padding: '8px 0', border: `1.5px solid ${sleepQuality === v ? '#14161F' : '#E5E7EB'}`, borderRadius: 8, background: sleepQuality === v ? '#FBEAE1' : '#fff', color: sleepQuality === v ? '#14161F' : '#6B7280', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                      {v}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label style={labelStyle}>Humor (1-5)</label>
                <div style={{ display: 'flex', gap: 4 }}>
                  {[1,2,3,4,5].map(v => (
                    <button key={v} type="button" onClick={() => setLogMood(v)}
                      style={{ flex: 1, padding: '8px 0', border: `1.5px solid ${logMood === v ? '#14161F' : '#E5E7EB'}`, borderRadius: 8, background: logMood === v ? '#FBEAE1' : '#fff', color: logMood === v ? '#14161F' : '#6B7280', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                      {v}
                    </button>
                  ))}
                </div>
                <div style={{ fontSize: 10, color: '#9CA3AF', marginTop: 2 }}>{MOOD_LABELS[logMood]}</div>
              </div>
            </div>
            <div>
              <label style={labelStyle}>Sintomas</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {SYMPTOM_OPTIONS.map(s => (
                  <button key={s} type="button" onClick={() => toggleLogSymptom(s)}
                    style={{ fontSize: 12, padding: '5px 12px', borderRadius: 999, border: `1.5px solid ${logSymptoms.includes(s) ? '#14161F' : '#E5E7EB'}`, background: logSymptoms.includes(s) ? '#FBEAE1' : '#fff', color: logSymptoms.includes(s) ? '#14161F' : '#6B7280', fontWeight: 500, cursor: 'pointer' }}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label style={labelStyle}>Notas</label>
              <textarea value={logNotes} onChange={e => setLogNotes(e.target.value)} rows={3} placeholder="Observações do dia..." style={{ ...inputStyle, resize: 'vertical' }} />
            </div>
            {error && <div style={{ background: '#FEE2E2', color: '#991B1B', padding: '8px 12px', borderRadius: 8, fontSize: 13 }}>{error}</div>}
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="button" onClick={() => setShowLogForm(false)} style={{ flex: 1, padding: 10, border: '1px solid #E5E7EB', borderRadius: 10, background: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 500 }}>Cancelar</button>
              <button type="submit" disabled={submitting} style={{ flex: 1, padding: 10, border: 'none', borderRadius: 10, background: '#14161F', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600, opacity: submitting ? 0.6 : 1 }}>{submitting ? 'Salvando...' : 'Salvar'}</button>
            </div>
          </form>
        </div>
      )}

      {/* Recommendations */}
      {recs && (
        <div style={card}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#111827', marginBottom: 8 }}>Recomendações para {STAGE_LABELS[profile.stage] ?? profile.stage}</div>
          {recs.exercise && (
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#14161F', marginBottom: 4 }}>Exercicios</div>
              {(Array.isArray(recs.exercise) ? recs.exercise : [recs.exercise]).map((r: string, i: number) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 6, marginBottom: 3 }}>
                  <ChevronRight size={12} color="#14161F" style={{ flexShrink: 0, marginTop: 3 }} />
                  <span style={{ fontSize: 13, color: '#374151' }}>{r}</span>
                </div>
              ))}
            </div>
          )}
          {recs.nutrition && (
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#D97706', marginBottom: 4 }}>Nutrição</div>
              {(Array.isArray(recs.nutrition) ? recs.nutrition : [recs.nutrition]).map((r: string, i: number) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 6, marginBottom: 3 }}>
                  <ChevronRight size={12} color="#D97706" style={{ flexShrink: 0, marginTop: 3 }} />
                  <span style={{ fontSize: 13, color: '#374151' }}>{r}</span>
                </div>
              ))}
            </div>
          )}
          {recs.lifestyle && (
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#059669', marginBottom: 4 }}>Estilo de vida</div>
              {(Array.isArray(recs.lifestyle) ? recs.lifestyle : [recs.lifestyle]).map((r: string, i: number) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 6, marginBottom: 3 }}>
                  <ChevronRight size={12} color="#059669" style={{ flexShrink: 0, marginTop: 3 }} />
                  <span style={{ fontSize: 13, color: '#374151' }}>{r}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 7-day trend */}
      {last7.length > 0 && (
        <div style={card}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#111827', marginBottom: 8 }}>Tendência - últimos 7 dias</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            <div style={{ background: '#FEF3C7', borderRadius: 10, padding: 10, textAlign: 'center' }}>
              <div style={{ fontSize: 10, color: '#92400E' }}>Fogachos/dia</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#92400E' }}>{avgFlashes.toFixed(1)}</div>
            </div>
            <div style={{ background: '#FBEAE1', borderRadius: 10, padding: 10, textAlign: 'center' }}>
              <div style={{ fontSize: 10, color: '#14161F' }}>Sono</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#14161F' }}>{avgSleep.toFixed(1)}<span style={{ fontSize: 11, fontWeight: 400 }}>/5</span></div>
            </div>
            <div style={{ background: '#D1FAE5', borderRadius: 10, padding: 10, textAlign: 'center' }}>
              <div style={{ fontSize: 10, color: '#065F46' }}>Humor</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#065F46' }}>{avgMood.toFixed(1)}<span style={{ fontSize: 11, fontWeight: 400 }}>/5</span></div>
            </div>
          </div>
        </div>
      )}

      {/* Log history */}
      {dailyLogs.length > 0 && (
        <div>
          <div style={{ fontSize: 15, fontWeight: 600, color: '#111827', marginBottom: 10 }}>Histórico (últimos 14 dias)</div>
          {dailyLogs.map((log: any, i: number) => (
            <div key={i} style={{ ...card, marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{log.date ? formatBR(log.date) : log.createdAt ? formatBR(log.createdAt) : `Dia ${i + 1}`}</span>
              </div>
              <div style={{ display: 'flex', gap: 12, fontSize: 12, color: '#6B7280', flexWrap: 'wrap' }}>
                <span>Fogachos: <strong>{log.hotFlashCount ?? 0}</strong></span>
                <span>Intensidade: <strong>{log.intensity ?? '-'}/5</strong></span>
                <span>Sono: <strong>{log.sleepQuality ?? '-'}/5</strong></span>
                <span>Humor: <strong>{log.mood ?? '-'}/5</strong></span>
              </div>
              {log.symptoms?.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 6 }}>
                  {log.symptoms.map((s: string, j: number) => (
                    <span key={j} style={{ fontSize: 10, padding: '2px 8px', borderRadius: 999, background: '#F3F4F6', color: '#6B7280' }}>{s}</span>
                  ))}
                </div>
              )}
              {log.notes && <p style={{ fontSize: 12, color: '#6B7280', margin: '6px 0 0' }}>{log.notes}</p>}
            </div>
          ))}
        </div>
      )}

      {/* Reference */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 10, padding: '10px 12px', marginTop: 6 }}>
        <AlertTriangle size={14} color="#059669" style={{ flexShrink: 0, marginTop: 1 }} />
        <span style={{ fontSize: 12, color: '#065F46', lineHeight: 1.5 }}>Referência: International Menopause Society. Consulte seu médico para orientação individualizada.</span>
      </div>
    </Layout>
  );
}
