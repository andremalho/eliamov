import React, { useEffect, useState } from 'react';
import {
  glucoseApi,
  GlucoseEntry,
  GlucoseSummary,
  GlucoseContext,
  GLUCOSE_CONTEXTS,
} from '../services/glucose.api';
import Layout from '../components/Layout';
import { formatDateTimeBR, nowLocalInput } from '../utils/format';

export default function Glucometer() {
  const [entries, setEntries] = useState<GlucoseEntry[]>([]);
  const [summary, setSummary] = useState<GlucoseSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [measuredAt, setMeasuredAt] = useState(nowLocalInput());
  const [value, setValue] = useState<number | ''>('');
  const [context, setContext] = useState<GlucoseContext>('fasting');
  const [notes, setNotes] = useState('');

  const refresh = async () => {
    const [list, sum] = await Promise.all([glucoseApi.list(), glucoseApi.summary()]);
    setEntries(list);
    setSummary(sum);
  };

  useEffect(() => {
    refresh()
      .catch(() => setError('Não foi possível carregar.'))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (value === '') return;
    setError(null);
    setSubmitting(true);
    try {
      await glucoseApi.create({
        measuredAt: new Date(measuredAt).toISOString(),
        value: Number(value),
        context,
        notes: notes || undefined,
      });
      setValue('');
      setNotes('');
      setMeasuredAt(nowLocalInput());
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
      await glucoseApi.remove(id);
      await refresh();
    } catch {
      setError('Falha ao remover registro.');
    }
  };

  const ctxLabel = (c: GlucoseContext) =>
    GLUCOSE_CONTEXTS.find((x) => x.value === c)?.label ?? c;

  return (
    <Layout title="Glicemia" subtitle="Registre suas medições e acompanhe a glicose.">
      {loading ? (
          <p className="muted">Carregando…</p>
        ) : (
          <>
            {summary && summary.count > 0 && (
              <section className="card">
                <h3>Últimos 14 dias</h3>
                <div className="metric-row">
                  <div>
                    <span className="muted small">Média</span>
                    <strong>{summary.avg} mg/dL</strong>
                  </div>
                  <div>
                    <span className="muted small">Mínima</span>
                    <strong>{summary.min}</strong>
                  </div>
                  <div>
                    <span className="muted small">Máxima</span>
                    <strong>{summary.max}</strong>
                  </div>
                  <div>
                    <span className="muted small">Alertas</span>
                    <strong style={{ color: summary.alerts > 0 ? '#dc2626' : undefined }}>
                      {summary.alerts}
                    </strong>
                  </div>
                </div>
              </section>
            )}

            <section className="card">
              <h3>Nova medição</h3>
              <form className="form-grid" onSubmit={handleSubmit}>
                <label>
                  Data e hora
                  <input
                    type="datetime-local"
                    value={measuredAt}
                    onChange={(e) => setMeasuredAt(e.target.value)}
                    required
                  />
                </label>
                <label>
                  Valor (mg/dL)
                  <input
                    type="number"
                    min={20}
                    max={700}
                    value={value}
                    onChange={(e) => setValue(e.target.value === '' ? '' : Number(e.target.value))}
                    required
                  />
                </label>
                <label>
                  Contexto
                  <select value={context} onChange={(e) => setContext(e.target.value as GlucoseContext)}>
                    {GLUCOSE_CONTEXTS.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
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
                <p className="muted small">Nenhuma medição ainda.</p>
              ) : (
                <ul className="entry-list">
                  {entries.map((entry) => (
                    <li key={entry.id}>
                      <div>
                        <strong style={{ color: entry.alertTriggered ? '#dc2626' : undefined }}>
                          {entry.value} mg/dL
                        </strong>
                        <span className="muted small">
                          {' '}
                          • {ctxLabel(entry.context)} • {formatDateTimeBR(entry.measuredAt)}
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
