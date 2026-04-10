import React, { useEffect, useState } from 'react';
import { Award, Plus, X } from 'lucide-react';
import {
  challengesApi,
  Challenge,
  GoalType,
  GOAL_TYPE_LABELS,
} from '../../services/challenges.api';
import api from '../../services/api';

const Challenges: React.FC = () => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    goalType: 'workout_count' as GoalType,
    goalValue: 10,
    startDate: '',
    endDate: '',
  });

  const load = () => {
    setLoading(true);
    challengesApi
      .list()
      .then(setChallenges)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/challenges', {
        title: form.title,
        description: form.description || undefined,
        goalType: form.goalType,
        goalValue: form.goalValue,
        startDate: form.startDate,
        endDate: form.endDate,
      });
      setShowForm(false);
      setForm({
        title: '',
        description: '',
        goalType: 'workout_count',
        goalValue: 10,
        startDate: '',
        endDate: '',
      });
      load();
    } catch {
      alert('Erro ao criar desafio.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (d: string) => {
    const dt = new Date(d);
    return dt.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  };

  if (loading) return <p className="adm-loading">Carregando...</p>;

  return (
    <div className="adm-challenges">
      <div className="adm-section-card">
        <div className="adm-section-header">
          <Award size={20} className="adm-stat-icon" />
          <h3 className="adm-section-title">Desafios da academia</h3>
          <button
            className="adm-btn-primary adm-btn-sm"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? <X size={16} /> : <Plus size={16} />}
            {showForm ? 'Cancelar' : 'Novo desafio'}
          </button>
        </div>

        {showForm && (
          <form className="adm-form" onSubmit={handleSubmit}>
            <div className="adm-form-group">
              <label>Nome do desafio</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
                placeholder="Ex: 30 treinos em 30 dias"
              />
            </div>
            <div className="adm-form-group">
              <label>Descricao</label>
              <textarea
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                rows={3}
                placeholder="Descricao opcional..."
              />
            </div>
            <div className="adm-form-row">
              <div className="adm-form-group">
                <label>Tipo de meta</label>
                <select
                  value={form.goalType}
                  onChange={(e) =>
                    setForm({ ...form, goalType: e.target.value as GoalType })
                  }
                >
                  <option value="workout_count">Treinos</option>
                  <option value="duration">Minutos</option>
                  <option value="streak">Dias seguidos</option>
                </select>
              </div>
              <div className="adm-form-group">
                <label>Valor da meta</label>
                <input
                  type="number"
                  min={1}
                  value={form.goalValue}
                  onChange={(e) =>
                    setForm({ ...form, goalValue: +e.target.value })
                  }
                  required
                />
              </div>
            </div>
            <div className="adm-form-row">
              <div className="adm-form-group">
                <label>Data inicio</label>
                <input
                  type="date"
                  value={form.startDate}
                  onChange={(e) =>
                    setForm({ ...form, startDate: e.target.value })
                  }
                  required
                />
              </div>
              <div className="adm-form-group">
                <label>Data fim</label>
                <input
                  type="date"
                  value={form.endDate}
                  onChange={(e) =>
                    setForm({ ...form, endDate: e.target.value })
                  }
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              className="adm-btn-primary"
              disabled={submitting}
            >
              {submitting ? 'Criando...' : 'Criar desafio'}
            </button>
          </form>
        )}

        {challenges.length === 0 ? (
          <p className="adm-empty">Nenhum desafio ativo no momento.</p>
        ) : (
          <div className="adm-challenge-list">
            {challenges.map((c) => {
              const progress =
                c.myProgress && c.goalValue
                  ? Math.min((c.myProgress / c.goalValue) * 100, 100)
                  : 0;
              return (
                <div key={c.id} className="adm-challenge-card">
                  <div className="adm-challenge-header">
                    <span className="adm-challenge-title">{c.title}</span>
                    <span className="adm-challenge-dates">
                      {formatDate(c.startDate)} - {formatDate(c.endDate)}
                    </span>
                  </div>
                  {c.description && (
                    <p className="adm-challenge-desc">{c.description}</p>
                  )}
                  <div className="adm-challenge-meta">
                    <span>
                      Meta: {c.goalValue} {GOAL_TYPE_LABELS[c.goalType]}
                    </span>
                  </div>
                  <div className="adm-progress-track">
                    <div
                      className="adm-progress-fill"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Challenges;
