import React, { useEffect, useState } from 'react';
import { marketplaceApi, MarketplaceItem, CATEGORY_LABELS } from '../services/marketplace.api';
import Layout from '../components/Layout';

const formatPrice = (value: number) =>
  `R$ ${value.toFixed(2).replace('.', ',')}`;

const getCategoryLabel = (category: string) => {
  const found = CATEGORY_LABELS.find((c) => c.value === category);
  return found ? found.label : category;
};

export default function Marketplace() {
  const [items, setItems] = useState<MarketplaceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    marketplaceApi
      .list()
      .then(setItems)
      .catch(() => setError('Não foi possível carregar os itens do marketplace.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Layout title="Marketplace" subtitle="Produtos e serviços para você.">
      {loading ? (
        <p className="muted">Carregando…</p>
      ) : (
        <>
          {error && <div className="error">{error}</div>}

          {items.length === 0 ? (
            <p className="muted small">Nenhum item disponível.</p>
          ) : (
            <div className="card-grid">
              {items.map((item) => (
                <section key={item.id} className="card">
                  {item.imageUrl && (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      style={{ width: '100%', borderRadius: 8, marginBottom: 8, objectFit: 'cover', maxHeight: 200 }}
                    />
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0 }}>{item.name}</h3>
                    <span className="badge">{getCategoryLabel(item.category)}</span>
                  </div>

                  <p className="muted" style={{ marginTop: 8 }}>
                    {item.description ?? 'Sem descrição.'}
                  </p>

                  <span className="muted small">
                    {formatPrice(item.price)}
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
