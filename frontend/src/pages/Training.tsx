import React, { useEffect, useState } from 'react';
import { trainingApi, TrainingPlan } from '../services/training.api';
import { insightsApi, AiPlanResponse } from '../services/insights.api';
import Layout from '../components/Layout';
import Markdown from '../components/Markdown';
import { formatBR } from '../utils/format';

const PHASE_LABELS: Record<string, string> = {
  menstrual: 'Menstrual',
  follicular: 'Folicular',
  ovulatory: 'Ovulatoria',
  luteal: 'Lutea',
};

export default function Training() {
  const [entries, setEntries] = useState<TrainingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [generating, setGenerating] = useState(false);
  const [aiPlan, setAiPlan] = useState<AiPlanResponse | null>(null);

  const refresh = async () => {
    const list = await trainingApi.list();
    setEntries(list);
  };

  useEffect(() => {
    refresh()
      .catch(() => setError('Nao foi possivel carregar os planos de treino.'))
      .finally(() => setLoading(false));
  }, []);

  const handleGeneratePlan = async () => {
    setGenerating(true);
    setError(null);
    try {
      const result = await insightsApi.trainingPlan();
      setAiPlan(result);
    } catch {
      setError('Falha ao gerar plano de treino.');
    } finally {
      setGenerating(false);
    }
  };

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
      subtitle="Planos personalizados com base no seu ciclo, humor e objetivos."
    >
      {loading ? (
        <p className="muted">Carregando...</p>
      ) : (
        <>
          {error && <div className="error">{error}</div>}

          <section className="card">
            <h3>Gerar plano com IA</h3>
            <p className="muted small" style={{ marginBottom: 12 }}>
              A IA analisa seu perfil, fase do ciclo, humor e nivel de atividade
              para criar um plano de treino semanal personalizado.
            </p>
            <button
              type="button"
              className="btn-primary"
              onClick={handleGeneratePlan}
              disabled={generating}
              style={{ width: '100%' }}
            >
              {generating ? 'Gerando plano...' : 'Gerar plano semanal'}
            </button>
          </section>

          {aiPlan && (
            <section className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <h3>Plano gerado</h3>
                <span className="muted small">
                  {aiPlan.usingAi ? 'IA' : 'Offline'} | {new Date(aiPlan.generatedAt).toLocaleString('pt-BR')}
                </span>
              </div>
              <Markdown>{aiPlan.raw}</Markdown>
            </section>
          )}

          <section className="card">
            <h3>Planos salvos</h3>
            {entries.length === 0 ? (
              <p className="muted small">Nenhum plano de treino registrado ainda.</p>
            ) : (
              <ul className="entry-list">
                {entries.map((entry) => (
                  <li key={entry.id}>
                    <div>
                      <strong>
                        {formatBR(entry.weekStart)} - {formatBR(entry.weekEnd)}
                      </strong>
                      <span className="muted small">
                        {entry.generatedByAi && ' | IA'}
                        {entry.cyclePhase &&
                          ` | ${PHASE_LABELS[entry.cyclePhase] ?? entry.cyclePhase}`}
                        {entry.moodScore != null && ` | humor ${entry.moodScore}/5`}
                        {entry.wearableReadiness != null &&
                          ` | readiness ${entry.wearableReadiness}`}
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
