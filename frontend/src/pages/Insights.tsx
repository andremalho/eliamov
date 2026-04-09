import React, { useState } from 'react';
import { insightsApi, InsightsResponse } from '../services/insights.api';
import { formatDateTimeBR } from '../utils/format';
import Markdown from '../components/Markdown';
import Layout from '../components/Layout';

export default function Insights() {
  const [data, setData] = useState<InsightsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await insightsApi.generate();
      setData(res);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Falha ao gerar insights');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout
      title="Insights"
      subtitle="Análise individual sob medida para seus desejos."
    >
      <section className="card">
        <button className="btn-primary" onClick={generate} disabled={loading}>
          {loading ? 'Analisando…' : data ? 'Gerar de novo' : 'Gerar insights'}
        </button>

        {error && (
          <div className="error" style={{ marginTop: 16 }}>
            {error}
          </div>
        )}

        {data && (
          <div style={{ marginTop: 20 }}>
            <div className="muted small" style={{ marginBottom: 12 }}>
              Gerado em {formatDateTimeBR(data.generatedAt)}{' '}
              {data.usingAi ? '• via Claude' : '• modo offline'}
            </div>
            <Markdown>{data.text}</Markdown>
          </div>
        )}
      </section>
    </Layout>
  );
}
