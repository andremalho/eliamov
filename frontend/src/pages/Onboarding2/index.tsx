import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../../components/Logo';
import { useAuth, getHomeRoute } from '../../contexts/AuthContext';
import { onboardingApi } from '../../services/onboarding.api';
import api from '../../services/api';
import {
  ArrowLeft, ArrowRight, UserCircle, ClipboardList, Heart, Building2,
  Sun, ShieldCheck, Camera, Upload, Dumbbell, Target, Scale,
  Activity, Bike, PersonStanding, Waves, Footprints,
} from 'lucide-react';

const V = '#7C3AED';
const PINK = '#F472B6';

/* ── Data configs ────────────────────────────────────────────── */
const PROFILES = [
  { value: 'female_user', label: 'Sou aluna', hint: 'Treino, ciclo e saude feminina', Icon: UserCircle, iconColor: V, iconBg: '#EDE9FE' },
  { value: 'personal_trainer', label: 'Personal trainer', hint: 'Acompanhe suas alunas', Icon: ClipboardList, iconColor: '#16A34A', iconBg: '#F0FDF4' },
  { value: 'family_companion', label: 'Familiar', hint: 'Acompanhe quem voce ama', Icon: Heart, iconColor: '#DB2777', iconBg: '#FDF2F8' },
  { value: 'academy_admin', label: 'Gestor de academia', hint: 'Gerencie sua academia', Icon: Building2, iconColor: '#1D4ED8', iconBg: '#EFF6FF' },
];

const DISEASES = [
  'Hipertensao arterial', 'Diabetes tipo 2', 'Diabetes tipo 1', 'Pre-diabetes',
  'Colesterol alto', 'Hipotireoidismo', 'Hipertireoidismo', 'Asma',
  'SOP (Sindrome do Ovario Policistico)', 'Endometriose', 'Fibromialgia',
  'Artrite / Artrose', 'Osteoporose', 'Depressao', 'Ansiedade',
  'Doenca cardiovascular', 'Nenhuma',
];

const INJURY_AREAS = [
  'Joelho', 'Ombro', 'Coluna lombar', 'Coluna cervical', 'Quadril',
  'Tornozelo', 'Punho', 'Cotovelo', 'Outra',
];

const CYCLE_STATUS = [
  { value: 'regular', label: 'Regular' },
  { value: 'irregular', label: 'Irregular' },
  { value: 'menopause', label: 'Menopausa' },
  { value: 'interrupted_contraceptive', label: 'Interrompido (anticoncepcional)' },
  { value: 'interrupted_surgery', label: 'Interrompido (cirurgia)' },
];

const CRAMP_LEVELS = [
  { value: 0, label: 'Sem colicas' },
  { value: 1, label: 'Leves' },
  { value: 2, label: 'Moderadas' },
  { value: 3, label: 'Intensas' },
  { value: 4, label: 'Incapacitantes' },
];

const PMS_SYMPTOMS = [
  'Irritabilidade', 'Inchaço', 'Dor de cabeça', 'Dor nas mamas',
  'Fadiga', 'Alteracao de humor', 'Compulsao alimentar', 'Insonia',
  'Acne', 'Dor lombar', 'Nausea', 'Fogachos (ondas de calor)',
  'Suor noturno', 'Ressecamento vaginal',
];

const ACTIVITY_LEVELS = [
  { value: 'sedentary', label: 'Sedentaria', desc: 'Nao pratica atividade fisica' },
  { value: 'light', label: 'Leve', desc: '1-2x por semana' },
  { value: 'moderate', label: 'Moderada', desc: '3-4x por semana' },
  { value: 'active', label: 'Ativa', desc: '5+ vezes por semana' },
];

const EXERCISE_TYPES = [
  { value: 'strength', label: 'Musculacao', Icon: Dumbbell },
  { value: 'cardio', label: 'Cardio', Icon: Activity },
  { value: 'yoga', label: 'Yoga/Pilates', Icon: PersonStanding },
  { value: 'cycling', label: 'Ciclismo', Icon: Bike },
  { value: 'swimming', label: 'Natacao', Icon: Waves },
  { value: 'walking', label: 'Caminhada', Icon: Footprints },
];

const GOALS = [
  { value: 'weight_loss', label: 'Emagrecer', Icon: Scale },
  { value: 'strength', label: 'Ganhar forca', Icon: Dumbbell },
  { value: 'health', label: 'Melhorar saude', Icon: Heart },
  { value: 'conditioning', label: 'Condicionamento', Icon: Activity },
  { value: 'flexibility', label: 'Flexibilidade', Icon: PersonStanding },
  { value: 'wellbeing', label: 'Bem-estar', Icon: Sun },
];

/* ── Styles ───────────────────────────────────────────────────── */
const field: React.CSSProperties = { width: '100%', padding: '10px 12px', border: '1.5px solid #E5E7EB', borderRadius: 10, fontSize: 14, fontFamily: "'DM Sans',sans-serif", outline: 'none', boxSizing: 'border-box' };
const label: React.CSSProperties = { fontSize: 13, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 5 };
const chip = (sel: boolean): React.CSSProperties => ({ display: 'inline-flex', padding: '6px 12px', borderRadius: 999, border: `1.5px solid ${sel ? V : '#E5E7EB'}`, background: sel ? '#FAF5FF' : '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 500, color: sel ? V : '#374151', transition: 'all 0.15s' });

/* ── Component ───────────────────────────────────────────────── */
export default function OnboardingFlow() {
  const navigate = useNavigate();
  const { currentUser, setCurrentUser } = useAuth();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  // Step 1 - Profile type
  const [profileType, setProfileType] = useState('female_user');
  // Step 2 - Personal data
  const [birthDate, setBirthDate] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  // Step 3 - Medical history
  const [diseases, setDiseases] = useState<string[]>([]);
  const [medications, setMedications] = useState('');
  // Step 4 - Injuries
  const [injuries, setInjuries] = useState<string[]>([]);
  const [injuryDetail, setInjuryDetail] = useState('');
  const [injuryFileUrl, setInjuryFileUrl] = useState('');
  // Step 5 - Menstrual cycle
  const [cycleStatus, setCycleStatus] = useState('regular');
  const [lastPeriod, setLastPeriod] = useState('');
  const [cycleLength, setCycleLength] = useState(28);
  const [periodLength, setPeriodLength] = useState(5);
  const [crampLevel, setCrampLevel] = useState(1);
  const [pmsSymptoms, setPmsSymptoms] = useState<string[]>([]);
  // Step 6 - Activity level
  const [activityLevel, setActivityLevel] = useState('sedentary');
  const [exerciseTypes, setExerciseTypes] = useState<string[]>([]);
  // Step 7 - Goals
  const [goals, setGoals] = useState<string[]>([]);
  const [wantsWeightLoss, setWantsWeightLoss] = useState(false);
  // Step 8 - Welcome

  const isFemale = profileType === 'female_user';
  const totalSteps = isFemale ? 8 : 2;
  const currentStep = isFemale ? step : (step === 1 ? 1 : 2);

  const saveStep = async (n: number, data: Record<string, any>) => {
    try { await onboardingApi.saveStep(n, data); } catch { /* continue */ }
  };

  const toggleArray = (arr: string[], val: string, set: (v: string[]) => void, max?: number) => {
    if (arr.includes(val)) set(arr.filter(x => x !== val));
    else if (!max || arr.length < max) set([...arr, val]);
    else { setToast(`Maximo ${max} opcoes`); setTimeout(() => setToast(''), 2000); }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const { publicUrl } = await api.post('/media/presigned-url?type=image&folder=exams').then(r => r.data);
      setInjuryFileUrl(publicUrl);
    } catch {
      setInjuryFileUrl(URL.createObjectURL(file));
    }
  };

  const next = async () => {
    setSaving(true);
    try {
      if (step === 1) {
        await saveStep(1, { profileType, name: currentUser?.name });
        setStep(isFemale ? 2 : 8);
      } else if (step === 2) {
        await saveStep(2, { birthDate, weight: Number(weight), height: Number(height) });
        setStep(3);
      } else if (step === 3) {
        await saveStep(3, { diseases, medications });
        setStep(4);
      } else if (step === 4) {
        await saveStep(4, { injuries, injuryDetail, injuryFileUrl });
        setStep(5);
      } else if (step === 5) {
        await saveStep(5, { cycleStatus, lastPeriodDate: lastPeriod, cycleDuration: cycleLength, periodDuration: periodLength, crampLevel, pmsSymptoms });
        setStep(6);
      } else if (step === 6) {
        await saveStep(6, { fitnessLevel: activityLevel, exerciseTypes });
        setStep(7);
      } else if (step === 7) {
        await saveStep(7, { fitnessGoal: goals[0], goals, wantsWeightLoss });
        setStep(8);
      }
    } finally { setSaving(false); }
  };

  const prev = () => {
    if (step === 8 && !isFemale) setStep(1);
    else if (step === 8) setStep(7);
    else if (step > 1) setStep(step - 1);
  };

  const finish = async () => {
    setSaving(true);
    try {
      await saveStep(isFemale ? 8 : 2, { completed: true });
      const res = await api.get('/auth/me');
      setCurrentUser(res.data);
      navigate(getHomeRoute(res.data), { replace: true });
    } catch {
      navigate(isFemale ? '/home' : '/trainer', { replace: true });
    } finally { setSaving(false); }
  };

  const Btn = ({ onClick, disabled, children }: { onClick: () => void; disabled?: boolean; children: React.ReactNode }) => (
    <button onClick={onClick} disabled={disabled || saving} style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
      width: '100%', padding: 14, border: 'none', borderRadius: 14,
      background: V, color: '#fff', fontSize: 14, fontWeight: 500, cursor: 'pointer',
      opacity: disabled || saving ? 0.5 : 1, marginTop: 16,
    }}>
      {saving ? 'Salvando...' : children} {!saving && <ArrowRight size={16} />}
    </button>
  );

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', background: '#F9FAFB', minHeight: '100vh', fontFamily: "'DM Sans',sans-serif", display: 'flex', flexDirection: 'column' }}>
      <input ref={fileRef} type="file" accept="image/*,.pdf" style={{ display: 'none' }} onChange={handleFileUpload} />

      {/* Top bar */}
      {step < 8 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px' }}>
          <button onClick={prev} disabled={step === 1} style={{ background: 'none', border: 'none', cursor: step > 1 ? 'pointer' : 'default', color: step > 1 ? '#6B7280' : '#E5E7EB', padding: 4 }}><ArrowLeft size={20} /></button>
          <Logo size={22} variant="dark" />
          <span style={{ fontSize: 12, color: '#9CA3AF' }}>{currentStep}/{totalSteps}</span>
        </div>
      )}

      {/* Progress */}
      {step < 8 && (
        <div style={{ display: 'flex', gap: 4, padding: '0 20px 16px' }}>
          {Array.from({ length: totalSteps }, (_, i) => (
            <div key={i} style={{ flex: 1, height: 4, borderRadius: 99, background: i < currentStep - 1 ? V : i === currentStep - 1 ? PINK : '#E5E7EB', transition: 'background 0.3s' }} />
          ))}
        </div>
      )}

      <div style={{ flex: 1, padding: step === 8 ? '40px 24px' : '0 20px 40px', display: 'flex', flexDirection: 'column' }}>

        {/* ═══ STEP 1: Profile Type ══════════════════════════════ */}
        {step === 1 && (<>
          <div style={{ fontSize: 11, fontWeight: 500, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8 }}>BEM-VINDA</div>
          <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 26, fontWeight: 600, color: '#2D1B4E', margin: '0 0 6px' }}>Como voce vai usar o eliaMov?</h1>
          <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 20 }}>Escolha o perfil que melhor descreve voce.</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
            {PROFILES.map(p => { const sel = profileType === p.value; return (
              <button key={p.value} onClick={() => setProfileType(p.value)} style={{ background: sel ? '#FAF5FF' : '#fff', border: `1.5px solid ${sel ? V : '#E5E7EB'}`, borderRadius: 14, padding: 14, cursor: 'pointer', textAlign: 'left', transform: sel ? 'scale(1.02)' : 'none', transition: 'all 0.15s' }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: p.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}><p.Icon size={18} color={p.iconColor} /></div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{p.label}</div>
                <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>{p.hint}</div>
              </button>
            ); })}
          </div>
          <Btn onClick={next}>Continuar</Btn>
        </>)}

        {/* ═══ STEP 2: Personal Data ═════════════════════════════ */}
        {step === 2 && (<>
          <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 26, fontWeight: 600, color: '#2D1B4E', margin: '0 0 16px' }}>Dados pessoais</h1>
          <div style={{ marginBottom: 14 }}>
            <span style={label}>Data de nascimento</span>
            <input type="date" value={birthDate} onChange={e => setBirthDate(e.target.value)} style={field} onFocus={e => { e.target.style.borderColor = V; }} onBlur={e => { e.target.style.borderColor = '#E5E7EB'; }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
            <div>
              <span style={label}>Peso (kg)</span>
              <input type="number" min={30} max={300} step={0.1} value={weight} onChange={e => setWeight(e.target.value)} placeholder="Ex: 65" style={field} />
            </div>
            <div>
              <span style={label}>Altura (cm)</span>
              <input type="number" min={100} max={250} value={height} onChange={e => setHeight(e.target.value)} placeholder="Ex: 165" style={field} />
            </div>
          </div>
          {weight && height && (
            <div style={{ background: '#EDE9FE', borderRadius: 10, padding: '8px 12px', marginBottom: 14, fontSize: 13 }}>
              IMC: <strong style={{ color: V }}>{(Number(weight) / Math.pow(Number(height) / 100, 2)).toFixed(1)}</strong>
            </div>
          )}
          <Btn onClick={next} disabled={!birthDate || !weight || !height}>Continuar</Btn>
        </>)}

        {/* ═══ STEP 3: Medical History ════════════════════════════ */}
        {step === 3 && (<>
          <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 26, fontWeight: 600, color: '#2D1B4E', margin: '0 0 6px' }}>Historico de saude</h1>
          <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 16 }}>Selecione condicoes que voce tem ou ja teve.</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
            {DISEASES.map(d => (
              <button key={d} onClick={() => toggleArray(diseases, d, setDiseases)} style={chip(diseases.includes(d))}>{d}</button>
            ))}
          </div>
          <div style={{ marginBottom: 14 }}>
            <span style={label}>Medicamentos em uso (opcional)</span>
            <textarea value={medications} onChange={e => setMedications(e.target.value)} placeholder="Ex: Levotiroxina 50mcg, Losartana 50mg..." rows={3} style={{ ...field, resize: 'vertical' }} />
          </div>
          <Btn onClick={next}>Continuar</Btn>
        </>)}

        {/* ═══ STEP 4: Injuries ══════════════════════════════════ */}
        {step === 4 && (<>
          <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 26, fontWeight: 600, color: '#2D1B4E', margin: '0 0 6px' }}>Lesoes previas</h1>
          <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 16 }}>Alguma articulacao ou regiao com lesao? (opcional)</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
            {INJURY_AREAS.map(a => (
              <button key={a} onClick={() => toggleArray(injuries, a, setInjuries)} style={chip(injuries.includes(a))}>{a}</button>
            ))}
          </div>
          {injuries.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <span style={label}>Descreva a lesao</span>
              <textarea value={injuryDetail} onChange={e => setInjuryDetail(e.target.value)} placeholder="Ex: Ruptura de LCA joelho direito, operada em 2023..." rows={3} style={{ ...field, resize: 'vertical' }} />
            </div>
          )}
          <div style={{ marginBottom: 14 }}>
            <span style={label}>Upload de exame (opcional)</span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="button" onClick={() => fileRef.current?.click()} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '8px 14px', borderRadius: 10, border: '1px solid #E5E7EB', background: '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 500 }}>
                <Upload size={14} /> Escolher arquivo
              </button>
              {injuryFileUrl && <span style={{ fontSize: 12, color: '#16A34A', alignSelf: 'center' }}>Arquivo enviado</span>}
            </div>
          </div>
          <Btn onClick={next}>Continuar</Btn>
        </>)}

        {/* ═══ STEP 5: Menstrual Cycle ═══════════════════════════ */}
        {step === 5 && (<>
          <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 26, fontWeight: 600, color: '#2D1B4E', margin: '0 0 6px' }}>Ciclo menstrual</h1>
          <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 16 }}>Essas informacoes personalizam seu treino.</p>

          <div style={{ marginBottom: 14 }}>
            <span style={label}>Status do ciclo</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {CYCLE_STATUS.map(s => (
                <button key={s.value} onClick={() => setCycleStatus(s.value)} style={{ ...chip(cycleStatus === s.value), width: '100%', justifyContent: 'flex-start', padding: '10px 14px' }}>{s.label}</button>
              ))}
            </div>
          </div>

          {(cycleStatus === 'regular' || cycleStatus === 'irregular') && (<>
            <div style={{ marginBottom: 14 }}>
              <span style={label}>Ultimo periodo</span>
              <input type="date" value={lastPeriod} onChange={e => setLastPeriod(e.target.value)} style={field} />
            </div>
            <div style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}><span style={label}>Duracao do ciclo</span><strong style={{ color: V, fontSize: 15 }}>{cycleLength} dias</strong></div>
              <input type="range" min={21} max={45} value={cycleLength} onChange={e => setCycleLength(Number(e.target.value))} style={{ width: '100%', accentColor: V }} />
            </div>
            <div style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}><span style={label}>Duracao do periodo</span><strong style={{ color: V, fontSize: 15 }}>{periodLength} dias</strong></div>
              <input type="range" min={2} max={10} value={periodLength} onChange={e => setPeriodLength(Number(e.target.value))} style={{ width: '100%', accentColor: V }} />
            </div>
          </>)}

          <div style={{ marginBottom: 14 }}>
            <span style={label}>Intensidade das colicas</span>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {CRAMP_LEVELS.map(c => (
                <button key={c.value} onClick={() => setCrampLevel(c.value)} style={chip(crampLevel === c.value)}>{c.label}</button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <span style={label}>Sintomas pre-menstruais ou climaticos</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {PMS_SYMPTOMS.map(s => (
                <button key={s} onClick={() => toggleArray(pmsSymptoms, s, setPmsSymptoms)} style={chip(pmsSymptoms.includes(s))}>{s}</button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, background: '#FAF5FF', borderRadius: 10, padding: '10px 12px', marginBottom: 14 }}>
            <ShieldCheck size={14} color={V} style={{ flexShrink: 0, marginTop: 1 }} />
            <span style={{ fontSize: 11, color: V, lineHeight: 1.5 }}>Essas informacoes sao privadas e nunca serao compartilhadas com seu personal trainer ou gestor.</span>
          </div>
          <Btn onClick={next}>Continuar</Btn>
        </>)}

        {/* ═══ STEP 6: Activity Level ════════════════════════════ */}
        {step === 6 && (<>
          <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 26, fontWeight: 600, color: '#2D1B4E', margin: '0 0 6px' }}>Nivel de atividade</h1>
          <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 16 }}>Qual seu nivel atual e que exercicios prefere?</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
            {ACTIVITY_LEVELS.map(l => { const sel = activityLevel === l.value; return (
              <button key={l.value} onClick={() => setActivityLevel(l.value)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 12, border: `1.5px solid ${sel ? V : '#E5E7EB'}`, background: sel ? '#FAF5FF' : '#fff', cursor: 'pointer', textAlign: 'left' }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: sel ? V : '#111827' }}>{l.label}</div>
                  <div style={{ fontSize: 12, color: '#6B7280' }}>{l.desc}</div>
                </div>
              </button>
            ); })}
          </div>

          <span style={label}>Tipos de exercicio que mais interessam</span>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 14 }}>
            {EXERCISE_TYPES.map(t => { const sel = exerciseTypes.includes(t.value); return (
              <button key={t.value} onClick={() => toggleArray(exerciseTypes, t.value, setExerciseTypes)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '12px 8px', borderRadius: 12, border: `1.5px solid ${sel ? V : '#E5E7EB'}`, background: sel ? '#FAF5FF' : '#fff', cursor: 'pointer' }}>
                <t.Icon size={20} color={sel ? V : '#6B7280'} />
                <span style={{ fontSize: 11, fontWeight: 500, color: sel ? V : '#374151' }}>{t.label}</span>
              </button>
            ); })}
          </div>
          <Btn onClick={next}>Continuar</Btn>
        </>)}

        {/* ═══ STEP 7: Goals ═════════════════════════════════════ */}
        {step === 7 && (<>
          <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 26, fontWeight: 600, color: '#2D1B4E', margin: '0 0 6px' }}>Seus objetivos</h1>
          <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 16 }}>Escolha ate 3 objetivos principais.</p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
            {GOALS.map(g => { const sel = goals.includes(g.value); return (
              <button key={g.value} onClick={() => toggleArray(goals, g.value, setGoals, 3)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', borderRadius: 12, border: `1.5px solid ${sel ? V : '#E5E7EB'}`, background: sel ? '#FAF5FF' : '#fff', cursor: 'pointer', textAlign: 'left' }}>
                <g.Icon size={18} color={sel ? V : '#6B7280'} />
                <span style={{ fontSize: 13, fontWeight: 500, color: sel ? V : '#111827' }}>{g.label}</span>
              </button>
            ); })}
          </div>

          {goals.includes('weight_loss') && (
            <div style={{ background: '#FEF3C7', borderRadius: 12, padding: '14px 16px', marginBottom: 14 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#92400E', marginBottom: 6 }}>Programa de Emagrecimento Clinico</div>
              <p style={{ fontSize: 12, color: '#92400E', lineHeight: 1.5, marginBottom: 10 }}>
                Temos um programa baseado em evidencias cientificas com calculo de TMB, macros personalizados e protocolos por comorbidade.
              </p>
              <button onClick={() => setWantsWeightLoss(!wantsWeightLoss)} style={{ ...chip(wantsWeightLoss), background: wantsWeightLoss ? '#FDE68A' : '#fff', borderColor: wantsWeightLoss ? '#D97706' : '#E5E7EB', color: wantsWeightLoss ? '#92400E' : '#374151' }}>
                <Target size={14} style={{ marginRight: 4 }} />
                {wantsWeightLoss ? 'Programa selecionado' : 'Quero participar'}
              </button>
            </div>
          )}

          <Btn onClick={next} disabled={goals.length === 0}>Continuar</Btn>
        </>)}

        {/* ═══ STEP 8: Welcome ═══════════════════════════════════ */}
        {step === 8 && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
            <div style={{ width: 96, height: 96, borderRadius: '50%', background: '#EDE9FE', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 28, animation: 'ob-orb-pulse 2s ease-in-out infinite' }}>
              <Sun size={44} color={V} strokeWidth={1.2} />
            </div>
            <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 32, fontWeight: 600, color: '#2D1B4E', margin: '0 0 12px' }}>
              {isFemale ? 'Bem-vinda ao eliaMov' : 'Bem-vindo ao eliaMov'}
            </h1>
            <p style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.8, marginBottom: 36 }}>
              {isFemale ? (<>Seu corpo.<br />Seu ritmo.<br />Sua comunidade.</>) : 'Seu painel esta pronto.'}
            </p>
            <button onClick={finish} disabled={saving} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '14px 32px', border: 'none', borderRadius: 14, background: V, color: '#fff', fontSize: 14, fontWeight: 500, cursor: 'pointer', boxShadow: '0 4px 20px rgba(124,58,237,0.2)', opacity: saving ? 0.6 : 1 }}>
              {saving ? 'Preparando...' : isFemale ? 'Comecar minha jornada' : 'Ir para meu painel'} {!saving && <ArrowRight size={16} />}
            </button>
          </div>
        )}
      </div>

      {toast && (<div style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', background: '#111827', color: '#fff', padding: '10px 20px', borderRadius: 12, fontSize: 13, fontWeight: 500, zIndex: 100 }}>{toast}</div>)}
      <style>{`@keyframes ob-orb-pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }`}</style>
    </div>
  );
}
