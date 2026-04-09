import React, { useEffect, useState } from 'react';
import { cycleApi, CycleEntry, CurrentPhase } from '../services/cycle.api';
import Layout from '../components/Layout';
import { formatBR } from '../utils/format';

const PHASE_LABELS: Record<string, { label: string; color: string }> = {
  menstrual: { label: 'Menstrual', color: '#dc2626' },
  follicular: { label: 'Folicular', color: '#16a34a' },
  ovulatory: { label: 'Ovulatória', color: '#f59e0b' },
  luteal: { label: 'Lútea', color: '#7c3aed' },
};

const today = () => new Date().toISOString().slice(0, 10);

export default function Cycle() {
  const [entries, setEntries] = useState<CycleEntry[]>([]);
  const [current, setCurrent] = useState<CurrentPhase | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [startDate, setStartDate] = useState(today());
  const [cycleLength, setCycleLength] = useState(28);
  const [periodLength, setPeriodLength] = useState(5);

  const refresh = async () => {
    const [list, cur] = await Promise.all([cycleApi.list(), cycleApi.current()]);
    setEntries(list);
    setCurrent(cur);
  };

  useEffect(() => {
    refresh()
      .catch(() => setError('Não foi possível carregar os ciclos.'))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await cycleApi.create({ startDate, cycleLength, periodLength });
      await refresh();
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Falha ao registrar ciclo';
      setError(Array.isArray(msg) ? msg.join(', ') : msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remover este registro?')) return;
    try {
      await cycleApi.remove(id);
      await refresh();
    } catch {
      setError('Falha ao remover registro.');
    }
  };

  return (
    <Layout
      title="Ciclo menstrual"
      subtitle="Registre o início de cada menstruação para acompanhar suas fases."
    >
      {loading ? (
        <p className="muted">Carregando…</p>
      ) : (
        <>
          {current && current.phase && (
            <section className="card phase-card">
              <div>
                <span className="muted small">Fase atual</span>
                <h3 style={{ color: PHASE_LABELS[current.phase].color }}>
                  {PHASE_LABELS[current.phase].label}
                </h3>
              </div>
              <div className="phase-meta">
                <div>
                  <span className="muted small">Dia do ciclo</span>
                  <strong>{current.dayOfCycle}</strong>
                </div>
                <div>
                  <span className="muted small">Próxima menstruação</span>
                  <strong>{formatBR(current.nextStart)}</strong>
                </div>
              </div>
            </section>
          )}

          <section className="card">
            <h3>Registrar novo ciclo</h3>
            <form className="form-grid" onSubmit={handleSubmit}>
              <label>
                Data de início
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </label>
              <label>
                Duração do ciclo (dias)
                <input
                  type="number"
                  min={20}
                  max={45}
                  value={cycleLength}
                  onChange={(e) => setCycleLength(Number(e.target.value))}
                />
              </label>
              <label>
                Duração do período (dias)
                <input
                  type="number"
                  min={1}
                  max={15}
                  value={periodLength}
                  onChange={(e) => setPeriodLength(Number(e.target.value))}
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
              <p className="muted small">Nenhum ciclo registrado ainda.</p>
            ) : (
              <ul className="entry-list">
                {entries.map((entry) => (
                  <li key={entry.id}>
                    <div>
                      <strong>{formatBR(entry.startDate)}</strong>
                      <span className="muted small">
                        {' '}
                        • {entry.cycleLength}d / período {entry.periodLength}d
                      </span>
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
