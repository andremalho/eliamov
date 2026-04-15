import React, { useEffect, useState, useRef } from 'react';
import {
  trainingEngineApi,
  TodayWorkout,
  WorkoutTemplate,
  WorkoutExercise,
  workoutLogApi,
} from '../services/training-engine.api';
import { useGamification } from '../contexts/GamificationContext';
import Layout from '../components/Layout';
import {
  Dumbbell,
  Clock,
  Flame,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Play,
  Pause,
  RotateCcw,
  Check,
  CheckCircle,
  Trophy,
  Shield,
  Droplets,
  Sprout,
  Sun,
  Moon,
} from 'lucide-react';

/* ───── phase config ───── */

const PHASE_CONFIG: Record<
  string,
  { color: string; label: string; icon: React.ElementType; gradient: string }
> = {
  menstrual: {
    color: '#F472B6',
    label: 'Menstrual',
    icon: Droplets,
    gradient: 'linear-gradient(135deg, #F472B626, #F472B60D)',
  },
  follicular: {
    color: '#22C55E',
    label: 'Folicular',
    icon: Sprout,
    gradient: 'linear-gradient(135deg, #22C55E26, #22C55E0D)',
  },
  ovulatory: {
    color: '#F59E0B',
    label: 'Ovulatoria',
    icon: Sun,
    gradient: 'linear-gradient(135deg, #F59E0B26, #F59E0B0D)',
  },
  luteal: {
    color: '#F97316',
    label: 'Lutea',
    icon: Moon,
    gradient: 'linear-gradient(135deg, #F9731626, #F973160D)',
  },
};

const PHASE_ORDER = ['menstrual', 'follicular', 'ovulatory', 'luteal'] as const;

/* ───── shared inline styles ───── */

const card: React.CSSProperties = {
  background: '#fff',
  borderRadius: 16,
  padding: 20,
  marginBottom: 16,
  boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
};

const badge = (bg: string): React.CSSProperties => ({
  display: 'inline-block',
  background: bg,
  color: '#fff',
  fontSize: 11,
  fontWeight: 600,
  padding: '3px 10px',
  borderRadius: 20,
});

const metaRow: React.CSSProperties = {
  display: 'flex',
  gap: 16,
  alignItems: 'center',
  margin: '12px 0',
  fontSize: 13,
  color: '#6b7280',
};

const metaItem: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 4,
};

const heading: React.CSSProperties = {
  fontFamily: "'Cormorant Garamond', serif",
  fontSize: 20,
  color: '#2D1B4E',
  margin: 0,
  fontWeight: 600,
};

/* ───── component ───── */

export default function Training() {
  const [today, setToday] = useState<TodayWorkout | null>(null);
  const [library, setLibrary] = useState<WorkoutTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // UI state
  const [showExercises, setShowExercises] = useState(false);
  const [activeWorkout, setActiveWorkout] = useState<WorkoutTemplate | null>(null);
  const [openPhases, setOpenPhases] = useState<Record<string, boolean>>({});

  // Timer state
  const [timerActive, setTimerActive] = useState(false);
  const [timerPaused, setTimerPaused] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [restTimer, setRestTimer] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const restRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Exercise log state
  const [exerciseLogs, setExerciseLogs] = useState<Record<number, { reps?: number; weight?: number; duration?: number; completed: boolean }[]>>({});
  const [sessionRpe, setSessionRpe] = useState<number | null>(null);
  const [sessionNotes, setSessionNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [showComplete, setShowComplete] = useState(false);
  const { rewardXP } = useGamification();

  useEffect(() => {
    Promise.all([
      trainingEngineApi.today().catch(() => null),
      trainingEngineApi.library().catch(() => [] as WorkoutTemplate[]),
    ])
      .then(([t, lib]) => {
        setToday(t);
        setLibrary(lib);
        if (t) setActiveWorkout(t.workout);
      })
      .catch(() => setError('Nao foi possivel carregar os treinos.'))
      .finally(() => setLoading(false));
  }, []);

  /* derive current config */
  const phaseKey = today?.phase ?? 'follicular';
  const cfg = PHASE_CONFIG[phaseKey] ?? PHASE_CONFIG.follicular;
  const PhaseIcon = cfg.icon;
  const workout = activeWorkout ?? today?.workout ?? null;

  const startTimer = () => {
    setTimerActive(true);
    setTimerPaused(false);
    setElapsedSeconds(0);
    setShowExercises(true);
    if (workout) {
      const logs: typeof exerciseLogs = {};
      workout.exercises.forEach((ex, i) => {
        const numSets = ex.sets || 1;
        logs[i] = Array.from({ length: numSets }, () => ({ completed: false }));
      });
      setExerciseLogs(logs);
    }
  };

  useEffect(() => {
    if (timerActive && !timerPaused) {
      timerRef.current = setInterval(() => setElapsedSeconds((s) => s + 1), 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [timerActive, timerPaused]);

  const startRestTimer = (restStr: string) => {
    const secs = parseInt(restStr.replace(/[^0-9]/g, ''), 10);
    if (secs <= 0) return;
    if (restRef.current) clearInterval(restRef.current);
    setRestTimer(secs);
    restRef.current = setInterval(() => {
      setRestTimer((t) => {
        if (t <= 1) {
          if (restRef.current) clearInterval(restRef.current);
          restRef.current = null;
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  };

  // Cleanup rest timer on unmount
  useEffect(() => {
    return () => { if (restRef.current) clearInterval(restRef.current); };
  }, []);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const toggleSetComplete = (exIdx: number, setIdx: number) => {
    setExerciseLogs((prev) => {
      const copy = { ...prev };
      copy[exIdx] = [...(copy[exIdx] || [])];
      copy[exIdx][setIdx] = { ...copy[exIdx][setIdx], completed: !copy[exIdx][setIdx]?.completed };
      return copy;
    });
  };

  const updateSetField = (exIdx: number, setIdx: number, field: 'reps' | 'weight', value: string) => {
    setExerciseLogs((prev) => {
      const copy = { ...prev };
      copy[exIdx] = [...(copy[exIdx] || [])];
      copy[exIdx][setIdx] = { ...copy[exIdx][setIdx], [field]: value ? Number(value) : undefined };
      return copy;
    });
  };

  const stopWorkout = () => {
    setTimerActive(false);
    setTimerPaused(false);
    if (timerRef.current) clearInterval(timerRef.current);
    if (restRef.current) clearInterval(restRef.current);
    setShowComplete(true);
  };

  const saveWorkout = async (rpe: number | null) => {
    if (!workout) return;
    setSaving(true);
    try {
      const exercises = workout.exercises.map((ex, i) => ({
        name: ex.name,
        sets: exerciseLogs[i] || [{ completed: true }],
      }));
      await workoutLogApi.create({
        workoutName: workout.name,
        phase: phaseKey,
        durationSeconds: elapsedSeconds,
        rpe,
        exercises,
        notes: sessionNotes || undefined,
      });
      rewardXP(50, 'workout');
    } catch {
      alert('Erro ao salvar treino.');
    } finally {
      setSaving(false);
    }
  };

  const resetWorkout = () => {
    setShowComplete(false);
    setTimerActive(false);
    setTimerPaused(false);
    setElapsedSeconds(0);
    setExerciseLogs({});
    setSessionRpe(null);
    setSessionNotes('');
    setShowExercises(false);
  };

  const togglePhase = (p: string) =>
    setOpenPhases((prev) => ({ ...prev, [p]: !prev[p] }));

  const switchWorkout = (w: WorkoutTemplate) => {
    setActiveWorkout(w);
    setShowExercises(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /* ───── render ───── */

  return (
    <Layout title="Treino" subtitle="Treinos adaptados ao seu ciclo menstrual.">
      {loading ? (
        <p style={{ color: '#6b7280' }}>Carregando...</p>
      ) : error ? (
        <div style={{ ...card, background: '#FEF2F2', color: '#B91C1C' }}>{error}</div>
      ) : (
        <>
          {/* ── Section 1: Today's Workout Hero ── */}
          {workout && (
            <div
              style={{
                background: cfg.gradient,
                borderRadius: 16,
                padding: 24,
                marginBottom: 16,
              }}
            >
              {/* Phase badge */}
              <span style={badge(cfg.color)}>
                <PhaseIcon size={12} style={{ marginRight: 4, verticalAlign: -1 }} />
                Fase {cfg.label}
                {today?.dayOfCycle != null && ` — Dia ${today.dayOfCycle}`}
              </span>

              {/* Workout name */}
              <h2
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 26,
                  fontWeight: 700,
                  color: '#2D1B4E',
                  margin: '14px 0 4px',
                }}
              >
                {workout.name}
              </h2>

              {/* Meta: duration, intensity, RPE */}
              <div style={metaRow}>
                <span style={metaItem}>
                  <Clock size={14} /> {workout.duration} min
                </span>
                <span style={metaItem}>
                  <Flame size={14} /> {workout.intensity}
                </span>
                <span style={metaItem}>
                  <Shield size={14} /> RPE {workout.rpe}
                </span>
              </div>

              {/* Description */}
              {workout.description && (
                <p style={{ fontSize: 14, color: '#374151', margin: '0 0 12px' }}>
                  {workout.description}
                </p>
              )}

              {/* Ovulatory alert */}
              {today?.alert && (
                <div
                  style={{
                    background: '#FFFBEB',
                    border: '1px solid #F59E0B',
                    borderRadius: 12,
                    padding: '10px 14px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 8,
                    marginBottom: 14,
                    fontSize: 13,
                    color: '#92400E',
                  }}
                >
                  <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
                  <span>{today.alert}</span>
                </div>
              )}

              {/* Timer bar */}
              {timerActive && (
                <div style={{
                  background: '#1e1e2f', borderRadius: 12, padding: '12px 16px',
                  marginBottom: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                  <div style={{ color: '#fff', fontSize: 28, fontWeight: 700, fontFamily: 'monospace' }}>
                    {formatTime(elapsedSeconds)}
                  </div>
                  {restTimer > 0 && (
                    <div style={{ color: '#F59E0B', fontSize: 14, fontWeight: 600 }}>
                      Descanso: {formatTime(restTimer)}
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => setTimerPaused(!timerPaused)}
                      style={{ background: '#374151', border: 'none', borderRadius: 8, padding: '8px 12px', cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', gap: 4, fontSize: 13 }}>
                      {timerPaused ? <><Play size={14} /> Retomar</> : <><Pause size={14} /> Pausar</>}
                    </button>
                    <button onClick={stopWorkout} disabled={saving}
                      style={{ background: '#22C55E', border: 'none', borderRadius: 8, padding: '8px 12px', cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 600 }}>
                      <CheckCircle size={14} /> {saving ? 'Salvando...' : 'Finalizar'}
                    </button>
                  </div>
                </div>
              )}

              {/* Start / Toggle button */}
              <button
                onClick={() => timerActive ? setShowExercises(!showExercises) : startTimer()}
                style={{
                  width: '100%',
                  padding: '14px 0',
                  borderRadius: 14,
                  border: 'none',
                  background: timerActive ? '#374151' : '#7C3AED',
                  color: '#fff',
                  fontWeight: 600,
                  fontSize: 15,
                  fontFamily: "'DM Sans', sans-serif",
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                }}
              >
                {timerActive ? (
                  showExercises ? <><ChevronUp size={18} /> Ocultar exercicios</> : <><ChevronDown size={18} /> Ver exercicios</>
                ) : (
                  <><Play size={18} /> Iniciar treino</>
                )}
              </button>

              {/* Reference */}
              {workout.reference && (
                <p
                  style={{
                    fontSize: 11,
                    color: '#9CA3AF',
                    marginTop: 12,
                    marginBottom: 0,
                    lineHeight: 1.4,
                  }}
                >
                  {workout.reference}
                </p>
              )}
            </div>
          )}

          {/* ── Section 2: Exercise List ── */}
          {showExercises && workout && (
            <div style={card}>
              <h3 style={{ ...heading, marginBottom: 16 }}>
                <Dumbbell
                  size={18}
                  style={{ verticalAlign: -3, marginRight: 6, color: '#7C3AED' }}
                />
                Exercicios
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {workout.exercises.map((ex: WorkoutExercise, i: number) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 12,
                      padding: '12px 14px',
                      background: '#F9FAFB',
                      borderRadius: 12,
                    }}
                  >
                    {/* number circle */}
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        background: '#7C3AED',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 13,
                        fontWeight: 700,
                        flexShrink: 0,
                      }}
                    >
                      {i + 1}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontWeight: 600,
                          fontSize: 14,
                          color: '#2D1B4E',
                          marginBottom: 4,
                        }}
                      >
                        {ex.name}
                      </div>

                      <div style={{ fontSize: 13, color: '#6b7280', display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                        {ex.sets != null && ex.reps && (
                          <span>{ex.sets} x {ex.reps}</span>
                        )}
                        {ex.duration && (
                          <span style={metaItem}>
                            <Clock size={12} /> {ex.duration}
                          </span>
                        )}
                        {ex.rest && <span>Descanso: {ex.rest}</span>}
                      </div>

                      {ex.description && (
                        <p style={{ fontSize: 12, color: '#6b7280', margin: '4px 0 0', lineHeight: 1.4 }}>
                          {ex.description}
                        </p>
                      )}

                      {ex.videoUrl && (
                        <a href={ex.videoUrl} target="_blank" rel="noopener noreferrer"
                          style={{ fontSize: 12, color: '#7C3AED', display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 4, textDecoration: 'none' }}>
                          <Play size={12} /> Ver video
                        </a>
                      )}

                      {ex.notes && (
                        <p
                          style={{
                            fontSize: 11,
                            color: '#9CA3AF',
                            margin: '4px 0 0',
                            fontStyle: 'italic',
                          }}
                        >
                          {ex.notes}
                        </p>
                      )}

                      {/* Set tracking (when timer active) */}
                      {timerActive && exerciseLogs[i] && (
                        <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
                          {exerciseLogs[i].map((setLog, si) => (
                            <div key={si} style={{
                              display: 'flex', alignItems: 'center', gap: 8, fontSize: 12,
                              padding: '4px 8px', background: setLog.completed ? '#DCFCE7' : '#fff',
                              borderRadius: 6, border: '1px solid #E5E7EB',
                            }}>
                              <button
                                onClick={() => toggleSetComplete(i, si)}
                                style={{
                                  background: setLog.completed ? '#22C55E' : '#E5E7EB',
                                  border: 'none', borderRadius: 4, width: 20, height: 20,
                                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  color: '#fff', flexShrink: 0,
                                }}
                              >
                                {setLog.completed && <Check size={12} />}
                              </button>
                              <span style={{ color: '#6b7280', minWidth: 32 }}>S{si + 1}</span>
                              <input type="number" placeholder="reps" value={setLog.reps ?? ''}
                                onChange={(e) => updateSetField(i, si, 'reps', e.target.value)}
                                style={{ width: 50, padding: '2px 6px', border: '1px solid #E5E7EB', borderRadius: 4, fontSize: 12, textAlign: 'center' }} />
                              <span style={{ color: '#9CA3AF' }}>x</span>
                              <input type="number" placeholder="kg" value={setLog.weight ?? ''}
                                onChange={(e) => updateSetField(i, si, 'weight', e.target.value)}
                                style={{ width: 50, padding: '2px 6px', border: '1px solid #E5E7EB', borderRadius: 4, fontSize: 12, textAlign: 'center' }} />
                              <span style={{ color: '#9CA3AF' }}>kg</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Actions: rest timer + set tracking */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flexShrink: 0, alignItems: 'flex-end' }}>
                      {ex.rest && timerActive && (
                        <button
                          onClick={() => startRestTimer(ex.rest!)}
                          style={{
                            background: restTimer > 0 ? '#F59E0B' : '#F3F4F6',
                            border: 'none', borderRadius: 6, padding: '4px 8px',
                            cursor: 'pointer', fontSize: 11, fontWeight: 600,
                            color: restTimer > 0 ? '#fff' : '#6b7280',
                            display: 'flex', alignItems: 'center', gap: 3,
                          }}
                        >
                          <Clock size={10} /> {ex.rest}
                        </button>
                      )}
                      {!timerActive && (
                        <span style={{ fontSize: 12, color: '#9CA3AF' }}>
                          {ex.duration ?? (ex.rest || '')}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Completion Screen ── */}
          {showComplete && workout && (
            <div style={{
              ...card, textAlign: 'center' as const, background: '#F0FDF4',
              border: '1px solid #BBF7D0', padding: 32,
            }}>
              <Trophy size={48} style={{ color: '#22C55E', marginBottom: 12 }} />
              <h3 style={{ ...heading, fontSize: 22, marginBottom: 8, color: '#166534' }}>Treino concluido!</h3>
              <p style={{ color: '#166534', fontSize: 14, margin: '0 0 16px' }}>
                {workout.name} — {formatTime(elapsedSeconds)}
              </p>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#475569', marginBottom: 6 }}>
                  Como foi o esforco? (RPE)
                </label>
                <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                    <button key={n} onClick={() => setSessionRpe(n)}
                      style={{
                        width: 32, height: 32, borderRadius: '50%',
                        border: sessionRpe === n ? '2px solid #7C3AED' : '1px solid #E5E7EB',
                        background: sessionRpe === n ? '#7C3AED' : '#fff',
                        color: sessionRpe === n ? '#fff' : '#6b7280',
                        fontSize: 12, fontWeight: 600, cursor: 'pointer',
                      }}>
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                <button onClick={() => saveWorkout(sessionRpe).then(resetWorkout)} disabled={saving} style={{
                  padding: '10px 24px', borderRadius: 10, border: 'none',
                  background: '#22C55E', color: '#fff', fontWeight: 600,
                  fontSize: 14, cursor: 'pointer', display: 'inline-flex',
                  alignItems: 'center', gap: 6, fontFamily: "'DM Sans', sans-serif",
                }}>
                  <CheckCircle size={14} /> {saving ? 'Salvando...' : 'Salvar treino'}
                </button>
                <button onClick={resetWorkout} style={{
                  padding: '10px 24px', borderRadius: 10, border: 'none',
                  background: '#F3F4F6', color: '#6b7280', fontWeight: 600,
                  fontSize: 14, cursor: 'pointer', display: 'inline-flex',
                  alignItems: 'center', gap: 6, fontFamily: "'DM Sans', sans-serif",
                }}>
                  <RotateCcw size={14} /> Descartar
                </button>
              </div>
            </div>
          )}

          {/* ── Section 3: Other workouts for this phase ── */}
          {today && today.allForPhase.length > 1 && (
            <div style={{ marginBottom: 16 }}>
              <h3 style={{ ...heading, marginBottom: 12 }}>
                Outros treinos — Fase {cfg.label}
              </h3>

              <div
                style={{
                  display: 'flex',
                  gap: 12,
                  overflowX: 'auto',
                  paddingBottom: 4,
                  WebkitOverflowScrolling: 'touch',
                }}
              >
                {today.allForPhase
                  .filter((w) => w.name !== workout?.name)
                  .map((w, i) => (
                    <div
                      key={i}
                      onClick={() => switchWorkout(w)}
                      style={{
                        ...card,
                        minWidth: 200,
                        flex: '0 0 auto',
                        marginBottom: 0,
                        cursor: 'pointer',
                        border:
                          workout?.name === w.name
                            ? `2px solid ${cfg.color}`
                            : '2px solid transparent',
                        transition: 'border-color 0.2s',
                      }}
                    >
                      <span style={badge(cfg.color)}>{w.type}</span>
                      <h4
                        style={{
                          fontSize: 15,
                          fontWeight: 600,
                          color: '#2D1B4E',
                          margin: '8px 0 4px',
                        }}
                      >
                        {w.name}
                      </h4>
                      <div style={{ fontSize: 12, color: '#6b7280', display: 'flex', gap: 10 }}>
                        <span style={metaItem}>
                          <Clock size={12} /> {w.duration} min
                        </span>
                        <span style={metaItem}>
                          <Flame size={12} /> {w.intensity}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* ── Section 4: Full Library (accordion by phase) ── */}
          {library.length > 0 && (
            <div>
              <h3 style={{ ...heading, marginBottom: 12 }}>Biblioteca de treinos</h3>

              {PHASE_ORDER.map((phase) => {
                const pcfg = PHASE_CONFIG[phase];
                if (!pcfg) return null;
                const Icon = pcfg.icon;
                const items = library.filter((w) => w.phase === phase).slice(0, 3);
                if (items.length === 0) return null;
                const open = !!openPhases[phase];

                return (
                  <div key={phase} style={{ ...card, padding: 0, overflow: 'hidden' }}>
                    {/* accordion header */}
                    <button
                      onClick={() => togglePhase(phase)}
                      style={{
                        width: '100%',
                        background: 'none',
                        border: 'none',
                        padding: '16px 20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        fontFamily: "'DM Sans', sans-serif",
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: '50%',
                            background: `${pcfg.color}22`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Icon size={16} color={pcfg.color} />
                        </div>
                        <span
                          style={{
                            fontWeight: 600,
                            fontSize: 15,
                            color: '#2D1B4E',
                          }}
                        >
                          Fase {pcfg.label}
                        </span>
                        <span
                          style={{
                            fontSize: 12,
                            color: '#9CA3AF',
                            marginLeft: 4,
                          }}
                        >
                          {items.length} treino{items.length > 1 ? 's' : ''}
                        </span>
                      </div>
                      {open ? (
                        <ChevronUp size={18} color="#6b7280" />
                      ) : (
                        <ChevronDown size={18} color="#6b7280" />
                      )}
                    </button>

                    {/* accordion body */}
                    {open && (
                      <div
                        style={{
                          borderTop: '1px solid #F3F4F6',
                          padding: '12px 20px 16px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 10,
                        }}
                      >
                        {items.map((w, i) => (
                          <div
                            key={i}
                            onClick={() => switchWorkout(w)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '10px 14px',
                              background: '#F9FAFB',
                              borderRadius: 12,
                              cursor: 'pointer',
                            }}
                          >
                            <div>
                              <div
                                style={{
                                  fontWeight: 600,
                                  fontSize: 14,
                                  color: '#2D1B4E',
                                  marginBottom: 2,
                                }}
                              >
                                {w.name}
                              </div>
                              <div style={{ fontSize: 12, color: '#6b7280', display: 'flex', gap: 10 }}>
                                <span style={metaItem}>
                                  <Clock size={12} /> {w.duration} min
                                </span>
                              </div>
                            </div>
                            <span style={badge(pcfg.color)}>{w.type}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </Layout>
  );
}
