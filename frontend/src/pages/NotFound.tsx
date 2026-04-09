import { Link } from 'react-router-dom';
import Layout from '../components/Layout';

export default function NotFound() {
  return (
    <Layout title="Página não encontrada">
      <section className="card" style={{ textAlign: 'center' }}>
        <h3 style={{ fontSize: 48, margin: '16px 0' }}>404</h3>
        <p className="muted">A página que procura não existe ou foi movida.</p>
        <Link to="/dashboard" className="btn-primary" style={{ display: 'inline-block', marginTop: 20 }}>
          Voltar ao início
        </Link>
      </section>
    </Layout>
  );
}
