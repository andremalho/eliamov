import React, { useEffect, useState } from 'react';
import { chatApi, ChatMessage, CreateChatInput } from '../services/chat.api';
import Layout from '../components/Layout';
import { formatDateTimeBR } from '../utils/format';

const SENDER_LABELS: Record<string, string> = {
  user: 'Você',
  professional: 'Profissional',
  ai: 'IA',
};

export default function Chat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [content, setContent] = useState('');

  const refresh = async () => {
    const list = await chatApi.list();
    setMessages(list);
  };

  useEffect(() => {
    refresh()
      .catch(() => setError('Não foi possível carregar as mensagens.'))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setError(null);
    setSubmitting(true);
    try {
      await chatApi.create({ content });
      setContent('');
      await refresh();
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Falha ao enviar mensagem';
      setError(Array.isArray(msg) ? msg.join(', ') : msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remover esta mensagem?')) return;
    try {
      await chatApi.remove(id);
      await refresh();
    } catch {
      setError('Falha ao remover mensagem.');
    }
  };

  return (
    <Layout
      title="Chat"
      subtitle="Converse com profissionais ou com a IA."
    >
      {/* Medical disclaimer */}
      <div style={{ padding: '10px 14px', background: '#FEF3C7', border: '1px solid #FDE68A', borderRadius: 10, fontSize: 12, color: '#92400E', lineHeight: 1.5, marginBottom: 16 }}>
        ⚕️ <strong>Aviso importante:</strong> As informações fornecidas neste chat são de carater informativo e educacional. Não constituem aconselhamento médico, diagnóstico ou tratamento. Para questoes de saúde, consulte um profissional qualificado.
      </div>

      {loading ? (
        <p className="muted">Carregando…</p>
      ) : (
        <>
          <section className="card">
            <h3>Mensagens</h3>
            {messages.length === 0 ? (
              <p className="muted small">Nenhuma mensagem ainda.</p>
            ) : (
              <ul className="entry-list">
                {[...messages].reverse().map((msg) => (
                  <li key={msg.id}>
                    <div>
                      <span className="badge">{SENDER_LABELS[msg.sender] ?? msg.sender}</span>
                      <p style={{ margin: '4px 0' }}>{msg.content}</p>
                      <span className="muted small">{formatDateTimeBR(msg.createdAt)}</span>
                    </div>
                    <button className="link-button" onClick={() => handleDelete(msg.id)}>
                      Remover
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="card">
            <h3>Nova mensagem</h3>
            <form className="form-grid" onSubmit={handleSubmit}>
              <label>
                Mensagem
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={3}
                  required
                />
              </label>

              {error && <div className="error">{error}</div>}

              <button type="submit" disabled={submitting}>
                {submitting ? 'Enviando…' : 'Enviar'}
              </button>
            </form>
          </section>
        </>
      )}
    </Layout>
  );
}
