import React, { useEffect, useState } from 'react';
import { feedApi, FeedComment } from '../services/feed.api';

interface CommentsModalProps {
  open: boolean;
  postId: string;
  onClose: () => void;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'agora';
  if (mins < 60) return `${mins}min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d`;
  return new Date(iso).toLocaleDateString('pt-BR');
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export default function CommentsModal({ open, postId, onClose }: CommentsModalProps) {
  const [comments, setComments] = useState<FeedComment[]>([]);
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open || !postId) return;
    setLoading(true);
    feedApi
      .getComments(postId)
      .then(setComments)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [open, postId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSubmitting(true);
    try {
      const comment = await feedApi.addComment(postId, text.trim());
      setComments((prev) => [...prev, comment]);
      setText('');
    } catch {
      /* ignore */
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3>Comentarios</h3>
          </div>
          <button className="link-button" onClick={onClose} aria-label="Fechar">
            ✕
          </button>
        </div>

        <div className="modal-body">
          {loading ? (
            <p className="muted">Carregando...</p>
          ) : (
            <div className="comments-list">
              {comments.length === 0 ? (
                <p className="muted" style={{ textAlign: 'center', padding: '24px 0' }}>
                  Nenhum comentario ainda. Seja a primeira!
                </p>
              ) : (
                comments.map((c) => (
                  <div key={c.id} className="comment-item">
                    <div className="comment-avatar">
                      {getInitials(c.user?.name ?? '?')}
                    </div>
                    <div className="comment-body">
                      <div className="comment-author">{c.user?.name ?? 'Utilizadora'}</div>
                      <div className="comment-text">{c.content}</div>
                      <div className="comment-time">{timeAgo(c.createdAt)}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          <form className="comment-input-row" onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Escreva um comentario..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <button type="submit" disabled={submitting || !text.trim()}>
              {submitting ? '...' : 'Enviar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
