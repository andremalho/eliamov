import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../../components/Logo';
import {
  ArrowLeft,
  ArrowRight,
  UserCircle,
  ClipboardList,
  Heart,
  Building2,
  Flame,
  Zap,
  Activity,
  Wind,
  Smile,
  ShieldCheck,
  Sun,
} from 'lucide-react';

/* ── palette ─────────────────────────────────────────────────── */
const V = '#7C3AED';
const PINK = '#F472B6';

/* ── profile cards config ────────────────────────────────────── */
const PROFILES = [
  { value: 'female_user', label: 'Sou aluna', hint: 'Treino, ciclo e saude feminina', Icon: UserCircle, iconColor: '#7C3AED', iconBg: '#EDE9FE' },
  { value: 'personal_trainer', label: 'Personal trainer', hint: 'Acompanhe suas alunas', Icon: ClipboardList, iconColor: '#16A34A', iconBg: '#F0FDF4' },
  { value: 'family_companion', label: 'Familiar', hint: 'Acompanhe quem voce ama', Icon: Heart, iconColor: '#DB2777', iconBg: '#FDF2F8' },
  { value: 'academy_admin', label: 'Gestor de academia', hint: 'Gerencie sua academia', Icon: Building2, iconColor: '#1D4ED8', iconBg: '#EFF6FF' },
];

/* ── goals config ────────────────────────────────────────────── */
const GOALS = [
  { value: 'weight_loss', label: 'Emagrecer', Icon: Flame, iconColor: '#92400E', iconBg: '#FEF3C7' },
  { value: 'strength', label: 'Ganhar forca', Icon: Zap, iconColor: '#7C3AED', iconBg: '#EDE9FE' },
  { value: 'health', label: 'Melhorar saude', Icon: Heart, iconColor: '#DB2777', iconBg: '#FDF2F8' },
  { value: 'conditioning', label: 'Condicionamento', Icon: Activity, iconColor: '#16A34A', iconBg: '#DCFCE7' },
  { value: 'stress', label: 'Reduzir estresse', Icon: Wind, iconColor: '#16A34A', iconBg: '#F0FDF4' },
  { value: 'reproductive', label: 'Saude reprodutiva', Icon: Smile, iconColor: '#DB2777', iconBg: '#FDF2F8' },
];

/* ── component ───────────────────────────────────────────────── */
export default function OnboardingFlow() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [profileType, setProfileType] = useState('female_user');
  const [goals, setGoals] = useState<string[]>([]);
  const [cycleDate, setCycleDate] = useState('');
  const [cycleLength, setCycleLength] = useState(28);
  const [periodLength, setPeriodLength] = useState(5);
  const [toast, setToast] = useState('');

  const isFemale = profileType === 'female_user';
  const totalSteps = isFemale ? 4 : 2; // non-female: step1 + step4 (welcome)

  const nextStep = () => {
    if (step === 1 && !isFemale) { setStep(4); return; }
    if (step === 1) { setStep(2); return; }
    if (step === 2) { setStep(3); return; }
    if (step === 3) { setStep(4); return; }
  };

  const prevStep = () => {
    if (step === 4 && !isFemale) { setStep(1); return; }
    if (step === 4) { setStep(3); return; }
    setStep(step - 1);
  };

  const toggleGoal = (g: string) => {
    if (goals.includes(g)) {
      setGoals(goals.filter((x) => x !== g));
    } else if (goals.length >= 3) {
      setToast('Maximo de 3 objetivos');
      setTimeout(() => setToast(''), 2000);
    } else {
      setGoals([...goals, g]);
    }
  };

  const progressDots = isFemale ? 4 : 2;
  const progressIndex = isFemale
    ? step - 1
    : step === 1 ? 0 : 1;

  return (
    <div style={{
      maxWidth: 430, margin: '0 auto', background: '#F9FAFB', minHeight: '100vh',
      fontFamily: "'DM Sans', sans-serif", display: 'flex', flexDirection: 'column',
    }}>
      {/* ── Top bar ──────────────────────────────────────────────── */}
      {step < 4 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px' }}>
          <button
            onClick={prevStep}
            disabled={step === 1}
            style={{
              background: 'none', border: 'none', cursor: step > 1 ? 'pointer' : 'default',
              color: step > 1 ? '#6B7280' : '#E5E7EB', padding: 4,
            }}
          >
            <ArrowLeft size={20} />
          </button>
          <Logo size={22} variant="dark" />
          <div style={{ width: 20 }} />
        </div>
      )}

      {/* ── Progress bar ─────────────────────────────────────────── */}
      {step < 4 && (
        <div style={{ display: 'flex', gap: 6, padding: '0 40px 20px' }}>
          {Array.from({ length: progressDots }, (_, i) => (
            <div key={i} style={{
              flex: 1, height: 4, borderRadius: 99,
              background: i < progressIndex ? V : i === progressIndex ? PINK : '#E5E7EB',
              transition: 'background 0.3s',
            }} />
          ))}
        </div>
      )}

      {/* ── Content ──────────────────────────────────────────────── */}
      <div style={{ flex: 1, padding: step === 4 ? 0 : '0 20px 40px', display: 'flex', flexDirection: 'column' }}>

        {/* ═══ STEP 1: Profile type ═══════════════════════════════ */}
        {step === 1 && (
          <>
            <div style={{ fontSize: 11, fontWeight: 500, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8 }}>
              BEM-VINDA
            </div>
            <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 600, color: '#2D1B4E', margin: '0 0 6px', lineHeight: 1.2 }}>
              Como voce vai usar o eliaMov?
            </h1>
            <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 24 }}>
              Escolha o perfil que melhor descreve voce.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 24 }}>
              {PROFILES.map((p) => {
                const sel = profileType === p.value;
                return (
                  <button key={p.value} onClick={() => setProfileType(p.value)} style={{
                    background: sel ? '#FAF5FF' : '#fff',
                    border: `1.5px solid ${sel ? V : '#E5E7EB'}`,
                    borderRadius: 16, padding: 16, cursor: 'pointer', textAlign: 'left',
                    transform: sel ? 'scale(1.02)' : 'scale(1)', transition: 'all 0.15s',
                  }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 12, background: p.iconBg,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10,
                    }}>
                      <p.Icon size={22} color={p.iconColor} />
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{p.label}</div>
                    <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>{p.hint}</div>
                  </button>
                );
              })}
            </div>

            <button onClick={nextStep} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              width: '100%', padding: 14, border: 'none', borderRadius: 14,
              background: V, color: '#fff', fontSize: 14, fontWeight: 500, cursor: 'pointer',
            }}>
              Continuar <ArrowRight size={16} />
            </button>
          </>
        )}

        {/* ═══ STEP 2: Goals ═════════════════════════════════════ */}
        {step === 2 && (
          <>
            <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 600, color: '#2D1B4E', margin: '0 0 6px' }}>
              O que voce busca?
            </h1>
            <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 24 }}>
              Escolha ate 3 objetivos.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 24 }}>
              {GOALS.map((g) => {
                const sel = goals.includes(g.value);
                return (
                  <button key={g.value} onClick={() => toggleGoal(g.value)} style={{
                    background: sel ? '#FAF5FF' : '#fff',
                    border: `1.5px solid ${sel ? V : '#E5E7EB'}`,
                    borderRadius: 14, padding: 14, cursor: 'pointer', textAlign: 'left',
                    display: 'flex', alignItems: 'center', gap: 10, transition: 'all 0.15s',
                  }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 10, background: g.iconBg,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      <g.Icon size={18} color={g.iconColor} />
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 500, color: '#111827' }}>{g.label}</span>
                  </button>
                );
              })}
            </div>

            <button onClick={nextStep} disabled={goals.length === 0} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              width: '100%', padding: 14, border: 'none', borderRadius: 14,
              background: goals.length > 0 ? V : '#E5E7EB',
              color: goals.length > 0 ? '#fff' : '#9CA3AF',
              fontSize: 14, fontWeight: 500, cursor: goals.length > 0 ? 'pointer' : 'default',
            }}>
              Continuar <ArrowRight size={16} />
            </button>
          </>
        )}

        {/* ═══ STEP 3: Cycle ═════════════════════════════════════ */}
        {step === 3 && (
          <>
            <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 600, color: '#2D1B4E', margin: '0 0 6px' }}>
              Sincronize seu treino com seu corpo.
            </h1>
            <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 24 }}>
              Esses dados personalizam seu plano hormonal.
            </p>

            {/* Last period */}
            <label style={{ display: 'block', marginBottom: 18 }}>
              <span style={{ fontSize: 13, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 6 }}>
                Quando foi seu ultimo periodo?
              </span>
              <input
                type="date"
                value={cycleDate}
                onChange={(e) => setCycleDate(e.target.value)}
                style={{
                  width: '100%', padding: '12px 14px', border: '1.5px solid #E5E7EB',
                  borderRadius: 12, fontSize: 14, fontFamily: "'DM Sans', sans-serif",
                  outline: 'none',
                }}
                onFocus={(e) => { e.target.style.borderColor = V; }}
                onBlur={(e) => { e.target.style.borderColor = '#E5E7EB'; }}
              />
            </label>

            {/* Cycle length slider */}
            <div style={{ marginBottom: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 500, color: '#374151' }}>Duracao do ciclo (dias)</span>
                <span style={{ fontSize: 15, fontWeight: 700, color: V }}>{cycleLength}</span>
              </div>
              <input
                type="range" min={21} max={35} step={1} value={cycleLength}
                onChange={(e) => setCycleLength(Number(e.target.value))}
                style={{ width: '100%', accentColor: V }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#9CA3AF' }}>
                <span>21</span><span>35</span>
              </div>
            </div>

            {/* Period length slider */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 500, color: '#374151' }}>Duracao do periodo (dias)</span>
                <span style={{ fontSize: 15, fontWeight: 700, color: V }}>{periodLength}</span>
              </div>
              <input
                type="range" min={3} max={7} step={1} value={periodLength}
                onChange={(e) => setPeriodLength(Number(e.target.value))}
                style={{ width: '100%', accentColor: V }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#9CA3AF' }}>
                <span>3</span><span>7</span>
              </div>
            </div>

            {/* Privacy notice */}
            <div style={{
              display: 'flex', alignItems: 'flex-start', gap: 8,
              background: '#FAF5FF', borderRadius: 10, padding: '10px 12px', marginBottom: 20,
            }}>
              <ShieldCheck size={14} color={V} style={{ flexShrink: 0, marginTop: 1 }} />
              <span style={{ fontSize: 11, color: V, lineHeight: 1.5 }}>
                Essas informacoes sao privadas e nunca serao compartilhadas com seu personal trainer ou gestor da academia.
              </span>
            </div>

            <button onClick={nextStep} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              width: '100%', padding: 14, border: 'none', borderRadius: 14,
              background: V, color: '#fff', fontSize: 14, fontWeight: 500, cursor: 'pointer',
            }}>
              Continuar <ArrowRight size={16} />
            </button>
          </>
        )}

        {/* ═══ STEP 4: Welcome ═══════════════════════════════════ */}
        {step === 4 && (
          <div style={{
            flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', padding: '40px 24px', textAlign: 'center',
          }}>
            {/* Animated orb */}
            <div style={{
              width: 96, height: 96, borderRadius: '50%', background: '#EDE9FE',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: 28, animation: 'ob-orb-pulse 2s ease-in-out infinite',
            }}>
              <Sun size={44} color={V} strokeWidth={1.2} />
            </div>

            <h1 style={{
              fontFamily: "'Cormorant Garamond', serif", fontSize: 32, fontWeight: 600,
              color: '#2D1B4E', margin: '0 0 12px',
            }}>
              {isFemale ? 'Bem-vinda ao eliaMov' : 'Bem-vindo ao eliaMov'}
            </h1>

            <p style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.8, marginBottom: 36 }}>
              {isFemale ? (
                <>Seu corpo.<br />Seu ritmo.<br />Sua comunidade.</>
              ) : (
                'Seu painel esta pronto.'
              )}
            </p>

            <button onClick={() => navigate(isFemale ? '/home' : '/trainer')} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              padding: '14px 32px', border: 'none', borderRadius: 14,
              background: V, color: '#fff', fontSize: 14, fontWeight: 500, cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(124,58,237,0.2)',
            }}>
              {isFemale ? 'Comecar minha jornada' : 'Ir para meu painel'}
              <ArrowRight size={16} />
            </button>
          </div>
        )}
      </div>

      {/* ── Toast ────────────────────────────────────────────────── */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
          background: '#111827', color: '#fff', padding: '10px 20px', borderRadius: 12,
          fontSize: 13, fontWeight: 500, zIndex: 100,
          boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
        }}>
          {toast}
        </div>
      )}

      {/* ── Inline keyframes ─────────────────────────────────────── */}
      <style>{`
        @keyframes ob-orb-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
      `}</style>
    </div>
  );
}
