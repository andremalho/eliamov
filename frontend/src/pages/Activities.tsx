import React, { useEffect, useState } from 'react';
import {
  activitiesApi,
  Activity,
  ACTIVITY_TYPES,
  ActivityType,
} from '../services/activities.api';
import Layout from '../components/Layout';
import ActivityMap from '../components/ActivityMap';
import ShareButtons from '../components/ShareButtons';
import { formatDateTimeBR, nowLocalInput } from '../utils/format';

const TYPE_MAP: Record<string, string> = Object.fromEntries(
  ACTIVITY_TYPES.map((t) => [t.value, t.label]),
);

const formatDuration = (seconds: number): string => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${String(m).padStart(2, '0')}min`;
  if (m > 0) return `${m}min ${String(s).padStart(2, '0')}s`;
  return `${s}s`;
};

const formatDistance = (meters: number | null): string => {
  if (meters == null) return '—';
  return `${(meters / 1000).toFixed(1)} km`;
};

export default function Activities() {
  const [entries, setEntries] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [type, setType] = useState<ActivityType>('run');
  const [startedAt, setStartedAt] = useState(nowLocalInput());
  const [durationMin, setDurationMin] = useState(30);
  const [distanceKm, setDistanceKm] = useState('');
  const [calories, setCalories] = useState('');
  const [avgHeartRate, setAvgHeartRate] = useState('');
  const [isPublic, setIsPublic] = useState(false);

  const refresh = async () => {
    const result = await activitiesApi.list();
    setEntries(result.data);
  };

  useEffect(() => {
    refresh()
      .catch(() => setError('Não foi possível carregar as atividades.'))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await activitiesApi.create({
        title,
        type,
        startedAt: new Date(startedAt).toISOString(),
        duration: durationMin * 60,
        distance: distanceKm ? Number(distanceKm) * 1000 : undefined,
        calories: calories ? Number(calories) : undefined,
        avgHeartRate: avgHeartRate ? Number(avgHeartRate) : undefined,
        isPublic,
      });
      await refresh();
      setTitle('');
      setDurationMin(30);
      setDistanceKm('');
      setCalories('');
      setAvgHeartRate('');
      setIsPublic(false);
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Falha ao registrar atividade';
      setError(Array.isArray(msg) ? msg.join(', ') : msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remover esta atividade?')) return;
    try {
      await activitiesApi.remove(id);
      await refresh();
    } catch {
      setError('Falha ao remover atividade.');
    }
  };

  const shareUrl = (a: Activity) =>
    a.shareToken
      ? `${window.location.origin}/activities/public/${a.shareToken}`
      : window.location.href;

  return (
    <Layout
      title="Atividades"
      subtitle="Registe e partilhe as suas atividades físicas."
    >
      {loading ? (
        <p className="muted">Carregando…</p>
      ) : (
        <>
          <section className="card">
            <h3>Nova atividade</h3>
            <form className="form-grid" onSubmit={handleSubmit}>
              <label>
                Título
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </label>
              <label>
                Tipo
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as ActivityType)}
                >
                  {ACTIVITY_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Início
                <input
                  type="datetime-local"
                  value={startedAt}
                  onChange={(e) => setStartedAt(e.target.value)}
                  required
                />
              </label>
              <label>
                Duração (minutos)
                <input
                  type="number"
                  min={1}
                  value={durationMin}
                  onChange={(e) => setDurationMin(Number(e.target.value))}
                  required
                />
              </label>
              <label>
                Distância (km)
                <input
                  type="number"
                  step="0.1"
                  min={0}
                  value={distanceKm}
                  onChange={(e) => setDistanceKm(e.target.value)}
                />
              </label>
              <label>
                Calorias
                <input
                  type="number"
                  min={0}
                  value={calories}
                  onChange={(e) => setCalories(e.target.value)}
                />
              </label>
              <label>
                FC média (bpm)
                <input
                  type="number"
                  min={0}
                  value={avgHeartRate}
                  onChange={(e) => setAvgHeartRate(e.target.value)}
                />
              </label>
              <label
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 8,
                  display: 'flex',
                }}
              >
                <input
                  type="checkbox"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                />
                Tornar público para partilha
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
              <p className="muted small">Nenhuma atividade registrada ainda.</p>
            ) : (
              <ul className="entry-list">
                {entries.map((entry) => (
                  <li key={entry.id} style={{ flexDirection: 'column', alignItems: 'stretch' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <strong>{entry.title}</strong>
                        <span
                          className="muted small"
                          style={{
                            marginLeft: 8,
                            padding: '2px 8px',
                            borderRadius: 6,
                            background: 'var(--surface, #f3f4f6)',
                          }}
                        >
                          {TYPE_MAP[entry.type] ?? entry.type}
                        </span>
                        <div className="muted small" style={{ marginTop: 4 }}>
                          {formatDateTimeBR(entry.startedAt)} •{' '}
                          {formatDuration(entry.duration)} •{' '}
                          {formatDistance(entry.distance)}
                          {entry.calories != null && ` • ${entry.calories} kcal`}
                          {entry.avgHeartRate != null && ` • ${entry.avgHeartRate} bpm`}
                        </div>
                      </div>
                      <button className="link-button" onClick={() => handleDelete(entry.id)}>
                        Remover
                      </button>
                    </div>

                    {entry.polyline && (
                      <div style={{ marginTop: 8 }}>
                        <ActivityMap polyline={entry.polyline} height={180} />
                      </div>
                    )}

                    {entry.isPublic && (
                      <ShareButtons
                        url={shareUrl(entry)}
                        title={entry.title}
                        description={`${TYPE_MAP[entry.type] ?? entry.type} — ${formatDuration(entry.duration)} — ${formatDistance(entry.distance)}`}
                      />
                    )}
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
