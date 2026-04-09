import React, { useEffect, useState } from 'react';
import {
  bpApi,
  BpEntry,
  BpSummary,
  BpContext,
  BP_CONTEXTS,
} from '../services/blood-pressure.api';
import Layout from '../components/Layout';
import { formatDateTimeBR, nowLocalInput } from '../utils/format';

export default function BloodPressure() {
  const [entries, setEntries] = useState<BpEntry[]>([]);
  const [summary, setSummary] = useState<BpSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [measuredAt, setMeasuredAt] = useState(nowLocalInput());
  const [systolic, setSystolic] = useState<number | ''>('');
  const [diastolic, setDiastolic] = useState<number | ''>('');
  const [heartRate, setHeartRate] = useState<number | ''>('');
  const [context, setContext] = useState<BpContext>('rest');
  const [notes, setNotes] = useState('');

  const refresh = async () => {
    const [list, sum] = await Promise.all([bpApi.list(), bpApi.summary()]);
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
    if (systolic === '' || diastolic === '') return;
    setError(null);
    setSubmitting(true);
    try {
      await bpApi.create({
        measuredAt: new Date(measuredAt).toISOString(),
        systolic: Number(systolic),
        diastolic: Number(diastolic),
        heartRate: heartRate === '' ? undefined : Number(heartRate),
        context,
        notes: notes || undefined,
      });
      setSystolic('');
      setDiastolic('');
      setHeartRate('');
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
      await bpApi.remove(id);
      await refresh();
    } catch {
      setError('Falha ao remover registro.');
    }
  };

  const ctxLabel = (c: BpContext) => BP_CONTEXTS.find((x) => x.value === c)?.label ?? c;

  return (
    <Layout
      title="Pressão arterial"
      subtitle="Registre suas medições de pressão e frequência cardíaca."
    >
      {loading ? (
          <p className="muted">Carregando…</p>
        ) : (
          <>
            {summary && summary.count > 0 && (
              <section className="card">
                <h3>Últimos 14 dias</h3>
                <div className="metric-row">
                  <div>
                    <span className="muted small">PA média</span>
                    <strong>
                      {summary.avgSystolic}/{summary.avgDiastolic}
                    </strong>
                  </div>
                  <div>
                    <span className="muted small">FC média</span>
                    <strong>{summary.avgHeartRate ?? '—'}</strong>
                  </div>
                  <div>
                    <span className="muted small">Medições</span>
                    <strong>{summary.count}</strong>
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

                <div className="row-2">
                  <label>
                    Sistólica
                    <input
                      type="number"
                      min={50}
                      max={260}
                      value={systolic}
                      onChange={(e) =>
                        setSystolic(e.target.value === '' ? '' : Number(e.target.value))
                      }
                      required
                    />
                  </label>
                  <label>
                    Diastólica
                    <input
                      type="number"
                      min={30}
                      max={180}
                      value={diastolic}
                      onChange={(e) =>
                        setDiastolic(e.target.value === '' ? '' : Number(e.target.value))
                      }
                      required
                    />
                  </label>
                </div>

                <label>
                  Frequência cardíaca (bpm)
                  <input
                    type="number"
                    min={20}
                    max={220}
                    value={heartRate}
                    onChange={(e) =>
                      setHeartRate(e.target.value === '' ? '' : Number(e.target.value))
                    }
                    placeholder="opcional"
                  />
                </label>

                <label>
                  Contexto
                  <select value={context} onChange={(e) => setContext(e.target.value as BpContext)}>
                    {BP_CONTEXTS.map((c) => (
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
                          {entry.systolic}/{entry.diastolic} mmHg
                        </strong>
                        <span className="muted small">
                          {entry.heartRate != null && ` • ${entry.heartRate} bpm`}
                          {' • '}
                          {ctxLabel(entry.context)} • {formatDateTimeBR(entry.measuredAt)}
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
