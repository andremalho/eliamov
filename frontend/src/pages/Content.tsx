import React, { useEffect, useState } from 'react';
import { contentApi, ContentItem } from '../services/content.api';
import Layout from '../components/Layout';
import { formatBR } from '../utils/format';

const TYPE_BADGES: Record<string, string> = {
  article: 'Artigo',
  video: 'Vídeo',
  tip: 'Dica',
};

export default function Content() {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    contentApi
      .list()
      .then(setItems)
      .catch(() => setError('Não foi possível carregar o conteúdo.'))
      .finally(() => setLoading(false));
  }, []);

  const toggle = (id: string) =>
    setExpandedId((prev) => (prev === id ? null : id));

  return (
    <Layout title="Conteúdo" subtitle="Artigos, vídeos e dicas para você.">
      {loading ? (
        <p className="muted">Carregando…</p>
      ) : (
        <>
          {error && <div className="error">{error}</div>}

          {items.length === 0 ? (
            <p className="muted small">Nenhum conteúdo disponível.</p>
          ) : (
            <div className="card-grid">
              {items.map((item) => (
                <section
                  key={item.id}
                  className="card"
                  style={{ cursor: 'pointer' }}
                  onClick={() => toggle(item.id)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0 }}>{item.title}</h3>
                    <span className="badge">{TYPE_BADGES[item.type] ?? item.type}</span>
                  </div>

                  {expandedId === item.id ? (
                    <p style={{ whiteSpace: 'pre-wrap', marginTop: 8 }}>
                      {item.body ?? 'Sem conteúdo.'}
                    </p>
                  ) : (
                    <p className="muted" style={{ marginTop: 8 }}>
                      {item.body ? item.body.slice(0, 150) + (item.body.length > 150 ? '…' : '') : 'Sem descrição.'}
                    </p>
                  )}

                  <span className="muted small">
                    ❤ {item.likes} • {formatBR(item.publishedAt)}
                  </span>
                </section>
              ))}
            </div>
          )}
        </>
      )}
    </Layout>
  );
}
