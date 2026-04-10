import React from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';

export default function Companion() {
  const { currentUser } = useAuth();
  return (
    <Layout title="Acompanhamento" subtitle="Acompanhe quem voce ama.">
      <section className="card">
        <h3>Ola, {currentUser?.name?.split(' ')[0]}</h3>
        <p className="muted">Seu painel de acompanhamento esta sendo preparado.</p>
      </section>
    </Layout>
  );
}
