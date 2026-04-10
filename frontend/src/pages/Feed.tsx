import React, { useCallback, useEffect, useRef, useState } from 'react';
import Layout from '../components/Layout';
import FeedCard from '../components/FeedCard';
import CommentsModal from '../components/CommentsModal';
import { feedApi, FeedPost, PostType, ReactionType } from '../services/feed.api';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { Camera, Image, Share2 } from 'lucide-react';

const POST_TYPE_OPTIONS: { value: PostType; label: string }[] = [
  { value: 'free', label: 'Texto livre' },
  { value: 'workout', label: 'Treino' },
  { value: 'achievement', label: 'Conquista' },
];

export default function Feed() {
  const { currentUser } = useAuth();
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Create post
  const [content, setContent] = useState('');
  const [postType, setPostType] = useState<PostType>('free');
  const [mediaUrl, setMediaUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const feedFileRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { uploadUrl, publicUrl } = await api.post('/media/presigned-url?type=image&folder=feed').then(r => r.data);
      await fetch(uploadUrl, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } });
      setMediaUrl(publicUrl);
    } catch {
      setMediaUrl(URL.createObjectURL(file));
    }
    setUploading(false);
  };

  // Comments modal
  const [commentsPostId, setCommentsPostId] = useState<string | null>(null);

  const sentinelRef = useRef<HTMLDivElement>(null);

  const loadFeed = useCallback(async () => {
    try {
      const res = await feedApi.getFeed();
      setPosts(res.data);
      setNextCursor(res.nextCursor);
    } catch {
      setError('Nao foi possivel carregar o feed.');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMore = useCallback(async () => {
    if (!nextCursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const res = await feedApi.getFeed(nextCursor);
      setPosts((prev) => [...prev, ...res.data]);
      setNextCursor(res.nextCursor);
    } catch {
      /* ignore */
    } finally {
      setLoadingMore(false);
    }
  }, [nextCursor, loadingMore]);

  // Initial load
  useEffect(() => {
    loadFeed();
  }, [loadFeed]);

  // IntersectionObserver for infinite scroll
  useEffect(() => {
    if (!sentinelRef.current || !nextCursor) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && nextCursor && !loadingMore) {
          loadMore();
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [nextCursor, loadingMore, loadMore]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const post = await feedApi.createPost({ postType, content: content.trim(), mediaUrls: mediaUrl.trim() ? [mediaUrl.trim()] : undefined });
      setPosts((prev) => [post, ...prev]);
      setContent('');
      setMediaUrl('');
      setPostType('free');
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Falha ao criar publicacao';
      setError(Array.isArray(msg) ? msg.join(', ') : msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Optimistic like
  const handleLike = async (postId: string, liked: boolean) => {
    // Optimistic update
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              liked: !liked,
              likesCount: liked ? p.likesCount - 1 : p.likesCount + 1,
            }
          : p,
      ),
    );

    try {
      if (liked) {
        await feedApi.unlike(postId);
      } else {
        await feedApi.like(postId);
      }
    } catch {
      // Revert on error
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? {
                ...p,
                liked: liked,
                likesCount: liked ? p.likesCount + 1 : p.likesCount - 1,
              }
            : p,
        ),
      );
    }
  };

  const handleReaction = async (postId: string, reaction: ReactionType) => {
    try {
      await feedApi.addReaction(postId, reaction);
    } catch {
      /* ignore */
    }
  };

  const handleDelete = async (postId: string) => {
    try {
      await feedApi.deletePost(postId);
      setPosts((prev) => prev.filter((p) => p.id !== postId));
    } catch {
      setError('Falha ao remover publicacao.');
    }
  };

  const handleComment = (postId: string) => {
    setCommentsPostId(postId);
  };

  const handleCloseComments = () => {
    setCommentsPostId(null);
    // Refresh feed to get updated comment counts
    loadFeed();
  };

  return (
    <Layout
      title="Feed"
      subtitle="Veja o que suas colegas de academia estao fazendo."
    >
      {/* Create post form */}
      <section className="card">
        <h3>Nova publicacao</h3>
        <form className="form-grid" onSubmit={handleSubmit}>
          {/* Post type selector */}
          <div className="feed-post-type-selector">
            {POST_TYPE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                className={postType === opt.value ? 'active' : ''}
                onClick={() => setPostType(opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <label>
            <textarea
              placeholder="O que voce quer compartilhar?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={3}
            />
          </label>
          {/* Photo upload */}
          <input ref={feedFileRef} type="file" accept="image/*,video/*" style={{ display: 'none' }} onChange={handleFileUpload} />
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <button type="button" onClick={() => feedFileRef.current?.click()} disabled={uploading}
              style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px', borderRadius: 8, border: '1px solid var(--color-border)', background: '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 500 }}>
              <Image size={14} /> {uploading ? 'Enviando...' : 'Fototeca'}
            </button>
            <button type="button" onClick={() => { if (feedFileRef.current) { feedFileRef.current.setAttribute('capture', 'environment'); feedFileRef.current.click(); } }}
              style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px', borderRadius: 8, border: '1px solid var(--color-border)', background: '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 500 }}>
              <Camera size={14} /> Camera
            </button>
          </div>
          {mediaUrl && (
            <div style={{ marginBottom: 12, position: 'relative' }}>
              <img src={mediaUrl} alt="" style={{ width: '100%', maxHeight: 200, objectFit: 'cover', borderRadius: 10 }} />
              <button type="button" onClick={() => setMediaUrl('')} style={{ position: 'absolute', top: 6, right: 6, background: 'rgba(0,0,0,0.6)', border: 'none', color: '#fff', borderRadius: '50%', width: 24, height: 24, cursor: 'pointer', fontSize: 14 }}>x</button>
            </div>
          )}
          {error && <div className="error">{error}</div>}
          <button type="submit" disabled={submitting || !content.trim()}>
            {submitting ? 'Publicando...' : 'Publicar'}
          </button>
        </form>
      </section>

      {/* Feed */}
      {loading ? (
        <p className="muted" style={{ textAlign: 'center', padding: '32px 0' }}>
          Carregando...
        </p>
      ) : posts.length === 0 ? (
        <div className="card" style={{ textAlign: 'center' }}>
          <p className="muted">Nenhuma publicacao ainda. Seja a primeira!</p>
        </div>
      ) : (
        <>
          {posts.map((post) => (
            <FeedCard
              key={post.id}
              post={post}
              onLike={handleLike}
              onComment={handleComment}
              onReaction={handleReaction}
              onDelete={handleDelete}
              currentUserId={currentUser?.id ?? ''}
            />
          ))}

          {loadingMore && (
            <p className="muted" style={{ textAlign: 'center', padding: '16px 0' }}>
              Carregando mais...
            </p>
          )}

          <div ref={sentinelRef} className="feed-sentinel" />
        </>
      )}

      {/* Comments modal */}
      {commentsPostId && (
        <CommentsModal
          open={!!commentsPostId}
          postId={commentsPostId}
          onClose={handleCloseComments}
        />
      )}
    </Layout>
  );
}
