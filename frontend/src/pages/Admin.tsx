import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';

const ADMIN_SECTIONS = [
  { to: '/content', label: 'Content' },
  { to: '/courses', label: 'Courses' },
  { to: '/marketplace', label: 'Marketplace' },
  { to: '/programs', label: 'Programs' },
  { to: '/research', label: 'Research' },
  { to: '/ads', label: 'Ads' },
  { to: '/tenants', label: 'Tenants' },
];

export default function Admin() {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return (
      <Layout title="Admin">
        <p className="muted">Carregando…</p>
      </Layout>
    );
  }

  if (currentUser.role !== 'admin') {
    return (
      <Layout title="Admin">
        <section className="card">
          <p>Acesso restrito a administradores</p>
          <p className="muted small">
            Sua função atual: <strong>{currentUser.role}</strong>
          </p>
        </section>
      </Layout>
    );
  }

  return (
    <Layout title="Admin" subtitle="Painel de administração">
      <section className="card">
        <h3>Sua função</h3>
        <p>
          <strong>{currentUser.role}</strong>
        </p>
      </section>

      <section className="card">
        <h3>Gerenciamento</h3>
        <div className="metric-row" style={{ flexWrap: 'wrap', gap: 12 }}>
          {ADMIN_SECTIONS.map((s) => (
            <Link key={s.to} to={s.to} className="card" style={{ textDecoration: 'none', minWidth: 120, textAlign: 'center' }}>
              <strong>{s.label}</strong>
            </Link>
          ))}
        </div>
      </section>
    </Layout>
  );
}
