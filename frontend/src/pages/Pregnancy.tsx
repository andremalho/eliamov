import React, { useEffect, useState } from 'react';
import { pregnancyApi, Pregnancy as PregnancyData, WeekInfo } from '../services/pregnancy.api';
import Layout from '../components/Layout';
import { formatBR } from '../utils/format';
import { Heart, AlertTriangle, ChevronRight } from 'lucide-react';

const BABY_SIZES: Record<number, string> = {
  4: 'semente de papoula', 5: 'grão de pimenta', 6: 'lentilha', 7: 'mirtilo',
  8: 'framboesa', 9: 'uva', 10: 'kumquat', 11: 'figo', 12: 'limao',
  13: 'ervilha-torta', 14: 'pessego', 15: 'maca', 16: 'abacate',
  17: 'pera', 18: 'batata-doce', 19: 'manga', 20: 'banana',
  21: 'cenoura', 22: 'mamao', 23: 'toranja', 24: 'milho',
  25: 'nabo', 26: 'cebola', 27: 'couve-flor', 28: 'berinjela',
  29: 'abobora', 30: 'repolho', 31: 'coco', 32: 'jicama',
  33: 'abacaxi', 34: 'melão', 35: 'melão honeydew', 36: 'alface romana',
  37: 'acelga', 38: 'alho-poro', 39: 'mini melancia', 40: 'melancia',
};

const TRIMESTER_LABELS: Record<number, string> = { 1: '1o Trimestre', 2: '2o Trimestre', 3: '3o Trimestre' };
const TRIMESTER_COLORS: Record<number, string> = { 1: '#D97757', 2: '#D97706', 3: '#059669' };

const MOOD_LABELS = ['', 'Muito baixo', 'Baixo', 'Normal', 'Bom', 'Otimo'];
const SYMPTOM_OPTIONS = [
  'Nausea', 'Fadiga', 'Dor lombar', 'Inchaco', 'Azia',
  'Insonia', 'Caibra', 'Dor de cabeca', 'Tontura', 'Falta de ar',
];

const card: React.CSSProperties = {
  background: '#fff', borderRadius: 14, border: '1px solid #E5E7EB', padding: 16, marginBottom: 14,
};
const labelStyle: React.CSSProperties = { fontSize: 13, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 4 };
const inputStyle: React.CSSProperties = { width: '100%', padding: '10px 12px', border: '1.5px solid #E5E7EB', borderRadius: 10, fontSize: 14, outline: 'none', boxSizing: 'border-box' };
const btnPrimary: React.CSSProperties = { width: '100%', padding: 12, background: '#14161F', color: '#fff', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: 'pointer' };

export default function Pregnancy() {
  const [pregnancy, setPregnancy] = useState<PregnancyData | null>(null);
  const [weekInfo, setWeekInfo] = useState<WeekInfo | null>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Setup form
  const [lastMenstrualDate, setLastMenstrualDate] = useState('');
  const [prePregnancyWeight, setPrePregnancyWeight] = useState('');

  // Weekly log form
  const [logWeight, setLogWeight] = useState('');
  const [logMood, setLogMood] = useState(3);
  const [logEnergy, setLogEnergy] = useState(3);
  const [logSymptoms, setLogSymptoms] = useState<string[]>([]);
  const [logNotes, setLogNotes] = useState('');
  const [showLogForm, setShowLogForm] = useState(false);

  const load = async () => {
    try {
      const p = await pregnancyApi.getActive();
      setPregnancy(p);
      if (p?.currentWeek) {
        const wi = await pregnancyApi.weekInfo(p.currentWeek);
        setWeekInfo(wi);
      }
    } catch {
      setPregnancy(null);
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
      await pregnancyApi.create({ lastMenstrualDate, prePregnancyWeight: Number(prePregnancyWeight) || null });
      await load();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Falha ao iniciar acompanhamento');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pregnancy) return;
    setError(null);
    setSubmitting(true);
    try {
      const entry = await pregnancyApi.logWeek(pregnancy.id, {
        weight: Number(logWeight) || null,
        mood: logMood,
        energy: logEnergy,
        symptoms: logSymptoms,
        notes: logNotes,
      });
      setLogs(prev => [entry, ...prev]);
      setShowLogForm(false);
      setLogWeight('');
      setLogMood(3);
      setLogEnergy(3);
      setLogSymptoms([]);
      setLogNotes('');
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Falha ao salvar registro');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleSymptom = (s: string) => {
    setLogSymptoms(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  };

  const trimester = weekInfo?.trimester ?? (pregnancy ? Math.min(3, Math.ceil((pregnancy.currentWeek || 1) / 13)) : 1);
  const trimColor = TRIMESTER_COLORS[trimester] ?? '#14161F';
  const progressPct = pregnancy ? Math.min(100, ((pregnancy.currentWeek || 0) / 40) * 100) : 0;
  const babySize = weekInfo?.babySize || BABY_SIZES[pregnancy?.currentWeek ?? 0] || '';

  if (loading) {
    return (
      <Layout title="Modo gravidez" subtitle="Carregando...">
        <p style={{ color: '#6B7280', textAlign: 'center', padding: 20 }}>Carregando...</p>
      </Layout>
    );
  }

  // View 1: No active pregnancy
  if (!pregnancy) {
    return (
      <Layout title="Modo gravidez" subtitle="Acompanhamento personalizado da sua gestação.">
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <Heart size={36} color="#14161F" style={{ marginBottom: 8 }} />
          <p style={{ fontSize: 14, color: '#6B7280', margin: 0 }}>Inicie o acompanhamento da sua gravidez para receber orientações personalizadas.</p>
        </div>

        <div style={card}>
          <div style={{ fontSize: 15, fontWeight: 600, color: '#111827', marginBottom: 12 }}>Iniciar acompanhamento</div>
          <form onSubmit={handleSetup} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label style={labelStyle}>Data da última menstruação (DUM)</label>
              <input type="date" value={lastMenstrualDate} onChange={e => setLastMenstrualDate(e.target.value)} required style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Peso pré-gestacional (kg)</label>
              <input type="number" step="0.1" min={30} max={200} value={prePregnancyWeight} onChange={e => setPrePregnancyWeight(e.target.value)} placeholder="Ex: 65.0" style={inputStyle} />
            </div>
            {error && <div style={{ background: '#FEE2E2', color: '#991B1B', padding: '8px 12px', borderRadius: 8, fontSize: 13 }}>{error}</div>}
            <button type="submit" disabled={submitting} style={{ ...btnPrimary, opacity: submitting ? 0.6 : 1 }}>
              {submitting ? 'Salvando...' : 'Iniciar acompanhamento'}
            </button>
          </form>
          <p style={{ fontSize: 11, color: '#9CA3AF', marginTop: 10, textAlign: 'center' }}>Referência: ACOG (American College of Obstetricians and Gynecologists)</p>
        </div>
      </Layout>
    );
  }

  // View 2: Active pregnancy dashboard
  return (
    <Layout title="Modo gravidez" subtitle="Acompanhamento semanal da sua gestação.">
      {/* Hero card */}
      <div style={{ background: `linear-gradient(135deg, ${trimColor}18, ${trimColor}08)`, border: `1.5px solid ${trimColor}30`, borderRadius: 18, padding: 20, marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: trimColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#fff', fontFamily: "'Fraunces', serif", fontSize: 26, fontWeight: 700 }}>{pregnancy.currentWeek}</span>
          </div>
          <div>
            <div style={{ fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 600, color: '#14161F' }}>Semana {pregnancy.currentWeek}</div>
            <span style={{ display: 'inline-block', fontSize: 11, fontWeight: 600, padding: '2px 10px', borderRadius: 999, background: `${trimColor}20`, color: trimColor }}>
              {TRIMESTER_LABELS[trimester]}
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ marginTop: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#6B7280', marginBottom: 4 }}>
            <span>Semana {pregnancy.currentWeek} de 40</span>
            <span>{Math.round(progressPct)}%</span>
          </div>
          <div style={{ height: 8, background: '#E5E7EB', borderRadius: 999, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${progressPct}%`, background: trimColor, borderRadius: 999, transition: 'width 0.3s' }} />
          </div>
        </div>

        {/* DPP */}
        {pregnancy.estimatedDueDate && (
          <div style={{ marginTop: 10, fontSize: 13, color: '#374151' }}>
            Data provavel do parto (DPP): <strong style={{ color: '#111827' }}>{formatBR(pregnancy.estimatedDueDate)}</strong>
          </div>
        )}
      </div>

      {/* Baby size */}
      {babySize && (
        <div style={card}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#111827', marginBottom: 4 }}>Tamanho do bebe</div>
          <p style={{ fontSize: 14, color: '#6B7280', margin: 0 }}>
            Na semana {pregnancy.currentWeek}, seu bebe tem o tamanho de um(a) <strong style={{ color: trimColor }}>{babySize}</strong>.
          </p>
        </div>
      )}

      {/* Exercise recommendations */}
      {weekInfo?.exerciseRecs && weekInfo.exerciseRecs.length > 0 && (
        <div style={card}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#111827', marginBottom: 8 }}>Exercicios recomendados</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {weekInfo.exerciseRecs.map((rec, i) => (
              <span key={i} style={{ fontSize: 12, padding: '4px 10px', borderRadius: 999, background: '#FBEAE1', color: '#14161F', fontWeight: 500 }}>{rec}</span>
            ))}
          </div>
        </div>
      )}

      {/* Nutrition tips */}
      {weekInfo?.nutritionTips && weekInfo.nutritionTips.length > 0 && (
        <div style={card}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#111827', marginBottom: 8 }}>Dicas de nutrição</div>
          {weekInfo.nutritionTips.map((tip, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 6, marginBottom: 4 }}>
              <ChevronRight size={12} color="#14161F" style={{ flexShrink: 0, marginTop: 3 }} />
              <span style={{ fontSize: 13, color: '#374151' }}>{tip}</span>
            </div>
          ))}
        </div>
      )}

      {/* Weight tracking */}
      <div style={card}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#111827', marginBottom: 8 }}>Acompanhamento de peso</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div style={{ background: '#F9FAFB', borderRadius: 10, padding: 10, textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: '#6B7280' }}>Pré-gestacional</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#111827' }}>{pregnancy.prePregnancyWeight ?? '--'} <span style={{ fontSize: 12, fontWeight: 400 }}>kg</span></div>
          </div>
          <div style={{ background: '#F9FAFB', borderRadius: 10, padding: 10, textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: '#6B7280' }}>Atual</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: trimColor }}>{pregnancy.currentWeight ?? '--'} <span style={{ fontSize: 12, fontWeight: 400 }}>kg</span></div>
          </div>
        </div>
        {pregnancy.prePregnancyWeight && pregnancy.currentWeight && (
          <div style={{ marginTop: 8, fontSize: 12, color: '#6B7280', textAlign: 'center' }}>
            Ganho: <strong style={{ color: '#111827' }}>{(pregnancy.currentWeight - pregnancy.prePregnancyWeight).toFixed(1)} kg</strong>
          </div>
        )}
      </div>

      {/* Weekly log form */}
      {!showLogForm ? (
        <button onClick={() => setShowLogForm(true)} style={{ ...btnPrimary, marginBottom: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          Registrar semana
        </button>
      ) : (
        <div style={card}>
          <div style={{ fontSize: 15, fontWeight: 600, color: '#111827', marginBottom: 12 }}>Registro semanal</div>
          <form onSubmit={handleLog} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label style={labelStyle}>Peso atual (kg)</label>
              <input type="number" step="0.1" min={30} max={200} value={logWeight} onChange={e => setLogWeight(e.target.value)} placeholder="Ex: 67.5" style={inputStyle} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
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
              <div>
                <label style={labelStyle}>Energia (1-5)</label>
                <div style={{ display: 'flex', gap: 4 }}>
                  {[1,2,3,4,5].map(v => (
                    <button key={v} type="button" onClick={() => setLogEnergy(v)}
                      style={{ flex: 1, padding: '8px 0', border: `1.5px solid ${logEnergy === v ? '#14161F' : '#E5E7EB'}`, borderRadius: 8, background: logEnergy === v ? '#FBEAE1' : '#fff', color: logEnergy === v ? '#14161F' : '#6B7280', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                      {v}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div>
              <label style={labelStyle}>Sintomas</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {SYMPTOM_OPTIONS.map(s => (
                  <button key={s} type="button" onClick={() => toggleSymptom(s)}
                    style={{ fontSize: 12, padding: '5px 12px', borderRadius: 999, border: `1.5px solid ${logSymptoms.includes(s) ? '#14161F' : '#E5E7EB'}`, background: logSymptoms.includes(s) ? '#FBEAE1' : '#fff', color: logSymptoms.includes(s) ? '#14161F' : '#6B7280', fontWeight: 500, cursor: 'pointer' }}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label style={labelStyle}>Notas</label>
              <textarea value={logNotes} onChange={e => setLogNotes(e.target.value)} rows={3} placeholder="Como você esta se sentindo?" style={{ ...inputStyle, resize: 'vertical' }} />
            </div>
            {error && <div style={{ background: '#FEE2E2', color: '#991B1B', padding: '8px 12px', borderRadius: 8, fontSize: 13 }}>{error}</div>}
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="button" onClick={() => setShowLogForm(false)} style={{ flex: 1, padding: 10, border: '1px solid #E5E7EB', borderRadius: 10, background: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 500 }}>Cancelar</button>
              <button type="submit" disabled={submitting} style={{ flex: 1, padding: 10, border: 'none', borderRadius: 10, background: '#14161F', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600, opacity: submitting ? 0.6 : 1 }}>{submitting ? 'Salvando...' : 'Salvar'}</button>
            </div>
          </form>
        </div>
      )}

      {/* Log history */}
      {logs.length > 0 && (
        <div>
          <div style={{ fontSize: 15, fontWeight: 600, color: '#111827', marginBottom: 10 }}>Histórico semanal</div>
          {logs.map((log: any, i: number) => (
            <div key={i} style={{ ...card, marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>Semana {log.week ?? pregnancy.currentWeek}</span>
                <span style={{ fontSize: 11, color: '#9CA3AF' }}>{log.createdAt ? formatBR(log.createdAt) : ''}</span>
              </div>
              <div style={{ display: 'flex', gap: 12, fontSize: 12, color: '#6B7280' }}>
                {log.weight && <span>Peso: <strong>{log.weight} kg</strong></span>}
                <span>Humor: <strong>{log.mood}/5</strong></span>
                <span>Energia: <strong>{log.energy}/5</strong></span>
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

      {/* Alert */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 10, padding: '10px 12px', marginTop: 6 }}>
        <AlertTriangle size={14} color="#D97706" style={{ flexShrink: 0, marginTop: 1 }} />
        <span style={{ fontSize: 12, color: '#92400E', lineHeight: 1.5 }}>Consulte seu obstetra regularmente. Este aplicativo não substitui orientação médica profissional.</span>
      </div>
    </Layout>
  );
}
