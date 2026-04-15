import React, { useEffect, useState } from 'react';
import {
  nutritionApi,
  NutritionEntry,
  NutritionGoal,
  DailySummary,
  WeightEntry,
  Meal,
  MEAL_LABELS,
} from '../services/nutrition.api';
import Layout from '../components/Layout';
import { PhaseContextCard } from '../components/PhaseContextCard';
import { formatBR } from '../utils/format';
import { TrendingDown, TrendingUp, Minus, Trash2, Apple, Scale, Target, UtensilsCrossed } from 'lucide-react';

const today = () => new Date().toISOString().slice(0, 10);

const GOAL_LABELS: Record<string, string> = {
  weight_loss: 'Emagrecimento',
  maintenance: 'Manter peso',
  muscle_gain: 'Ganho muscular',
};

const MEAL_COLORS: Record<string, string> = {
  breakfast: '#F59E0B',
  morning_snack: '#84CC16',
  lunch: '#3B82F6',
  afternoon_snack: '#8B5CF6',
  dinner: '#EC4899',
  supper: '#6366F1',
  other: '#6B7280',
};

const s = {
  card: {
    background: '#fff',
    border: '1px solid #E5E7EB',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
  } as React.CSSProperties,
  title: {
    fontFamily: 'DM Sans, sans-serif',
    fontSize: 15,
    fontWeight: 600,
    color: '#111827',
    margin: '0 0 14px',
  } as React.CSSProperties,
  label: {
    fontFamily: 'DM Sans, sans-serif',
    fontSize: 12,
    fontWeight: 600,
    color: '#6B7280',
    marginBottom: 6,
    display: 'block',
  } as React.CSSProperties,
  muted: {
    fontFamily: 'DM Sans, sans-serif',
    fontSize: 13,
    color: '#6B7280',
  } as React.CSSProperties,
  mutedSmall: {
    fontFamily: 'DM Sans, sans-serif',
    fontSize: 11,
    color: '#6B7280',
  } as React.CSSProperties,
  input: {
    fontFamily: 'DM Sans, sans-serif',
    fontSize: 14,
    color: '#111827',
    width: '100%',
    padding: '10px 12px',
    borderRadius: 10,
    border: '1px solid #E5E7EB',
    background: '#F9FAFB',
    outline: 'none',
    boxSizing: 'border-box' as const,
  } as React.CSSProperties,
  textarea: {
    fontFamily: 'DM Sans, sans-serif',
    fontSize: 14,
    color: '#111827',
    width: '100%',
    padding: '10px 12px',
    borderRadius: 10,
    border: '1px solid #E5E7EB',
    background: '#F9FAFB',
    outline: 'none',
    resize: 'none' as const,
    boxSizing: 'border-box' as const,
    lineHeight: 1.5,
  } as React.CSSProperties,
  select: {
    fontFamily: 'DM Sans, sans-serif',
    fontSize: 14,
    color: '#111827',
    width: '100%',
    padding: '10px 12px',
    borderRadius: 10,
    border: '1px solid #E5E7EB',
    background: '#F9FAFB',
    outline: 'none',
    boxSizing: 'border-box' as const,
    appearance: 'none' as const,
    WebkitAppearance: 'none' as const,
  } as React.CSSProperties,
  submitBtn: (disabled: boolean) => ({
    fontFamily: 'DM Sans, sans-serif',
    fontSize: 14,
    fontWeight: 600,
    width: '100%',
    padding: '12px 0',
    borderRadius: 12,
    border: 'none',
    background: disabled ? '#D1D5DB' : '#7C3AED',
    color: '#fff',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'background 0.15s',
    marginTop: 4,
  } as React.CSSProperties),
  error: {
    fontFamily: 'DM Sans, sans-serif',
    fontSize: 13,
    color: '#dc2626',
    background: '#FEF2F2',
    border: '1px solid #FECACA',
    borderRadius: 10,
    padding: '8px 12px',
    marginBottom: 12,
  } as React.CSSProperties,
  pillTab: (active: boolean) => ({
    fontFamily: 'DM Sans, sans-serif',
    fontSize: 13,
    fontWeight: 600,
    flex: 1,
    padding: '10px 0',
    borderRadius: 10,
    border: 'none',
    background: active ? '#7C3AED' : 'transparent',
    color: active ? '#fff' : '#6B7280',
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  } as React.CSSProperties),
  mealChip: (active: boolean, color: string) => ({
    fontFamily: 'DM Sans, sans-serif',
    fontSize: 11,
    fontWeight: 600,
    padding: '5px 10px',
    borderRadius: 16,
    border: active ? `1.5px solid ${color}` : '1px solid #E5E7EB',
    background: active ? `${color}18` : '#fff',
    color: active ? color : '#6B7280',
    cursor: 'pointer',
    transition: 'all 0.15s',
    whiteSpace: 'nowrap' as const,
  } as React.CSSProperties),
  row2: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 10,
  } as React.CSSProperties,
};

function ProgressBar({ value, max, label, unit }: { value: number; max: number; label: string; unit?: string }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  const over = value > max;
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        fontFamily: 'DM Sans, sans-serif', fontSize: 12, marginBottom: 4,
      }}>
        <span style={{ color: '#6B7280', fontWeight: 500 }}>{label}</span>
        <span style={{ color: over ? '#dc2626' : '#111827', fontWeight: 600 }}>
          {Math.round(value)} / {Math.round(max)} {unit ?? ''}
        </span>
      </div>
      <div style={{ background: '#F3F4F6', borderRadius: 6, height: 7, overflow: 'hidden' }}>
        <div
          style={{
            width: `${pct}%`,
            background: over
              ? 'linear-gradient(90deg, #dc2626, #ef4444)'
              : 'linear-gradient(90deg, #7C3AED, #A78BFA)',
            borderRadius: 6,
            height: '100%',
            transition: 'width 0.4s ease',
          }}
        />
      </div>
    </div>
  );
}

export default function Nutrition() {
  const [tab, setTab] = useState<'meals' | 'weight' | 'goal'>('meals');
  const [entries, setEntries] = useState<NutritionEntry[]>([]);
  const [summary, setSummary] = useState<DailySummary | null>(null);
  const [goal, setGoal] = useState<NutritionGoal | null>(null);
  const [weights, setWeights] = useState<WeightEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Meal form
  const [date, setDate] = useState(today());
  const [meal, setMeal] = useState<Meal>('breakfast');
  const [description, setDescription] = useState('');
  const [calories, setCalories] = useState<number | ''>('');
  const [protein, setProtein] = useState<number | ''>('');
  const [carbs, setCarbs] = useState<number | ''>('');
  const [fat, setFat] = useState<number | ''>('');
  const [notes, setNotes] = useState('');

  // Weight form
  const [wDate, setWDate] = useState(today());
  const [wWeight, setWWeight] = useState<number | ''>('');
  const [wWaist, setWWaist] = useState<number | ''>('');

  // Goal form
  const [gCalories, setGCalories] = useState<number | ''>('');
  const [gProtein, setGProtein] = useState<number | ''>('');
  const [gCarbs, setGCarbs] = useState<number | ''>('');
  const [gFat, setGFat] = useState<number | ''>('');
  const [gGoal, setGGoal] = useState<string>('maintenance');

  const refresh = async () => {
    const [list, sum, g, w] = await Promise.all([
      nutritionApi.list(),
      nutritionApi.dailySummary(today()),
      nutritionApi.getGoal(),
      nutritionApi.listWeights(),
    ]);
    setEntries(list);
    setSummary(sum);
    setGoal(g);
    setWeights(w);
    if (g) {
      setGCalories(g.dailyCalories);
      setGProtein(g.dailyProtein);
      setGCarbs(g.dailyCarbs);
      setGFat(g.dailyFat);
      setGGoal(g.goal);
    }
  };

  useEffect(() => {
    refresh()
      .catch(() => setError('Nao foi possivel carregar.'))
      .finally(() => setLoading(false));
  }, []);

  const handleMealSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await nutritionApi.create({
        date, meal, description,
        calories: calories === '' ? undefined : Number(calories),
        protein: protein === '' ? undefined : Number(protein),
        carbs: carbs === '' ? undefined : Number(carbs),
        fat: fat === '' ? undefined : Number(fat),
        notes: notes || undefined,
      });
      setDescription('');
      setCalories('');
      setProtein('');
      setCarbs('');
      setFat('');
      setNotes('');
      await refresh();
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Falha ao registrar';
      setError(Array.isArray(msg) ? msg.join(', ') : msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleWeightSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (wWeight === '') return;
    setError(null);
    setSubmitting(true);
    try {
      await nutritionApi.createWeight({
        date: wDate,
        weight: Number(wWeight),
        waist: wWaist === '' ? undefined : Number(wWaist),
      });
      setWWeight('');
      setWWaist('');
      await refresh();
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Falha ao registrar peso';
      setError(Array.isArray(msg) ? msg.join(', ') : msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (gCalories === '') return;
    setError(null);
    setSubmitting(true);
    try {
      await nutritionApi.setGoal({
        dailyCalories: Number(gCalories),
        dailyProtein: Number(gProtein) || undefined,
        dailyCarbs: Number(gCarbs) || undefined,
        dailyFat: Number(gFat) || undefined,
        goal: gGoal as any,
      });
      await refresh();
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Falha ao salvar meta';
      setError(Array.isArray(msg) ? msg.join(', ') : msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteEntry = async (id: string) => {
    if (!confirm('Remover este registro?')) return;
    try {
      await nutritionApi.remove(id);
      await refresh();
    } catch {
      setError('Falha ao remover.');
    }
  };

  const handleDeleteWeight = async (id: string) => {
    if (!confirm('Remover este peso?')) return;
    try {
      await nutritionApi.removeWeight(id);
      await refresh();
    } catch {
      setError('Falha ao remover.');
    }
  };

  const mealLabel = (m: Meal) => MEAL_LABELS.find((x) => x.value === m)?.label ?? m;

  const weightDelta = weights.length > 1
    ? weights[0].weight - weights[weights.length - 1].weight
    : null;

  return (
    <Layout title="Nutricao" subtitle="Acompanhe alimentacao, peso e metas.">
      {loading ? (
        <div style={{ textAlign: 'center', padding: '48px 0' }}>
          <div style={{
            width: 32, height: 32, border: '3px solid #E5E7EB',
            borderTopColor: '#7C3AED', borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto 12px',
          }} />
          <p style={s.muted}>Carregando...</p>
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      ) : (
        <>
          {/* Phase context */}
          <PhaseContextCard activeTab="nutrition" />

          {/* Daily summary card */}
          {summary && goal && (
            <section style={s.card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <p style={{ ...s.title, margin: 0 }}>Hoje</p>
                <span style={s.mutedSmall}>{formatBR(today())}</span>
              </div>
              <ProgressBar value={summary.totalCalories} max={goal.dailyCalories} label="Calorias" unit="kcal" />
              <ProgressBar value={summary.totalProtein} max={goal.dailyProtein} label="Proteinas" unit="g" />
              <ProgressBar value={summary.totalCarbs} max={goal.dailyCarbs} label="Carboidratos" unit="g" />
              <ProgressBar value={summary.totalFat} max={goal.dailyFat} label="Gorduras" unit="g" />
              <div style={{
                display: 'flex', alignItems: 'center', gap: 6,
                marginTop: 10, padding: '6px 10px',
                borderRadius: 8, background: '#F3EEFF',
              }}>
                <Target size={12} color="#7C3AED" />
                <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, color: '#7C3AED', fontWeight: 500 }}>
                  {GOAL_LABELS[goal.goal] ?? goal.goal} -- {summary.entryCount} refeicoes registradas
                </span>
              </div>
            </section>
          )}

          {/* Weight trend card */}
          {weights.length > 0 && (
            <section style={s.card}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                {/* Big weight display */}
                <div style={{ textAlign: 'center', minWidth: 90 }}>
                  <div style={{
                    fontFamily: 'DM Sans, sans-serif',
                    fontSize: 28, fontWeight: 700, color: '#111827',
                    lineHeight: 1,
                  }}>
                    {weights[0].weight}
                  </div>
                  <div style={s.mutedSmall}>kg</div>
                </div>

                {/* Trend + waist */}
                <div style={{ flex: 1 }}>
                  {weightDelta !== null && (
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 5,
                      marginBottom: 4,
                    }}>
                      {weightDelta < 0 ? (
                        <TrendingDown size={16} color="#16a34a" />
                      ) : weightDelta > 0 ? (
                        <TrendingUp size={16} color="#dc2626" />
                      ) : (
                        <Minus size={16} color="#6B7280" />
                      )}
                      <span style={{
                        fontFamily: 'DM Sans, sans-serif',
                        fontSize: 14, fontWeight: 600,
                        color: weightDelta < 0 ? '#16a34a' : weightDelta > 0 ? '#dc2626' : '#6B7280',
                      }}>
                        {weightDelta > 0 ? '+' : ''}{weightDelta.toFixed(1)} kg
                      </span>
                      <span style={s.mutedSmall}>total</span>
                    </div>
                  )}
                  {weights[0].waist && (
                    <div style={{ ...s.mutedSmall }}>
                      Cintura: <strong style={{ color: '#111827' }}>{weights[0].waist} cm</strong>
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}

          {error && <div style={s.error}>{error}</div>}

          {/* Tab navigation - pill style */}
          <div style={{
            display: 'flex', gap: 4,
            padding: 4, borderRadius: 12,
            background: '#F3F4F6',
            marginBottom: 16,
          }}>
            {([
              { key: 'meals' as const, label: 'Refeicoes', icon: <UtensilsCrossed size={14} /> },
              { key: 'weight' as const, label: 'Peso', icon: <Scale size={14} /> },
              { key: 'goal' as const, label: 'Metas', icon: <Target size={14} /> },
            ]).map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setTab(t.key)}
                style={s.pillTab(tab === t.key)}
              >
                {t.icon} {t.label}
              </button>
            ))}
          </div>

          {/* Meals tab */}
          {tab === 'meals' && (
            <>
              <section style={s.card}>
                <p style={s.title}>Nova refeicao</p>
                <form onSubmit={handleMealSubmit}>
                  <div style={{ marginBottom: 14 }}>
                    <span style={s.label}>Data</span>
                    <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required style={s.input} />
                  </div>

                  {/* Meal type chips */}
                  <div style={{ marginBottom: 14 }}>
                    <span style={s.label}>Refeicao</span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {MEAL_LABELS.map((m) => (
                        <button
                          key={m.value}
                          type="button"
                          onClick={() => setMeal(m.value as Meal)}
                          style={s.mealChip(meal === m.value, MEAL_COLORS[m.value] || '#6B7280')}
                        >
                          {m.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={{ marginBottom: 14 }}>
                    <span style={s.label}>Descricao</span>
                    <input
                      type="text"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      required
                      placeholder="O que voce comeu?"
                      style={s.input}
                    />
                  </div>

                  <div style={{ ...s.row2, marginBottom: 14 }}>
                    <div>
                      <span style={s.label}>Calorias (kcal)</span>
                      <input type="number" min={0} value={calories} onChange={(e) => setCalories(e.target.value === '' ? '' : Number(e.target.value))} placeholder="0" style={s.input} />
                    </div>
                    <div>
                      <span style={s.label}>Proteinas (g)</span>
                      <input type="number" min={0} value={protein} onChange={(e) => setProtein(e.target.value === '' ? '' : Number(e.target.value))} placeholder="0" style={s.input} />
                    </div>
                  </div>

                  <div style={{ ...s.row2, marginBottom: 14 }}>
                    <div>
                      <span style={s.label}>Carboidratos (g)</span>
                      <input type="number" min={0} value={carbs} onChange={(e) => setCarbs(e.target.value === '' ? '' : Number(e.target.value))} placeholder="0" style={s.input} />
                    </div>
                    <div>
                      <span style={s.label}>Gorduras (g)</span>
                      <input type="number" min={0} value={fat} onChange={(e) => setFat(e.target.value === '' ? '' : Number(e.target.value))} placeholder="0" style={s.input} />
                    </div>
                  </div>

                  <div style={{ marginBottom: 14 }}>
                    <span style={s.label}>Notas</span>
                    <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="opcional" style={s.textarea} />
                  </div>

                  <button type="submit" disabled={submitting} style={s.submitBtn(submitting)}>
                    {submitting ? 'Salvando...' : 'Salvar refeicao'}
                  </button>
                </form>
              </section>

              <section style={s.card}>
                <p style={s.title}>Historico</p>
                {entries.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '24px 0' }}>
                    <Apple size={32} color="#D1D5DB" style={{ marginBottom: 8 }} />
                    <p style={{ ...s.muted, margin: 0 }}>Nenhum registro ainda.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {entries.map((entry) => (
                      <div key={entry.id} style={{
                        display: 'flex', alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 12px', borderRadius: 10,
                        background: '#F9FAFB', border: '1px solid #F3F4F6',
                      }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                            <span style={{
                              fontFamily: 'DM Sans, sans-serif', fontSize: 13,
                              fontWeight: 600, color: '#111827',
                            }}>
                              {entry.description}
                            </span>
                            <span style={{
                              fontFamily: 'DM Sans, sans-serif', fontSize: 10,
                              fontWeight: 600, padding: '2px 7px', borderRadius: 10,
                              background: `${MEAL_COLORS[entry.meal] || '#6B7280'}18`,
                              color: MEAL_COLORS[entry.meal] || '#6B7280',
                            }}>
                              {mealLabel(entry.meal)}
                            </span>
                          </div>
                          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            <span style={s.mutedSmall}>{formatBR(entry.date)}</span>
                            {entry.calories != null && <span style={s.mutedSmall}>{entry.calories} kcal</span>}
                            {entry.protein != null && <span style={s.mutedSmall}>P {entry.protein}g</span>}
                            {entry.carbs != null && <span style={s.mutedSmall}>C {entry.carbs}g</span>}
                            {entry.fat != null && <span style={s.mutedSmall}>G {entry.fat}g</span>}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteEntry(entry.id)}
                          style={{
                            background: 'none', border: 'none', cursor: 'pointer',
                            padding: 6, borderRadius: 6, color: '#9CA3AF',
                            display: 'flex', alignItems: 'center',
                          }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </>
          )}

          {/* Weight tab */}
          {tab === 'weight' && (
            <>
              <section style={s.card}>
                <p style={s.title}>Registrar peso</p>
                <form onSubmit={handleWeightSubmit}>
                  <div style={{ marginBottom: 14 }}>
                    <span style={s.label}>Data</span>
                    <input type="date" value={wDate} onChange={(e) => setWDate(e.target.value)} required style={s.input} />
                  </div>
                  <div style={{ ...s.row2, marginBottom: 14 }}>
                    <div>
                      <span style={s.label}>Peso (kg)</span>
                      <input type="number" min={20} max={300} step={0.1} value={wWeight} onChange={(e) => setWWeight(e.target.value === '' ? '' : Number(e.target.value))} required style={s.input} />
                    </div>
                    <div>
                      <span style={s.label}>Cintura (cm)</span>
                      <input type="number" min={30} max={200} step={0.5} value={wWaist} onChange={(e) => setWWaist(e.target.value === '' ? '' : Number(e.target.value))} placeholder="opcional" style={s.input} />
                    </div>
                  </div>
                  <button type="submit" disabled={submitting} style={s.submitBtn(submitting)}>
                    {submitting ? 'Salvando...' : 'Salvar peso'}
                  </button>
                </form>
              </section>

              <section style={s.card}>
                <p style={s.title}>Historico de peso</p>
                {weights.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '24px 0' }}>
                    <Scale size={32} color="#D1D5DB" style={{ marginBottom: 8 }} />
                    <p style={{ ...s.muted, margin: 0 }}>Nenhum registro de peso.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {weights.map((w, i) => {
                      const prev = weights[i + 1];
                      const delta = prev ? w.weight - prev.weight : null;
                      return (
                        <div key={w.id} style={{
                          display: 'flex', alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '10px 12px', borderRadius: 10,
                          background: '#F9FAFB', border: '1px solid #F3F4F6',
                        }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                              <span style={{
                                fontFamily: 'DM Sans, sans-serif',
                                fontSize: 15, fontWeight: 700, color: '#111827',
                              }}>
                                {w.weight} kg
                              </span>
                              {delta !== null && delta !== 0 && (
                                <span style={{
                                  fontFamily: 'DM Sans, sans-serif',
                                  fontSize: 11, fontWeight: 600,
                                  color: delta < 0 ? '#16a34a' : '#dc2626',
                                  display: 'flex', alignItems: 'center', gap: 2,
                                }}>
                                  {delta < 0 ? <TrendingDown size={11} /> : <TrendingUp size={11} />}
                                  {delta > 0 ? '+' : ''}{delta.toFixed(1)}
                                </span>
                              )}
                            </div>
                            <div style={{ display: 'flex', gap: 8 }}>
                              <span style={s.mutedSmall}>{formatBR(w.date)}</span>
                              {w.waist != null && <span style={s.mutedSmall}>cintura {w.waist}cm</span>}
                              {w.bodyFat != null && <span style={s.mutedSmall}>gordura {w.bodyFat}%</span>}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDeleteWeight(w.id)}
                            style={{
                              background: 'none', border: 'none', cursor: 'pointer',
                              padding: 6, borderRadius: 6, color: '#9CA3AF',
                              display: 'flex', alignItems: 'center',
                            }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            </>
          )}

          {/* Goals tab */}
          {tab === 'goal' && (
            <section style={s.card}>
              <p style={s.title}>Metas diarias</p>

              {/* Current goal display */}
              {goal && (
                <div style={{
                  padding: '12px 14px', borderRadius: 10,
                  background: '#F3EEFF', border: '1px solid #E9DEFF',
                  marginBottom: 16,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                    <Target size={14} color="#7C3AED" />
                    <span style={{
                      fontFamily: 'DM Sans, sans-serif', fontSize: 13,
                      fontWeight: 600, color: '#7C3AED',
                    }}>
                      {GOAL_LABELS[goal.goal] ?? goal.goal}
                    </span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8 }}>
                    {[
                      { label: 'Cal', value: `${goal.dailyCalories}`, unit: 'kcal' },
                      { label: 'Prot', value: `${goal.dailyProtein}`, unit: 'g' },
                      { label: 'Carb', value: `${goal.dailyCarbs}`, unit: 'g' },
                      { label: 'Gord', value: `${goal.dailyFat}`, unit: 'g' },
                    ].map((m) => (
                      <div key={m.label} style={{ textAlign: 'center' }}>
                        <div style={{
                          fontFamily: 'DM Sans, sans-serif',
                          fontSize: 16, fontWeight: 700, color: '#7C3AED',
                        }}>
                          {m.value}
                        </div>
                        <div style={{
                          fontFamily: 'DM Sans, sans-serif',
                          fontSize: 10, color: '#9B8ACE',
                        }}>
                          {m.unit}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <p style={{ ...s.mutedSmall, marginBottom: 14 }}>
                Calculadas automaticamente com base no seu perfil (BMR + nivel de atividade). Ajuste como preferir.
              </p>

              <form onSubmit={handleGoalSubmit}>
                <div style={{ marginBottom: 14 }}>
                  <span style={s.label}>Objetivo</span>
                  <select value={gGoal} onChange={(e) => setGGoal(e.target.value)} style={s.select}>
                    <option value="weight_loss">Emagrecimento</option>
                    <option value="maintenance">Manter peso</option>
                    <option value="muscle_gain">Ganho muscular</option>
                  </select>
                </div>

                <div style={{ marginBottom: 14 }}>
                  <span style={s.label}>Calorias diarias (kcal)</span>
                  <input type="number" min={800} max={5000} value={gCalories} onChange={(e) => setGCalories(e.target.value === '' ? '' : Number(e.target.value))} required style={s.input} />
                </div>

                <div style={{ ...s.row2, marginBottom: 14 }}>
                  <div>
                    <span style={s.label}>Proteinas (g)</span>
                    <input type="number" min={0} value={gProtein} onChange={(e) => setGProtein(e.target.value === '' ? '' : Number(e.target.value))} style={s.input} />
                  </div>
                  <div>
                    <span style={s.label}>Carboidratos (g)</span>
                    <input type="number" min={0} value={gCarbs} onChange={(e) => setGCarbs(e.target.value === '' ? '' : Number(e.target.value))} style={s.input} />
                  </div>
                </div>

                <div style={{ marginBottom: 14 }}>
                  <span style={s.label}>Gorduras (g)</span>
                  <input type="number" min={0} value={gFat} onChange={(e) => setGFat(e.target.value === '' ? '' : Number(e.target.value))} style={s.input} />
                </div>

                <button type="submit" disabled={submitting} style={s.submitBtn(submitting)}>
                  {submitting ? 'Salvando...' : 'Salvar metas'}
                </button>
              </form>
            </section>
          )}
        </>
      )}
    </Layout>
  );
}
