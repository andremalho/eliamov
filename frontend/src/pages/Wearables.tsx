import React, { useEffect, useState } from 'react';
import {
  wearablesApi,
  WearableConnection,
  WearableData,
  ProviderInfo,
} from '../services/wearables.api';
import Layout from '../components/Layout';
import { formatDateTimeBR } from '../utils/format';

export default function Wearables() {
  const [providers, setProviders] = useState<ProviderInfo[]>([]);
  const [connections, setConnections] = useState<WearableConnection[]>([]);
  const [data, setData] = useState<WearableData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const connectedParam = new URLSearchParams(window.location.search).get('connected');

  const refresh = async () => {
    const [provs, conns, entries] = await Promise.all([
      wearablesApi.providers(),
      wearablesApi.list(),
      wearablesApi.listData(),
    ]);
    setProviders(provs);
    setConnections(conns);
    setData(entries);
  };

  useEffect(() => {
    refresh()
      .catch(() => setError('Não foi possível carregar.'))
      .finally(() => setLoading(false));
  }, []);

  const connectedProviders = new Set(connections.map((c) => c.provider));

  const handleConnect = (providerId: string) => {
    if (providerId === 'apple_health') {
      setError('Apple Health sincroniza via app mobile.');
      return;
    }
    const token = localStorage.getItem('eliamov_token');
    window.location.href = `${wearablesApi.connectUrl(providerId as any)}?token=${token}`;
  };

  const handleDisconnect = async (id: string) => {
    if (!confirm('Desconectar este dispositivo?')) return;
    try {
      await wearablesApi.remove(id);
      await refresh();
    } catch {
      setError('Falha ao desconectar dispositivo.');
    }
  };

  const providerName = (id: string) =>
    providers.find((p) => p.id === id)?.name ?? id;

  return (
    <Layout
      title="Wearables"
      subtitle="Conecte seus dispositivos e visualize dados de saúde."
    >
      {loading ? (
        <p className="muted">Carregando…</p>
      ) : (
        <>
          {connectedParam && (
            <div className="card" style={{ background: '#ecfdf5', borderColor: '#86efac' }}>
              <strong>{providerName(connectedParam)}</strong> conectado com sucesso!
            </div>
          )}

          {error && <div className="error">{error}</div>}

          <section className="card">
            <h3>Conectar dispositivo</h3>
            <p className="muted small" style={{ marginBottom: 16 }}>
              Escolha um provider para iniciar a conexão via OAuth.
            </p>
            <div className="feature-grid">
              {providers.map((p) => {
                const isConnected = connectedProviders.has(p.id as any);
                return (
                  <button
                    key={p.id}
                    type="button"
                    className="feature-tile"
                    style={{
                      ['--accent' as any]: isConnected ? '#16a34a' : '#14161F',
                      opacity: isConnected ? 0.7 : 1,
                      cursor: isConnected ? 'default' : 'pointer',
                    }}
                    onClick={() => !isConnected && handleConnect(p.id)}
                    disabled={isConnected}
                  >
                    <span className="feature-tile-title">{p.name}</span>
                    <span className="muted small">
                      {isConnected ? 'Conectado' : 'Conectar'}
                    </span>
                  </button>
                );
              })}
            </div>
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
                      <strong>{providerName(conn.provider)}</strong>
                      <span className="muted small">
                        {' • '}
                        {conn.isActive ? 'Ativo' : 'Inativo'}
                        {conn.lastSyncAt && ` • Última sinc: ${formatDateTimeBR(conn.lastSyncAt)}`}
                      </span>
                    </div>
                    <button className="link-button" onClick={() => handleDisconnect(conn.id)}>
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
              <p className="muted small">Nenhum dado disponível. Conecte um dispositivo para começar.</p>
            ) : (
              <ul className="entry-list">
                {data.map((entry) => (
                  <li key={entry.id}>
                    <div>
                      <strong>{providerName(entry.device)}</strong>
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
