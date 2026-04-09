import React, { useEffect, useState } from 'react';
import { trainingApi, TrainingPlan } from '../services/training.api';
import Layout from '../components/Layout';
import { formatBR } from '../utils/format';

const PHASE_LABELS: Record<string, string> = {
  menstrual: 'Menstrual',
  follicular: 'Folicular',
  ovulatory: 'Ovulatória',
  luteal: 'Lútea',
};

export default function Training() {
  const [entries, setEntries] = useState<TrainingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    const list = await trainingApi.list();
    setEntries(list);
  };

  useEffect(() => {
    refresh()
      .catch(() => setError('Não foi possível carregar os planos de treino.'))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Remover este registro?')) return;
    try {
      await trainingApi.remove(id);
      await refresh();
    } catch {
      setError('Falha ao remover registro.');
    }
  };

  return (
    <Layout
      title="Plano de treino"
      subtitle="Acompanhe seus planos de treino semanais."
    >
      {loading ? (
        <p className="muted">Carregando…</p>
      ) : (
        <>
          {error && <div className="error">{error}</div>}

          <section className="card">
            <h3>Planos</h3>
            {entries.length === 0 ? (
              <p className="muted small">Nenhum plano de treino registrado ainda.</p>
            ) : (
              <ul className="entry-list">
                {entries.map((entry) => (
                  <li key={entry.id}>
                    <div>
                      <strong>
                        {formatBR(entry.weekStart)} — {formatBR(entry.weekEnd)}
                      </strong>
                      <span className="muted small">
                        {entry.generatedByAi && ' • IA'}
                        {entry.cyclePhase &&
                          ` • ${PHASE_LABELS[entry.cyclePhase] ?? entry.cyclePhase}`}
                        {entry.moodScore != null && ` • humor ${entry.moodScore}/5`}
                        {entry.wearableReadiness != null &&
                          ` • readiness ${entry.wearableReadiness}`}
                      </span>
                      {entry.planJson && (
                        <details style={{ marginTop: 4 }}>
                          <summary className="muted small">Ver plano</summary>
                          <pre className="muted small" style={{ whiteSpace: 'pre-wrap' }}>
                            {JSON.stringify(entry.planJson, null, 2)}
                          </pre>
                        </details>
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
