import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../../components/Logo';
import { useAuth, getHomeRoute } from '../../contexts/AuthContext';
import { onboardingApi } from '../../services/onboarding.api';
import api from '../../services/api';
import {
  ArrowLeft, ArrowRight, UserCircle, ClipboardList, Heart,
  Sun, ShieldCheck, Upload, Dumbbell, Target, Scale,
  Activity, Bike, PersonStanding, Waves, Footprints,
} from 'lucide-react';

/* ── Lunar Bloom palette tokens (inline for self-contained styling) ── */
const C = {
  ink: '#14161F',
  inkSoft: 'rgba(20,22,31,0.62)',
  inkMuted: 'rgba(20,22,31,0.42)',
  cream: '#F5EFE6',
  parchment: '#FDFAF3',
  creamWarm: '#EEE7DB',
  terracotta: '#D97757',
  terracottaSoft: '#E89A80',
  terracottaDeep: '#B85A3D',
  terracottaPale: '#FBEAE1',
  sage: '#9CA89A',
  brass: '#C9A977',
  oxide: '#8B3A2F',
  hairline: 'rgba(20,22,31,0.12)',
  hairlineSoft: 'rgba(20,22,31,0.08)',
};

/* ── Data configs ────────────────────────────────────────────── */
const PROFILES = [
  { value: 'female_user', label: 'Sou aluna', hint: 'Treino, ciclo e saúde feminina', Icon: UserCircle },
  { value: 'personal_trainer', label: 'Personal trainer', hint: 'Acompanhe suas alunas', Icon: ClipboardList },
];

const DISEASES = [
  'Hipertensão arterial', 'Diabetes tipo 2', 'Diabetes tipo 1', 'Pré-diabetes',
  'Colesterol alto', 'Hipotireoidismo', 'Hipertireoidismo', 'Asma',
  'SOP (Síndrome do Ovário Policístico)', 'Endometriose', 'Fibromialgia',
  'Artrite / Artrose', 'Osteoporose', 'Depressão', 'Ansiedade',
  'Doença cardiovascular', 'Nenhuma',
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
  { value: 0, label: 'Sem cólicas' },
  { value: 1, label: 'Leves' },
  { value: 2, label: 'Moderadas' },
  { value: 3, label: 'Intensas' },
  { value: 4, label: 'Incapacitantes' },
];

const PMS_SYMPTOMS = [
  'Irritabilidade', 'Inchaço', 'Dor de cabeça', 'Dor nas mamas',
  'Fadiga', 'Alteração de humor', 'Compulsão alimentar', 'Insônia',
  'Acne', 'Dor lombar', 'Náusea', 'Fogachos (ondas de calor)',
  'Suor noturno', 'Ressecamento vaginal',
];

const ACTIVITY_LEVELS = [
  { value: 'sedentary', label: 'Sedentária', desc: 'Não pratica atividade física' },
  { value: 'light', label: 'Leve', desc: '1-2x por semana' },
  { value: 'moderate', label: 'Moderada', desc: '3-4x por semana' },
  { value: 'active', label: 'Ativa', desc: '5+ vezes por semana' },
];

const EXERCISE_TYPES = [
  { value: 'strength', label: 'Musculação', Icon: Dumbbell },
  { value: 'cardio', label: 'Cardio', Icon: Activity },
  { value: 'yoga', label: 'Yoga/Pilates', Icon: PersonStanding },
  { value: 'cycling', label: 'Ciclismo', Icon: Bike },
  { value: 'swimming', label: 'Natação', Icon: Waves },
  { value: 'walking', label: 'Caminhada', Icon: Footprints },
];

const GOALS = [
  { value: 'weight_loss', label: 'Emagrecer', Icon: Scale },
  { value: 'strength', label: 'Ganhar força', Icon: Dumbbell },
  { value: 'health', label: 'Melhorar saúde', Icon: Heart },
  { value: 'conditioning', label: 'Condicionamento', Icon: Activity },
  { value: 'flexibility', label: 'Flexibilidade', Icon: PersonStanding },
  { value: 'wellbeing', label: 'Bem-estar', Icon: Sun },
];

/* ── Reusable style helpers ───────────────────────────────────── */
const field: React.CSSProperties = {
  width: '100%',
  padding: '14px 14px',
  border: `1px solid ${C.hairline}`,
  borderRadius: 2,
  fontSize: 14,
  fontFamily: "'Figtree', sans-serif",
  outline: 'none',
  boxSizing: 'border-box',
  background: C.parchment,
  color: C.ink,
  transition: 'border-color 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
};

const labelStyle: React.CSSProperties = {
  fontFamily: "'Figtree', sans-serif",
  fontSize: 11,
  fontWeight: 600,
  color: C.inkSoft,
  letterSpacing: '0.14em',
  textTransform: 'uppercase',
  display: 'block',
  marginBottom: 10,
};

const sectionLabel = (number: string, text: string): React.CSSProperties => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: 12,
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: 10,
  fontWeight: 500,
  letterSpacing: '0.3em',
  textTransform: 'uppercase',
  color: C.inkSoft,
  marginBottom: 18,
});

const titleStyle: React.CSSProperties = {
  fontFamily: "'Fraunces', serif",
  fontSize: 32,
  fontWeight: 400,
  fontVariationSettings: "'opsz' 96, 'SOFT' 40",
  letterSpacing: '-0.025em',
  color: C.ink,
  margin: '0 0 10px',
  lineHeight: 1.1,
};

const subtitleStyle: React.CSSProperties = {
  fontFamily: "'Figtree', sans-serif",
  fontSize: 14,
  color: C.inkSoft,
  margin: '0 0 28px',
  lineHeight: 1.5,
  maxWidth: 460,
};

const chip = (sel: boolean): React.CSSProperties => ({
  display: 'inline-flex',
  alignItems: 'center',
  padding: '8px 14px',
  borderRadius: 2,
  border: `1px solid ${sel ? C.ink : C.hairline}`,
  background: sel ? C.ink : 'transparent',
  color: sel ? C.cream : C.ink,
  cursor: 'pointer',
  fontSize: 12.5,
  fontFamily: "'Figtree', sans-serif",
  fontWeight: 500,
  letterSpacing: '0.01em',
  transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
});

const selectableCard = (sel: boolean, extra: React.CSSProperties = {}): React.CSSProperties => ({
  background: sel ? C.ink : C.parchment,
  color: sel ? C.cream : C.ink,
  border: `1px solid ${sel ? C.ink : C.hairline}`,
  borderRadius: 2,
  padding: 16,
  cursor: 'pointer',
  textAlign: 'left',
  transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
  fontFamily: "'Figtree', sans-serif",
  ...extra,
});

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

  const isFemale = profileType === 'female_user';
  const totalSteps = isFemale ? 8 : 2;
  const currentStep = isFemale ? step : (step === 1 ? 1 : 2);

  const saveStep = async (n: number, data: Record<string, any>) => {
    try { await onboardingApi.saveStep(n, data); } catch { /* continue */ }
  };

  const toggleArray = (arr: string[], val: string, set: (v: string[]) => void, max?: number) => {
    if (arr.includes(val)) set(arr.filter(x => x !== val));
    else if (!max || arr.length < max) set([...arr, val]);
    else { setToast(`Máximo ${max} opções`); setTimeout(() => setToast(''), 2000); }
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
    <button
      onClick={onClick}
      disabled={disabled || saving}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        width: '100%',
        padding: 18,
        border: 'none',
        borderRadius: 2,
        background: (disabled || saving) ? 'rgba(20,22,31,0.4)' : C.ink,
        color: C.cream,
        fontSize: 13,
        fontWeight: 600,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        fontFamily: "'Figtree', sans-serif",
        cursor: (disabled || saving) ? 'default' : 'pointer',
        marginTop: 24,
        transition: 'background 0.3s ease',
      }}
      onMouseEnter={(e) => { if (!disabled && !saving) (e.currentTarget as HTMLElement).style.background = C.terracotta; }}
      onMouseLeave={(e) => { if (!disabled && !saving) (e.currentTarget as HTMLElement).style.background = C.ink; }}
    >
      {saving ? 'Salvando…' : children} {!saving && <ArrowRight size={14} />}
    </button>
  );

  return (
    <div
      style={{
        minHeight: '100vh',
        background: C.cream,
        fontFamily: "'Figtree', sans-serif",
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <style>{`
        @keyframes ob-orb-pulse {
          0%, 100% { transform: scale(1); opacity: 0.9; }
          50%      { transform: scale(1.06); opacity: 1; }
        }
        @keyframes ob-sweep {
          0%   { transform: scaleX(0); opacity: 0.9; }
          60%  { transform: scaleX(1); opacity: 0.9; }
          100% { transform: scaleX(1); opacity: 0; }
        }
        @keyframes ob-fade-up {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .ob-v2-step { animation: ob-fade-up 0.5s cubic-bezier(0.16,1,0.3,1) both; }
        .ob-v2-range {
          width: 100%;
          accent-color: ${C.ink};
        }
        .ob-v2-field:focus { border-color: ${C.ink} !important; background: #FFFCF5 !important; }
        @media (prefers-reduced-motion: reduce) {
          .ob-v2-step { animation: none; }
          .ob-v2-sweep { animation: none !important; transform: scaleX(1); opacity: 0.5; }
        }
      `}</style>

      <input ref={fileRef} type="file" accept="image/*,.pdf" style={{ display: 'none' }} onChange={handleFileUpload} />

      {/* Top bar */}
      {step < 8 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '20px 28px 12px',
            maxWidth: 640,
            width: '100%',
            margin: '0 auto',
          }}
        >
          <button
            onClick={prev}
            disabled={step === 1}
            aria-label="Voltar"
            style={{
              background: 'none',
              border: '1px solid transparent',
              cursor: step > 1 ? 'pointer' : 'default',
              color: step > 1 ? C.ink : C.inkMuted,
              padding: 8,
              transition: 'border-color 0.25s',
            }}
            onMouseEnter={(e) => { if (step > 1) (e.currentTarget as HTMLElement).style.borderColor = C.hairline; }}
            onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.borderColor = 'transparent'}
          >
            <ArrowLeft size={18} />
          </button>
          <Logo size={22} variant="dark" />
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 10,
              letterSpacing: '0.28em',
              textTransform: 'uppercase',
              color: C.inkSoft,
            }}
          >
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: C.terracotta }} />
            {String(currentStep).padStart(2, '0')} / {String(totalSteps).padStart(2, '0')}
          </div>
        </div>
      )}

      {/* Progress bars */}
      {step < 8 && (
        <div
          style={{
            display: 'grid',
            gridAutoFlow: 'column',
            gridAutoColumns: '1fr',
            gap: 6,
            padding: '4px 28px 24px',
            maxWidth: 640,
            width: '100%',
            margin: '0 auto',
          }}
        >
          {Array.from({ length: totalSteps }, (_, i) => {
            const done = i < currentStep - 1;
            const active = i === currentStep - 1;
            return (
              <div key={i} style={{ position: 'relative', height: 2, background: done ? C.ink : 'rgba(20,22,31,0.1)', transition: 'background 0.4s cubic-bezier(0.16,1,0.3,1)' }}>
                {active && (
                  <div
                    className="ob-v2-sweep"
                    style={{
                      position: 'absolute',
                      inset: '-1px 0',
                      background: C.terracotta,
                      animation: 'ob-sweep 1.8s cubic-bezier(0.65,0,0.35,1) infinite',
                      transformOrigin: 'left center',
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}

      <div
        style={{
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
          padding: step === 8 ? '40px 24px' : 'clamp(16px, 3vw, 32px) 24px 48px',
        }}
      >
        <div style={{ width: '100%', maxWidth: 560 }} className="ob-v2-step" key={step}>

          {/* ═══ STEP 1: Profile Type ══════════════════════════════ */}
          {step === 1 && (<>
            <div style={sectionLabel('01', 'Bem-vinda')}>
              <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>01</span>
              <span style={{ width: 32, height: 1, background: C.hairline }} />
              Bem-vinda
            </div>
            <h1 style={titleStyle}>Como você vai usar o <span style={{ fontStyle: 'italic', color: C.terracottaDeep }}>elia</span>?</h1>
            <p style={subtitleStyle}>Escolha o perfil que melhor descreve você.</p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {PROFILES.map(p => {
                const sel = profileType === p.value;
                return (
                  <button key={p.value} onClick={() => setProfileType(p.value)} style={selectableCard(sel, { padding: 20 })}>
                    <p.Icon size={20} color={sel ? C.terracotta : C.inkSoft} />
                    <div style={{ fontSize: 15, fontWeight: 600, marginTop: 14, letterSpacing: '-0.005em' }}>{p.label}</div>
                    <div style={{ fontSize: 12, color: sel ? 'rgba(245,239,230,0.65)' : C.inkSoft, marginTop: 4 }}>{p.hint}</div>
                  </button>
                );
              })}
            </div>
            <Btn onClick={next}>Continuar</Btn>
          </>)}

          {/* ═══ STEP 2: Personal Data ═════════════════════════════ */}
          {step === 2 && (<>
            <div style={sectionLabel('02', 'Dados pessoais')}>
              <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>02</span>
              <span style={{ width: 32, height: 1, background: C.hairline }} />
              Dados pessoais
            </div>
            <h1 style={titleStyle}>Conte um pouco sobre você.</h1>
            <p style={subtitleStyle}>Usamos esses dados para calibrar cargas, metas e métricas.</p>

            <div style={{ marginBottom: 18 }}>
              <label style={labelStyle}>Data de nascimento</label>
              <input className="ob-v2-field" type="date" value={birthDate} onChange={e => setBirthDate(e.target.value)} style={field} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 18 }}>
              <div>
                <label style={labelStyle}>Peso (kg)</label>
                <input className="ob-v2-field" type="number" min={30} max={300} step={0.1} value={weight} onChange={e => setWeight(e.target.value)} placeholder="Ex: 65" style={field} />
              </div>
              <div>
                <label style={labelStyle}>Altura (cm)</label>
                <input className="ob-v2-field" type="number" min={100} max={250} value={height} onChange={e => setHeight(e.target.value)} placeholder="Ex: 165" style={field} />
              </div>
            </div>
            {weight && height && (
              <div
                style={{
                  background: C.terracottaPale,
                  borderLeft: `2px solid ${C.terracotta}`,
                  padding: '14px 16px',
                  marginBottom: 18,
                  fontFamily: "'Figtree', sans-serif",
                  fontSize: 13,
                  color: C.ink,
                  display: 'flex',
                  alignItems: 'baseline',
                  justifyContent: 'space-between',
                }}
              >
                <span>IMC</span>
                <strong style={{ fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 450, letterSpacing: '-0.02em' }}>
                  {(Number(weight) / Math.pow(Number(height) / 100, 2)).toFixed(1)}
                </strong>
              </div>
            )}
            <Btn onClick={next} disabled={!birthDate || !weight || !height}>Continuar</Btn>
          </>)}

          {/* ═══ STEP 3: Medical History ════════════════════════════ */}
          {step === 3 && (<>
            <div style={sectionLabel('03', 'Histórico de saúde')}>
              <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>03</span>
              <span style={{ width: 32, height: 1, background: C.hairline }} />
              Histórico de saúde
            </div>
            <h1 style={titleStyle}>Alguma condição de saúde?</h1>
            <p style={subtitleStyle}>Selecione condições que você tem ou já teve. Influenciam os protocolos recomendados.</p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
              {DISEASES.map(d => (
                <button key={d} onClick={() => toggleArray(diseases, d, setDiseases)} style={chip(diseases.includes(d))}>
                  {d}
                </button>
              ))}
            </div>
            <div style={{ marginBottom: 18 }}>
              <label style={labelStyle}>Medicamentos em uso (opcional)</label>
              <textarea
                value={medications}
                onChange={e => setMedications(e.target.value)}
                placeholder="Ex: Levotiroxina 50mcg, Losartana 50mg…"
                rows={3}
                className="ob-v2-field"
                style={{ ...field, resize: 'vertical', padding: 14, lineHeight: 1.5 }}
              />
            </div>
            <Btn onClick={next}>Continuar</Btn>
          </>)}

          {/* ═══ STEP 4: Injuries ══════════════════════════════════ */}
          {step === 4 && (<>
            <div style={sectionLabel('04', 'Lesões prévias')}>
              <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>04</span>
              <span style={{ width: 32, height: 1, background: C.hairline }} />
              Lesões prévias
            </div>
            <h1 style={titleStyle}>Alguma articulação ou região com histórico?</h1>
            <p style={subtitleStyle}>Adaptamos exercícios para evitar contraindicações.</p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
              {INJURY_AREAS.map(a => (
                <button key={a} onClick={() => toggleArray(injuries, a, setInjuries)} style={chip(injuries.includes(a))}>
                  {a}
                </button>
              ))}
            </div>
            {injuries.length > 0 && (
              <div style={{ marginBottom: 18 }}>
                <label style={labelStyle}>Descreva a lesão</label>
                <textarea
                  value={injuryDetail}
                  onChange={e => setInjuryDetail(e.target.value)}
                  placeholder="Ex: Ruptura de LCA joelho direito, operada em 2023…"
                  rows={3}
                  className="ob-v2-field"
                  style={{ ...field, resize: 'vertical', padding: 14, lineHeight: 1.5 }}
                />
              </div>
            )}
            <div style={{ marginBottom: 18 }}>
              <label style={labelStyle}>Upload de exame (opcional)</label>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '10px 16px',
                    borderRadius: 2,
                    border: `1px solid ${C.hairline}`,
                    background: 'transparent',
                    cursor: 'pointer',
                    fontSize: 12,
                    fontFamily: "'Figtree', sans-serif",
                    fontWeight: 500,
                    color: C.ink,
                    letterSpacing: '0.02em',
                    transition: 'border-color 0.25s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.borderColor = C.terracotta}
                  onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.borderColor = C.hairline}
                >
                  <Upload size={14} /> Escolher arquivo
                </button>
                {injuryFileUrl && (
                  <span style={{ fontSize: 12, color: C.terracottaDeep, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.1em' }}>
                    ● ANEXADO
                  </span>
                )}
              </div>
            </div>
            <Btn onClick={next}>Continuar</Btn>
          </>)}

          {/* ═══ STEP 5: Menstrual Cycle ═══════════════════════════ */}
          {step === 5 && (<>
            <div style={sectionLabel('05', 'Ciclo menstrual')}>
              <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>05</span>
              <span style={{ width: 32, height: 1, background: C.hairline }} />
              Ciclo menstrual
            </div>
            <h1 style={titleStyle}>Seu <span style={{ fontStyle: 'italic', color: C.terracottaDeep }}>ritmo</span> em detalhes.</h1>
            <p style={subtitleStyle}>Essas informações sincronizam treino, nutrição e saúde mental ao seu ciclo.</p>

            <div style={{ marginBottom: 22 }}>
              <label style={labelStyle}>Status do ciclo</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {CYCLE_STATUS.map(s => (
                  <button key={s.value} onClick={() => setCycleStatus(s.value)} style={selectableCard(cycleStatus === s.value, { padding: '12px 16px' })}>
                    <span style={{ fontSize: 14, fontWeight: 500 }}>{s.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {(cycleStatus === 'regular' || cycleStatus === 'irregular') && (<>
              <div style={{ marginBottom: 22 }}>
                <label style={labelStyle}>Último período</label>
                <input className="ob-v2-field" type="date" value={lastPeriod} onChange={e => setLastPeriod(e.target.value)} style={field} />
              </div>
              <div style={{ marginBottom: 22 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
                  <label style={labelStyle}>Duração do ciclo</label>
                  <strong style={{ fontFamily: "'Fraunces', serif", fontSize: 20, fontWeight: 450, letterSpacing: '-0.02em', color: C.ink }}>
                    {cycleLength} <span style={{ fontSize: 12, fontFamily: "'Figtree', sans-serif", color: C.inkSoft, letterSpacing: '0.1em' }}>DIAS</span>
                  </strong>
                </div>
                <input type="range" min={21} max={45} value={cycleLength} onChange={e => setCycleLength(Number(e.target.value))} className="ob-v2-range" />
              </div>
              <div style={{ marginBottom: 22 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
                  <label style={labelStyle}>Duração do período</label>
                  <strong style={{ fontFamily: "'Fraunces', serif", fontSize: 20, fontWeight: 450, letterSpacing: '-0.02em', color: C.ink }}>
                    {periodLength} <span style={{ fontSize: 12, fontFamily: "'Figtree', sans-serif", color: C.inkSoft, letterSpacing: '0.1em' }}>DIAS</span>
                  </strong>
                </div>
                <input type="range" min={2} max={10} value={periodLength} onChange={e => setPeriodLength(Number(e.target.value))} className="ob-v2-range" />
              </div>
            </>)}

            <div style={{ marginBottom: 22 }}>
              <label style={labelStyle}>Intensidade das cólicas</label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {CRAMP_LEVELS.map(c => (
                  <button key={c.value} onClick={() => setCrampLevel(c.value)} style={chip(crampLevel === c.value)}>
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 22 }}>
              <label style={labelStyle}>Sintomas pré-menstruais ou climatéricos</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {PMS_SYMPTOMS.map(s => (
                  <button key={s} onClick={() => toggleArray(pmsSymptoms, s, setPmsSymptoms)} style={chip(pmsSymptoms.includes(s))}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 12,
                background: C.terracottaPale,
                borderLeft: `2px solid ${C.terracotta}`,
                padding: '14px 16px',
                marginBottom: 18,
              }}
            >
              <ShieldCheck size={14} color={C.terracottaDeep} style={{ flexShrink: 0, marginTop: 2 }} />
              <span style={{ fontSize: 12, color: C.ink, lineHeight: 1.55 }}>
                Essas informações são privadas e nunca serão compartilhadas com seu personal trainer ou gestor.
              </span>
            </div>
            <Btn onClick={next}>Continuar</Btn>
          </>)}

          {/* ═══ STEP 6: Activity Level ════════════════════════════ */}
          {step === 6 && (<>
            <div style={sectionLabel('06', 'Nível de atividade')}>
              <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>06</span>
              <span style={{ width: 32, height: 1, background: C.hairline }} />
              Nível de atividade
            </div>
            <h1 style={titleStyle}>Como é a sua rotina hoje?</h1>
            <p style={subtitleStyle}>Queremos começar do ponto certo — nem aquém nem além do que o corpo está pronto.</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
              {ACTIVITY_LEVELS.map(l => {
                const sel = activityLevel === l.value;
                return (
                  <button key={l.value} onClick={() => setActivityLevel(l.value)} style={selectableCard(sel, { padding: '14px 18px' })}>
                    <div style={{ fontSize: 15, fontWeight: 600, letterSpacing: '-0.005em' }}>{l.label}</div>
                    <div style={{ fontSize: 12.5, color: sel ? 'rgba(245,239,230,0.65)' : C.inkSoft, marginTop: 2 }}>{l.desc}</div>
                  </button>
                );
              })}
            </div>

            <label style={labelStyle}>Tipos de exercício que mais interessam</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 18 }}>
              {EXERCISE_TYPES.map(t => {
                const sel = exerciseTypes.includes(t.value);
                return (
                  <button
                    key={t.value}
                    onClick={() => toggleArray(exerciseTypes, t.value, setExerciseTypes)}
                    style={{
                      ...selectableCard(sel, { padding: '16px 8px' }),
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 8,
                      textAlign: 'center',
                    }}
                  >
                    <t.Icon size={20} color={sel ? C.terracotta : C.inkSoft} />
                    <span style={{ fontSize: 11.5, fontWeight: 500, letterSpacing: '0.02em' }}>{t.label}</span>
                  </button>
                );
              })}
            </div>
            <Btn onClick={next}>Continuar</Btn>
          </>)}

          {/* ═══ STEP 7: Goals ═════════════════════════════════════ */}
          {step === 7 && (<>
            <div style={sectionLabel('07', 'Objetivos')}>
              <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>07</span>
              <span style={{ width: 32, height: 1, background: C.hairline }} />
              Objetivos
            </div>
            <h1 style={titleStyle}>O que você quer <span style={{ fontStyle: 'italic', color: C.terracottaDeep }}>conquistar</span>?</h1>
            <p style={subtitleStyle}>Escolha até três. A plataforma ajusta o plano semanal ao que você prioriza.</p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
              {GOALS.map(g => {
                const sel = goals.includes(g.value);
                return (
                  <button
                    key={g.value}
                    onClick={() => toggleArray(goals, g.value, setGoals, 3)}
                    style={{
                      ...selectableCard(sel, { padding: '14px 16px' }),
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                    }}
                  >
                    <g.Icon size={18} color={sel ? C.terracotta : C.inkSoft} />
                    <span style={{ fontSize: 14, fontWeight: 500 }}>{g.label}</span>
                  </button>
                );
              })}
            </div>

            {goals.includes('weight_loss') && (
              <div
                style={{
                  background: C.parchment,
                  borderLeft: `2px solid ${C.brass}`,
                  padding: '18px 20px',
                  marginBottom: 18,
                }}
              >
                <div
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 10,
                    letterSpacing: '0.28em',
                    textTransform: 'uppercase',
                    color: C.brass,
                    marginBottom: 10,
                  }}
                >
                  ● Programa clínico
                </div>
                <div style={{ fontFamily: "'Fraunces', serif", fontSize: 18, fontWeight: 450, letterSpacing: '-0.015em', marginBottom: 8, color: C.ink }}>
                  Emagrecimento baseado em evidência
                </div>
                <p style={{ fontSize: 12.5, color: C.inkSoft, lineHeight: 1.55, marginBottom: 14 }}>
                  TMB calculado, macros personalizados, protocolos por comorbidade — acompanhamento semanal.
                </p>
                <button
                  onClick={() => setWantsWeightLoss(!wantsWeightLoss)}
                  style={{
                    ...chip(wantsWeightLoss),
                    background: wantsWeightLoss ? C.brass : 'transparent',
                    borderColor: wantsWeightLoss ? C.brass : C.hairline,
                    color: wantsWeightLoss ? C.ink : C.ink,
                    gap: 8,
                    fontWeight: 600,
                  }}
                >
                  <Target size={13} />
                  {wantsWeightLoss ? 'Programa selecionado' : 'Quero participar'}
                </button>
              </div>
            )}

            <Btn onClick={next} disabled={goals.length === 0}>Continuar</Btn>
          </>)}

          {/* ═══ STEP 8: Welcome ═══════════════════════════════════ */}
          {step === 8 && (
            <div
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                padding: '40px 0',
                minHeight: 'calc(100vh - 100px)',
              }}
            >
              {/* Orb */}
              <div
                style={{
                  position: 'relative',
                  width: 128,
                  height: 128,
                  marginBottom: 40,
                  animation: 'ob-orb-pulse 2.8s ease-in-out infinite',
                }}
              >
                <div
                  aria-hidden
                  style={{
                    position: 'absolute',
                    inset: -24,
                    borderRadius: '50%',
                    background: `radial-gradient(closest-side, ${C.terracotta}33, transparent 70%)`,
                    filter: 'blur(20px)',
                  }}
                />
                <div
                  style={{
                    position: 'relative',
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    background: C.ink,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: `1px solid ${C.terracotta}`,
                  }}
                >
                  <Sun size={48} color={C.terracotta} strokeWidth={1.2} />
                </div>
              </div>

              <div
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 11,
                  letterSpacing: '0.3em',
                  textTransform: 'uppercase',
                  color: C.terracotta,
                  marginBottom: 18,
                }}
              >
                ● Você está pronta
              </div>

              <h1
                style={{
                  fontFamily: "'Fraunces', serif",
                  fontSize: 'clamp(2.2rem, 5vw, 3.4rem)',
                  fontWeight: 400,
                  fontVariationSettings: "'opsz' 144, 'SOFT' 60",
                  letterSpacing: '-0.03em',
                  color: C.ink,
                  margin: '0 0 24px',
                  lineHeight: 1.0,
                  maxWidth: 560,
                }}
              >
                {isFemale ? (
                  <>Bem-vinda ao <span style={{ fontStyle: 'italic', color: C.terracottaDeep }}>elia</span>.</>
                ) : (
                  <>Seu painel está <span style={{ fontStyle: 'italic', color: C.terracottaDeep }}>pronto</span>.</>
                )}
              </h1>

              <p
                style={{
                  fontFamily: "'Fraunces', serif",
                  fontSize: 20,
                  fontWeight: 400,
                  fontStyle: 'italic',
                  color: C.inkSoft,
                  lineHeight: 1.55,
                  margin: '0 0 48px',
                  maxWidth: 420,
                }}
              >
                {isFemale ? (<>Seu corpo.<br />Seu ritmo.<br />Sua comunidade.</>) : 'Acompanhe suas alunas em ritmo científico.'}
              </p>

              <button
                onClick={finish}
                disabled={saving}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                  padding: '20px 44px',
                  border: 'none',
                  borderRadius: 2,
                  background: saving ? 'rgba(20,22,31,0.5)' : C.ink,
                  color: C.cream,
                  fontSize: 13,
                  fontWeight: 600,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  fontFamily: "'Figtree', sans-serif",
                  cursor: saving ? 'default' : 'pointer',
                  transition: 'background 0.3s ease',
                }}
                onMouseEnter={(e) => { if (!saving) (e.currentTarget as HTMLElement).style.background = C.terracotta; }}
                onMouseLeave={(e) => { if (!saving) (e.currentTarget as HTMLElement).style.background = C.ink; }}
              >
                {saving ? 'Preparando…' : isFemale ? 'Começar minha jornada' : 'Ir para meu painel'}
                {!saving && <ArrowRight size={14} />}
              </button>
            </div>
          )}

        </div>
      </div>

      {toast && (
        <div
          style={{
            position: 'fixed',
            bottom: 28,
            left: '50%',
            transform: 'translateX(-50%)',
            background: C.ink,
            color: C.cream,
            padding: '14px 24px',
            borderRadius: 2,
            fontSize: 12,
            fontWeight: 500,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            fontFamily: "'Figtree', sans-serif",
            zIndex: 100,
            border: `1px solid ${C.terracotta}`,
          }}
        >
          {toast}
        </div>
      )}
    </div>
  );
}
