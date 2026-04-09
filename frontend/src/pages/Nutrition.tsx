import React, { useEffect, useState } from 'react';
import { nutritionApi, NutritionEntry, Meal, MEAL_LABELS } from '../services/nutrition.api';
import Layout from '../components/Layout';
import { formatBR } from '../utils/format';

const today = () => new Date().toISOString().slice(0, 10);

export default function Nutrition() {
  const [entries, setEntries] = useState<NutritionEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [date, setDate] = useState(today());
  const [meal, setMeal] = useState<Meal>('breakfast');
  const [description, setDescription] = useState('');
  const [calories, setCalories] = useState<number | ''>('');
  const [protein, setProtein] = useState<number | ''>('');
  const [carbs, setCarbs] = useState<number | ''>('');
  const [fat, setFat] = useState<number | ''>('');
  const [notes, setNotes] = useState('');

  const refresh = async () => {
    const list = await nutritionApi.list();
    setEntries(list);
  };

  useEffect(() => {
    refresh()
      .catch(() => setError('Não foi possível carregar os registros.'))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await nutritionApi.create({
        date,
        meal,
        description,
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

  const handleDelete = async (id: string) => {
    if (!confirm('Remover este registro?')) return;
    try {
      await nutritionApi.remove(id);
      await refresh();
    } catch {
      setError('Falha ao remover registro.');
    }
  };

  const mealLabel = (m: Meal) =>
    MEAL_LABELS.find((x) => x.value === m)?.label ?? m;

  return (
    <Layout title="Nutrição" subtitle="Registre suas refeições e acompanhe a alimentação.">
      {loading ? (
        <p className="muted">Carregando…</p>
      ) : (
        <>
          <section className="card">
            <h3>Nova refeição</h3>
            <form className="form-grid" onSubmit={handleSubmit}>
              <label>
                Data
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </label>
              <label>
                Refeição
                <select value={meal} onChange={(e) => setMeal(e.target.value as Meal)}>
                  {MEAL_LABELS.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Descrição
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  placeholder="O que você comeu?"
                />
              </label>
              <label>
                Calorias (kcal)
                <input
                  type="number"
                  min={0}
                  value={calories}
                  onChange={(e) => setCalories(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="opcional"
                />
              </label>
              <label>
                Proteínas (g)
                <input
                  type="number"
                  min={0}
                  value={protein}
                  onChange={(e) => setProtein(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="opcional"
                />
              </label>
              <label>
                Carboidratos (g)
                <input
                  type="number"
                  min={0}
                  value={carbs}
                  onChange={(e) => setCarbs(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="opcional"
                />
              </label>
              <label>
                Gorduras (g)
                <input
                  type="number"
                  min={0}
                  value={fat}
                  onChange={(e) => setFat(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="opcional"
                />
              </label>
              <label>
                Notas
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="opcional"
                />
              </label>

              {error && <div className="error">{error}</div>}

              <button type="submit" disabled={submitting}>
                {submitting ? 'Salvando…' : 'Salvar'}
              </button>
            </form>
          </section>

          <section className="card">
            <h3>Histórico</h3>
            {entries.length === 0 ? (
              <p className="muted small">Nenhum registro ainda.</p>
            ) : (
              <ul className="entry-list">
                {entries.map((entry) => (
                  <li key={entry.id}>
                    <div>
                      <strong>{entry.description}</strong>
                      <span className="muted small">
                        {' '}
                        • {mealLabel(entry.meal)} • {formatBR(entry.date)}
                        {entry.calories != null && ` • ${entry.calories} kcal`}
                        {entry.protein != null && ` • P ${entry.protein}g`}
                        {entry.carbs != null && ` • C ${entry.carbs}g`}
                        {entry.fat != null && ` • G ${entry.fat}g`}
                      </span>
                      {entry.notes && (
                        <div className="muted small" style={{ marginTop: 4 }}>
                          {entry.notes}
                        </div>
                      )}
                    </div>
                    <button className="link-button" onClick={() => handleDelete(entry.id)}>
                      Remover
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </Layout>
  );
}
