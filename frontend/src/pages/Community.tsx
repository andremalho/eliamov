import React, { useEffect, useState } from 'react';
import { communityApi, CommunityPost, CreatePostInput, PostType } from '../services/community.api';
import Layout from '../components/Layout';
import { formatBR } from '../utils/format';

const TYPE_BADGES: Record<string, string> = {
  post: 'Post',
  question: 'Pergunta',
  tip: 'Dica',
};

export default function Community() {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [type, setType] = useState<PostType>('post');

  const refresh = async () => {
    const list = await communityApi.list();
    setPosts(list);
  };

  useEffect(() => {
    refresh()
      .catch(() => setError('Não foi possível carregar as publicações.'))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await communityApi.create({ title, body, type });
      setTitle('');
      setBody('');
      setType('post');
      await refresh();
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Falha ao criar publicação';
      setError(Array.isArray(msg) ? msg.join(', ') : msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = async (id: string) => {
    try {
      await communityApi.like(id);
      await refresh();
    } catch {
      setError('Falha ao curtir publicação.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remover esta publicação?')) return;
    try {
      await communityApi.remove(id);
      await refresh();
    } catch {
      setError('Falha ao remover publicação.');
    }
  };

  return (
    <Layout
      title="Comunidade"
      subtitle="Partilhe experiências e conecte-se."
    >
      {loading ? (
        <p className="muted">Carregando…</p>
      ) : (
        <>
          <section className="card">
            <h3>Nova publicação</h3>
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
                Conteúdo
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={4}
                  required
                />
              </label>
              <label>
                Tipo
                <select value={type} onChange={(e) => setType(e.target.value as PostType)}>
                  <option value="post">Post</option>
                  <option value="question">Pergunta</option>
                  <option value="tip">Dica</option>
                </select>
              </label>

              {error && <div className="error">{error}</div>}

              <button type="submit" disabled={submitting}>
                {submitting ? 'Publicando…' : 'Publicar'}
              </button>
            </form>
          </section>

          <section className="card">
            <h3>Publicações</h3>
            {posts.length === 0 ? (
              <p className="muted small">Nenhuma publicação ainda.</p>
            ) : (
              <ul className="entry-list">
                {posts.map((post) => (
                  <li key={post.id}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <strong>{post.title}</strong>
                        <span className="badge">{TYPE_BADGES[post.type] ?? post.type}</span>
                      </div>
                      <p className="muted" style={{ margin: '4px 0' }}>
                        {post.body.length > 150 ? post.body.slice(0, 150) + '…' : post.body}
                      </p>
                      <span className="muted small">
                        ❤ {post.likes} • 💬 {post.replies} • {formatBR(post.createdAt)}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <button className="link-button" onClick={() => handleLike(post.id)}>
                        Curtir
                      </button>
                      <button className="link-button" onClick={() => handleDelete(post.id)}>
                        Remover
                      </button>
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
