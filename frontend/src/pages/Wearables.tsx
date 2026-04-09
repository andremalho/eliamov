import React, { useEffect, useState } from 'react';
import {
  wearablesApi,
  WearableConnection,
  WearableData,
  WearableDevice,
  DEVICE_LABELS,
} from '../services/wearables.api';
import Layout from '../components/Layout';
import { formatDateTimeBR } from '../utils/format';

export default function Wearables() {
  const [connections, setConnections] = useState<WearableConnection[]>([]);
  const [data, setData] = useState<WearableData[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [device, setDevice] = useState<WearableDevice>('apple_watch');

  const deviceLabel = (d: string) =>
    DEVICE_LABELS.find((x) => x.value === d)?.label ?? d;

  const refresh = async () => {
    const [conns, entries] = await Promise.all([
      wearablesApi.list(),
      wearablesApi.listData(),
    ]);
    setConnections(conns);
    setData(entries);
  };

  useEffect(() => {
    refresh()
      .catch(() => setError('Não foi possível carregar.'))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await wearablesApi.create({ device });
      await refresh();
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Falha ao conectar dispositivo';
      setError(Array.isArray(msg) ? msg.join(', ') : msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Desconectar este dispositivo?')) return;
    try {
      await wearablesApi.remove(id);
      await refresh();
    } catch {
      setError('Falha ao desconectar dispositivo.');
    }
  };

  return (
    <Layout
      title="Wearables"
      subtitle="Gerencie seus dispositivos conectados e visualize dados recentes."
    >
      {loading ? (
          <p className="muted">Carregando…</p>
        ) : (
          <>
            <section className="card">
              <h3>Conectar dispositivo</h3>
              <form className="form-grid" onSubmit={handleSubmit}>
                <label>
                  Dispositivo
                  <select
                    value={device}
                    onChange={(e) => setDevice(e.target.value as WearableDevice)}
                  >
                    {DEVICE_LABELS.map((d) => (
                      <option key={d.value} value={d.value}>
                        {d.label}
                      </option>
                    ))}
                  </select>
                </label>

                {error && <div className="error">{error}</div>}

                <button type="submit" disabled={submitting}>
                  {submitting ? 'Conectando…' : 'Conectar'}
                </button>
              </form>
            </section>

            <section className="card">
              <h3>Dispositivos conectados</h3>
              {connections.length === 0 ? (
                <p className="muted small">Nenhum dispositivo conectado.</p>
              ) : (
                <ul className="entry-list">
                  {connections.map((conn) => (
                    <li key={conn.id}>
                      <div>
                        <strong>{deviceLabel(conn.device)}</strong>
                        <span className="muted small">
                          {' • '}
                          {conn.isActive ? 'Ativo' : 'Inativo'}
                          {' • Última sinc: '}
                          {formatDateTimeBR(conn.lastSyncAt)}
                        </span>
                      </div>
                      <button className="link-button" onClick={() => handleDelete(conn.id)}>
                        Desconectar
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="card">
              <h3>Dados recentes</h3>
              {data.length === 0 ? (
                <p className="muted small">Nenhum dado disponível.</p>
              ) : (
                <ul className="entry-list">
                  {data.map((entry) => (
                    <li key={entry.id}>
                      <div>
                        <strong>{deviceLabel(entry.device)}</strong>
                        <span className="muted small">
                          {' • '}
                          {formatDateTimeBR(entry.recordedAt)}
                        </span>
                        <div className="metric-row" style={{ marginTop: 4 }}>
                          {entry.heartRate != null && (
                            <div>
                              <span className="muted small">FC</span>
                              <strong>{entry.heartRate} bpm</strong>
                            </div>
                          )}
                          {entry.steps != null && (
                            <div>
                              <span className="muted small">Passos</span>
                              <strong>{entry.steps}</strong>
                            </div>
                          )}
                          {entry.sleepScore != null && (
                            <div>
                              <span className="muted small">Sono</span>
                              <strong>{entry.sleepScore}</strong>
                            </div>
                          )}
                          {entry.readinessScore != null && (
                            <div>
                              <span className="muted small">Prontidão</span>
                              <strong>{entry.readinessScore}</strong>
                            </div>
                          )}
                        </div>
                      </div>
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
