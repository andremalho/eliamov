import React, { useEffect, useState } from 'react';
import {
  appointmentsApi,
  Appointment,
  AppointmentType,
} from '../services/appointments.api';
import Layout from '../components/Layout';
import { formatDateTimeBR, nowLocalInput } from '../utils/format';

const STATUS_BADGE: Record<string, { label: string; color: string }> = {
  scheduled: { label: 'Agendada', color: '#2563eb' },
  confirmed: { label: 'Confirmada', color: '#16a34a' },
  cancelled: { label: 'Cancelada', color: '#dc2626' },
  completed: { label: 'Concluída', color: '#6b7280' },
};

const TYPE_LABELS: Record<AppointmentType, string> = {
  in_person: 'Presencial',
  teleconsult: 'Teleconsulta',
};

export default function Appointments() {
  const [entries, setEntries] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [scheduledAt, setScheduledAt] = useState(nowLocalInput());
  const [duration, setDuration] = useState(30);
  const [type, setType] = useState<AppointmentType>('in_person');
  const [notes, setNotes] = useState('');

  const refresh = async () => {
    const list = await appointmentsApi.list();
    setEntries(list);
  };

  useEffect(() => {
    refresh()
      .catch(() => setError('Não foi possível carregar as consultas.'))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await appointmentsApi.create({
        professionalId: '',
        scheduledAt: new Date(scheduledAt).toISOString(),
        duration,
        type,
        notes: notes || undefined,
      });
      setNotes('');
      setDuration(30);
      setType('in_person');
      setScheduledAt(nowLocalInput());
      await refresh();
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Falha ao registrar consulta';
      setError(Array.isArray(msg) ? msg.join(', ') : msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remover esta consulta?')) return;
    try {
      await appointmentsApi.remove(id);
      await refresh();
    } catch {
      setError('Falha ao remover consulta.');
    }
  };

  return (
    <Layout
      title="Consultas"
      subtitle="Agende e acompanhe suas consultas médicas."
    >
      {loading ? (
        <p className="muted">Carregando…</p>
      ) : (
        <>
          <section className="card">
            <h3>Nova consulta</h3>
            <form className="form-grid" onSubmit={handleSubmit}>
              <label>
                Data e hora
                <input
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  required
                />
              </label>

              <label>
                Duração (minutos)
                <input
                  type="number"
                  min={5}
                  max={480}
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  required
                />
              </label>

              <label>
                Tipo
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as AppointmentType)}
                >
                  <option value="in_person">Presencial</option>
                  <option value="teleconsult">Teleconsulta</option>
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
                {submitting ? 'Salvando…' : 'Agendar'}
              </button>
            </form>
          </section>

          <section className="card">
            <h3>Histórico</h3>
            {entries.length === 0 ? (
              <p className="muted small">Nenhuma consulta registrada ainda.</p>
            ) : (
              <ul className="entry-list">
                {entries.map((entry) => (
                  <li key={entry.id}>
                    <div>
                      <strong>{formatDateTimeBR(entry.scheduledAt)}</strong>
                      <span className="muted small">
                        {' '}
                        • {TYPE_LABELS[entry.type]} • {entry.duration} min
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
