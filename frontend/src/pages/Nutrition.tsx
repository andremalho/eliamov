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
import { formatBR } from '../utils/format';

const today = () => new Date().toISOString().slice(0, 10);

const GOAL_LABELS: Record<string, string> = {
  weight_loss: 'Emagrecimento',
  maintenance: 'Manter peso',
  muscle_gain: 'Ganho muscular',
};

function ProgressBar({ value, max, label }: { value: number; max: number; label: string }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  const over = value > max;
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
        <span className="muted">{label}</span>
        <span style={{ color: over ? '#dc2626' : undefined, fontWeight: 600 }}>
          {Math.round(value)} / {Math.round(max)}
        </span>
      </div>
      <div style={{ background: '#ece9e2', borderRadius: 6, height: 8, marginTop: 4 }}>
        <div
          style={{
            width: `${pct}%`,
            background: over ? '#dc2626' : '#6d4ac4',
            borderRadius: 6,
            height: '100%',
            transition: 'width 0.3s',
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

  return (
    <Layout title="Nutricao" subtitle="Acompanhe alimentacao, peso e metas.">
      {loading ? (
        <p className="muted">Carregando...</p>
      ) : (
        <>
          {/* Daily summary card */}
          {summary && goal && (
            <section className="card">
              <h3>Hoje - {formatBR(today())}</h3>
              <ProgressBar value={summary.totalCalories} max={goal.dailyCalories} label="Calorias (kcal)" />
              <ProgressBar value={summary.totalProtein} max={goal.dailyProtein} label="Proteinas (g)" />
              <ProgressBar value={summary.totalCarbs} max={goal.dailyCarbs} label="Carboidratos (g)" />
              <ProgressBar value={summary.totalFat} max={goal.dailyFat} label="Gorduras (g)" />
              <div className="muted small" style={{ marginTop: 8 }}>
                Meta: {GOAL_LABELS[goal.goal] ?? goal.goal} | {summary.entryCount} refeicoes registradas
              </div>
            </section>
          )}

          {/* Weight trend */}
          {weights.length > 0 && (
            <section className="card">
              <h3>Peso</h3>
              <div className="metric-row">
                <div>
                  <span className="muted small">Atual</span>
                  <strong>{weights[0].weight} kg</strong>
                </div>
                {weights.length > 1 && (
                  <div>
                    <span className="muted small">Variacao</span>
                    <strong style={{
                      color: weights[0].weight < weights[weights.length - 1].weight ? '#16a34a' : '#dc2626',
                    }}>
                      {(weights[0].weight - weights[weights.length - 1].weight) > 0 ? '+' : ''}
                      {(weights[0].weight - weights[weights.length - 1].weight).toFixed(1)} kg
                    </strong>
                  </div>
                )}
                {weights[0].waist && (
                  <div>
                    <span className="muted small">Cintura</span>
                    <strong>{weights[0].waist} cm</strong>
                  </div>
                )}
              </div>
            </section>
          )}

          {error && <div className="error">{error}</div>}

          {/* Tab navigation */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            {(['meals', 'weight', 'goal'] as const).map((t) => (
              <button
                key={t}
                type="button"
                className={tab === t ? 'btn-primary' : 'link-button'}
                onClick={() => setTab(t)}
                style={{ flex: 1, padding: '8px 0', borderRadius: 8, fontSize: 14 }}
              >
                {t === 'meals' ? 'Refeicoes' : t === 'weight' ? 'Peso' : 'Metas'}
              </button>
            ))}
          </div>

          {/* Meals tab */}
          {tab === 'meals' && (
            <>
              <section className="card">
                <h3>Nova refeicao</h3>
                <form className="form-grid" onSubmit={handleMealSubmit}>
                  <label>Data<input type="date" value={date} onChange={(e) => setDate(e.target.value)} required /></label>
                  <label>Refeicao
                    <select value={meal} onChange={(e) => setMeal(e.target.value as Meal)}>
                      {MEAL_LABELS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
                    </select>
                  </label>
                  <label>Descricao<input type="text" value={description} onChange={(e) => setDescription(e.target.value)} required placeholder="O que voce comeu?" /></label>
                  <div className="row-2">
                    <label>Calorias<input type="number" min={0} value={calories} onChange={(e) => setCalories(e.target.value === '' ? '' : Number(e.target.value))} placeholder="kcal" /></label>
                    <label>Proteinas<input type="number" min={0} value={protein} onChange={(e) => setProtein(e.target.value === '' ? '' : Number(e.target.value))} placeholder="g" /></label>
                  </div>
                  <div className="row-2">
                    <label>Carboidratos<input type="number" min={0} value={carbs} onChange={(e) => setCarbs(e.target.value === '' ? '' : Number(e.target.value))} placeholder="g" /></label>
                    <label>Gorduras<input type="number" min={0} value={fat} onChange={(e) => setFat(e.target.value === '' ? '' : Number(e.target.value))} placeholder="g" /></label>
                  </div>
                  <label>Notas<textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="opcional" /></label>
                  <button type="submit" disabled={submitting}>{submitting ? 'Salvando...' : 'Salvar'}</button>
                </form>
              </section>

              <section className="card">
                <h3>Historico</h3>
                {entries.length === 0 ? (
                  <p className="muted small">Nenhum registro ainda.</p>
                ) : (
                  <ul className="entry-list">
                    {entries.map((entry) => (
                      <li key={entry.id}>
                        <div>
                          <strong>{entry.description}</strong>
                          <span className="muted small">
                            {' '}{mealLabel(entry.meal)} | {formatBR(entry.date)}
                            {entry.calories != null && ` | ${entry.calories} kcal`}
                            {entry.protein != null && ` | P${entry.protein}g`}
                            {entry.carbs != null && ` C${entry.carbs}g`}
                            {entry.fat != null && ` G${entry.fat}g`}
                          </span>
                        </div>
                        <button className="link-button" onClick={() => handleDeleteEntry(entry.id)}>Remover</button>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </>
          )}

          {/* Weight tab */}
          {tab === 'weight' && (
            <>
              <section className="card">
                <h3>Registrar peso</h3>
                <form className="form-grid" onSubmit={handleWeightSubmit}>
                  <label>Data<input type="date" value={wDate} onChange={(e) => setWDate(e.target.value)} required /></label>
                  <div className="row-2">
                    <label>Peso (kg)<input type="number" min={20} max={300} step={0.1} value={wWeight} onChange={(e) => setWWeight(e.target.value === '' ? '' : Number(e.target.value))} required /></label>
                    <label>Cintura (cm)<input type="number" min={30} max={200} step={0.5} value={wWaist} onChange={(e) => setWWaist(e.target.value === '' ? '' : Number(e.target.value))} placeholder="opcional" /></label>
                  </div>
                  <button type="submit" disabled={submitting}>{submitting ? 'Salvando...' : 'Salvar'}</button>
                </form>
              </section>

              <section className="card">
                <h3>Historico de peso</h3>
                {weights.length === 0 ? (
                  <p className="muted small">Nenhum registro de peso.</p>
                ) : (
                  <ul className="entry-list">
                    {weights.map((w) => (
                      <li key={w.id}>
                        <div>
                          <strong>{w.weight} kg</strong>
                          <span className="muted small">
                            {' '}{formatBR(w.date)}
                            {w.waist != null && ` | cintura ${w.waist}cm`}
                            {w.bodyFat != null && ` | gordura ${w.bodyFat}%`}
                          </span>
                        </div>
                        <button className="link-button" onClick={() => handleDeleteWeight(w.id)}>Remover</button>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </>
          )}

          {/* Goals tab */}
          {tab === 'goal' && (
            <section className="card">
              <h3>Metas diarias</h3>
              <p className="muted small" style={{ marginBottom: 16 }}>
                Calculadas automaticamente com base no seu perfil (BMR + nivel de atividade).
                Ajuste como preferir.
              </p>
              <form className="form-grid" onSubmit={handleGoalSubmit}>
                <label>Objetivo
                  <select value={gGoal} onChange={(e) => setGGoal(e.target.value)}>
                    <option value="weight_loss">Emagrecimento</option>
                    <option value="maintenance">Manter peso</option>
                    <option value="muscle_gain">Ganho muscular</option>
                  </select>
                </label>
                <label>Calorias diarias (kcal)<input type="number" min={800} max={5000} value={gCalories} onChange={(e) => setGCalories(e.target.value === '' ? '' : Number(e.target.value))} required /></label>
                <div className="row-2">
                  <label>Proteinas (g)<input type="number" min={0} value={gProtein} onChange={(e) => setGProtein(e.target.value === '' ? '' : Number(e.target.value))} /></label>
                  <label>Carboidratos (g)<input type="number" min={0} value={gCarbs} onChange={(e) => setGCarbs(e.target.value === '' ? '' : Number(e.target.value))} /></label>
                </div>
                <label>Gorduras (g)<input type="number" min={0} value={gFat} onChange={(e) => setGFat(e.target.value === '' ? '' : Number(e.target.value))} /></label>
                <button type="submit" disabled={submitting}>{submitting ? 'Salvando...' : 'Salvar metas'}</button>
              </form>
            </section>
          )}
        </>
      )}
    </Layout>
  );
}
