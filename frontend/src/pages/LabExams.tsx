import React, { useEffect, useState } from 'react';
import {
  labExamsApi,
  LabExam,
  ExamStatus,
  AlertLevel,
} from '../services/lab-exams.api';
import Layout from '../components/Layout';
import { formatBR } from '../utils/format';

const STATUS_BADGE: Record<ExamStatus, { label: string; color: string }> = {
  pending: { label: 'Pendente', color: '#ca8a04' },
  completed: { label: 'Concluído', color: '#2563eb' },
  reviewed: { label: 'Revisado', color: '#16a34a' },
};

const ALERT_LABELS: Record<AlertLevel, { label: string; color: string }> = {
  normal: { label: 'Normal', color: '#16a34a' },
  attention: { label: 'Atenção', color: '#f59e0b' },
  critical: { label: 'Crítico', color: '#dc2626' },
};

const today = () => new Date().toISOString().slice(0, 10);

export default function LabExams() {
  const [entries, setEntries] = useState<LabExam[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [examType, setExamType] = useState('');
  const [examDate, setExamDate] = useState(today());
  const [fileUrl, setFileUrl] = useState('');

  const refresh = async () => {
    const list = await labExamsApi.list();
    setEntries(list);
  };

  useEffect(() => {
    refresh()
      .catch(() => setError('Não foi possível carregar os exames.'))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await labExamsApi.create({
        examType,
        examDate,
        fileUrl: fileUrl || undefined,
      });
      setExamType('');
      setFileUrl('');
      setExamDate(today());
      await refresh();
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Falha ao registrar exame';
      setError(Array.isArray(msg) ? msg.join(', ') : msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remover este exame?')) return;
    try {
      await labExamsApi.remove(id);
      await refresh();
    } catch {
      setError('Falha ao remover exame.');
    }
  };

  return (
    <Layout
      title="Exames laboratoriais"
      subtitle="Registre e acompanhe seus exames de laboratório."
    >
      {loading ? (
        <p className="muted">Carregando…</p>
      ) : (
        <>
          <section className="card">
            <h3>Novo exame</h3>
            <form className="form-grid" onSubmit={handleSubmit}>
              <label>
                Tipo do exame
                <input
                  type="text"
                  value={examType}
                  onChange={(e) => setExamType(e.target.value)}
                  placeholder="Ex.: Hemograma, TSH, Glicemia"
                  required
                />
              </label>

              <label>
                Data do exame
                <input
                  type="date"
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                  required
                />
              </label>

              <label>
                URL do resultado
                <input
                  type="text"
                  value={fileUrl}
                  onChange={(e) => setFileUrl(e.target.value)}
                  placeholder="URL do resultado"
                />
              </label>

              {error && <div className="error">{error}</div>}

              <button type="submit" disabled={submitting}>
                {submitting ? 'Salvando…' : 'Registrar exame'}
              </button>
            </form>
          </section>

          <section className="card">
            <h3>Histórico</h3>
            {entries.length === 0 ? (
              <p className="muted small">Nenhum exame registrado ainda.</p>
            ) : (
              <ul className="entry-list">
                {entries.map((entry) => (
                  <li key={entry.id}>
                    <div>
                      <strong>{entry.examType}</strong>
                      <span className="muted small">
                        {' '}
                        • {formatBR(entry.examDate)}
                      </span>
                      <span
                        className="small"
                        style={{
                          marginLeft: 8,
                          color: STATUS_BADGE[entry.status]?.color,
                          fontWeight: 600,
                        }}
                      >
                        {STATUS_BADGE[entry.status]?.label ?? entry.status}
                      </span>
                      {entry.alertLevel && entry.alertLevel !== 'normal' && (
                        <span
                          className="small"
                          style={{
                            marginLeft: 8,
                            color: ALERT_LABELS[entry.alertLevel]?.color,
                            fontWeight: 600,
                          }}
                        >
                          {ALERT_LABELS[entry.alertLevel]?.label}
                        </span>
                      )}
                      {entry.fileUrl && (
                        <div className="muted small" style={{ marginTop: 4 }}>
                          <a href={entry.fileUrl} target="_blank" rel="noopener noreferrer">
                            Ver resultado
                          </a>
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
