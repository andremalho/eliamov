import React, { useEffect, useState } from 'react';
import { moodApi, MoodEntry, MoodSummary } from '../services/mood.api';
import Layout from '../components/Layout';
import { formatBR } from '../utils/format';

const today = () => new Date().toISOString().slice(0, 10);

const SCALE = [1, 2, 3, 4, 5];

export default function Mood() {
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [summary, setSummary] = useState<MoodSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [date, setDate] = useState(today());
  const [energy, setEnergy] = useState(3);
  const [mood, setMood] = useState(3);
  const [sleepHours, setSleepHours] = useState<number | ''>('');
  const [pain, setPain] = useState(false);
  const [notes, setNotes] = useState('');

  const refresh = async () => {
    const [list, sum] = await Promise.all([moodApi.list(), moodApi.summary()]);
    setEntries(list);
    setSummary(sum);
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
      await moodApi.create({
        date,
        energy,
        mood,
        sleepHours: sleepHours === '' ? undefined : Number(sleepHours),
        pain,
        notes: notes || undefined,
      });
      setNotes('');
      setSleepHours('');
      setPain(false);
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
      await moodApi.remove(id);
      await refresh();
    } catch {
      setError('Falha ao remover registro.');
    }
  };

  return (
    <Layout title="Humor & bem-estar" subtitle="Registre como você está se sentindo hoje.">
      {loading ? (
          <p className="muted">Carregando…</p>
        ) : (
          <>
            {summary && summary.count > 0 && (
              <section className="card">
                <h3>Últimos 7 dias</h3>
                <div className="metric-row">
                  <div>
                    <span className="muted small">Energia média</span>
                    <strong>{summary.avgEnergy ?? '—'}/5</strong>
                  </div>
                  <div>
                    <span className="muted small">Humor médio</span>
                    <strong>{summary.avgMood ?? '—'}/5</strong>
                  </div>
                  <div>
                    <span className="muted small">Sono médio</span>
                    <strong>{summary.avgSleep != null ? `${summary.avgSleep}h` : '—'}</strong>
                  </div>
                  <div>
                    <span className="muted small">Dias com dor</span>
                    <strong>{summary.painDays}</strong>
                  </div>
                </div>
              </section>
            )}

            <section className="card">
              <h3>Como você está hoje?</h3>
              <form className="form-grid" onSubmit={handleSubmit}>
                <label>
                  Data
                  <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
                </label>

                <div>
                  <label>Energia</label>
                  <div className="scale">
                    {SCALE.map((n) => (
                      <button
                        key={n}
                        type="button"
                        className={`scale-btn ${energy === n ? 'active' : ''}`}
                        onClick={() => setEnergy(n)}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label>Humor</label>
                  <div className="scale">
                    {SCALE.map((n) => (
                      <button
                        key={n}
                        type="button"
                        className={`scale-btn ${mood === n ? 'active' : ''}`}
                        onClick={() => setMood(n)}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>

                <label>
                  Horas de sono
                  <input
                    type="number"
                    min={0}
                    max={24}
                    step={0.5}
                    value={sleepHours}
                    onChange={(e) => setSleepHours(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="opcional"
                  />
                </label>

                <label className="checkbox-row">
                  <input type="checkbox" checked={pain} onChange={(e) => setPain(e.target.checked)} />
                  Senti dor hoje
                </label>

                <label>
                  Notas
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    placeholder="opcional"
                  />
                </label>

                {error && <div className="error">{error}</div>}

                <button type="submit" disabled={submitting}>
                  {submitting ? 'Salvando…' : 'Salvar registro'}
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
                        <strong>{formatBR(entry.date)}</strong>
                        <span className="muted small">
                          {' '}
                          • energia {entry.energy}/5 • humor {entry.mood}/5
                          {entry.sleepHours != null && ` • ${entry.sleepHours}h sono`}
                          {entry.pain && ' • dor'}
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
