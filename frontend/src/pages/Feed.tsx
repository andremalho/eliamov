import React, { useCallback, useEffect, useRef, useState } from 'react';
import Layout from '../components/Layout';
import FeedCard from '../components/FeedCard';
import CommentsModal from '../components/CommentsModal';
import { feedApi, FeedPost, PostType, ReactionType } from '../services/feed.api';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { Camera, Image, RefreshCw, MessageSquarePlus, User } from 'lucide-react';
import { useGamification } from '../contexts/GamificationContext';
import { SkeletonFeed } from '../components/Skeleton';

const POST_TYPE_OPTIONS: { value: PostType; label: string }[] = [
  { value: 'free', label: 'Texto livre' },
  { value: 'workout', label: 'Treino' },
  { value: 'achievement', label: 'Conquista' },
];

const s = {
  card: {
    background: '#fff',
    border: '1px solid #E5E7EB',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
  } as React.CSSProperties,
  title: {
    fontFamily: 'DM Sans, sans-serif',
    fontSize: 15,
    fontWeight: 600,
    color: '#111827',
    margin: 0,
  } as React.CSSProperties,
  muted: {
    fontFamily: 'DM Sans, sans-serif',
    fontSize: 13,
    color: '#6B7280',
  } as React.CSSProperties,
  mutedSmall: {
    fontFamily: 'DM Sans, sans-serif',
    fontSize: 11,
    color: '#6B7280',
  } as React.CSSProperties,
  pill: (active: boolean) => ({
    fontFamily: 'DM Sans, sans-serif',
    fontSize: 12,
    fontWeight: 500,
    padding: '5px 12px',
    borderRadius: 20,
    border: active ? '1.5px solid #7C3AED' : '1px solid #E5E7EB',
    background: active ? '#F3EEFF' : '#fff',
    color: active ? '#7C3AED' : '#6B7280',
    cursor: 'pointer',
    transition: 'all 0.15s',
  } as React.CSSProperties),
  textarea: {
    fontFamily: 'DM Sans, sans-serif',
    fontSize: 14,
    color: '#111827',
    width: '100%',
    border: 'none',
    outline: 'none',
    resize: 'none' as const,
    padding: 0,
    background: 'transparent',
    lineHeight: 1.5,
  } as React.CSSProperties,
  mediaBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 5,
    padding: '6px 12px',
    borderRadius: 8,
    border: '1px solid #E5E7EB',
    background: '#F9FAFB',
    cursor: 'pointer',
    fontFamily: 'DM Sans, sans-serif',
    fontSize: 12,
    fontWeight: 500,
    color: '#6B7280',
    transition: 'background 0.15s',
  } as React.CSSProperties,
  submitBtn: (disabled: boolean) => ({
    fontFamily: 'DM Sans, sans-serif',
    fontSize: 13,
    fontWeight: 600,
    padding: '8px 20px',
    borderRadius: 10,
    border: 'none',
    background: disabled ? '#D1D5DB' : '#7C3AED',
    color: '#fff',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'background 0.15s',
  } as React.CSSProperties),
  error: {
    fontFamily: 'DM Sans, sans-serif',
    fontSize: 13,
    color: '#dc2626',
    background: '#FEF2F2',
    border: '1px solid #FECACA',
    borderRadius: 10,
    padding: '8px 12px',
    marginBottom: 12,
  } as React.CSSProperties,
};

export default function Feed() {
  const { currentUser } = useAuth();
  const { rewardXP } = useGamification();
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
      rewardXP(20, 'post');
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Falha ao criar publicacao';
      setError(Array.isArray(msg) ? msg.join(', ') : msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Optimistic like
  const handleLike = async (postId: string, liked: boolean) => {
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
    loadFeed();
  };

  return (
    <Layout title="Feed" subtitle="Veja o que suas colegas de academia estao fazendo.">
      {/* Pull to refresh hint */}
      <div style={{ textAlign: 'center', padding: '4px 0 12px' }}>
        <button
          type="button"
          onClick={() => { setLoading(true); loadFeed(); }}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            background: 'none', border: 'none', cursor: 'pointer',
            fontFamily: 'DM Sans, sans-serif', fontSize: 11, color: '#9CA3AF',
          }}
        >
          <RefreshCw size={12} /> Puxe para atualizar
        </button>
      </div>

      {/* Create post card */}
      <section style={s.card}>
        <form onSubmit={handleSubmit}>
          {/* Avatar + Textarea row */}
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: '#F3EEFF', display: 'flex', alignItems: 'center',
              justifyContent: 'center', flexShrink: 0,
            }}>
              <User size={18} color="#7C3AED" />
            </div>
            <textarea
              style={s.textarea}
              placeholder="No que voce esta pensando?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={3}
            />
          </div>

          {/* Media preview */}
          {mediaUrl && (
            <div style={{ marginTop: 12, position: 'relative' }}>
              <img src={mediaUrl} alt="" style={{
                width: '100%', maxHeight: 200, objectFit: 'cover', borderRadius: 10,
              }} />
              <button
                type="button"
                onClick={() => setMediaUrl('')}
                style={{
                  position: 'absolute', top: 6, right: 6,
                  background: 'rgba(0,0,0,0.55)', border: 'none', color: '#fff',
                  borderRadius: '50%', width: 24, height: 24, cursor: 'pointer',
                  fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                x
              </button>
            </div>
          )}

          {/* Divider */}
          <div style={{ borderTop: '1px solid #F3F4F6', margin: '12px 0' }} />

          {/* Bottom toolbar: buttons + pills + submit */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            {/* Photo / Camera buttons */}
            <input ref={feedFileRef} type="file" accept="image/*,video/*" style={{ display: 'none' }} onChange={handleFileUpload} />
            <button type="button" onClick={() => feedFileRef.current?.click()} disabled={uploading} style={s.mediaBtn}>
              <Image size={14} color="#7C3AED" /> {uploading ? 'Enviando...' : 'Foto'}
            </button>
            <button
              type="button"
              onClick={() => {
                if (feedFileRef.current) {
                  feedFileRef.current.setAttribute('capture', 'environment');
                  feedFileRef.current.click();
                }
              }}
              style={s.mediaBtn}
            >
              <Camera size={14} color="#7C3AED" /> Camera
            </button>

            {/* Separator */}
            <div style={{ width: 1, height: 20, background: '#E5E7EB', margin: '0 2px' }} />

            {/* Post type pills */}
            {POST_TYPE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                style={s.pill(postType === opt.value)}
                onClick={() => setPostType(opt.value)}
              >
                {opt.label}
              </button>
            ))}

            {/* Spacer */}
            <div style={{ flex: 1 }} />

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting || !content.trim()}
              style={s.submitBtn(submitting || !content.trim())}
            >
              {submitting ? 'Publicando...' : 'Publicar'}
            </button>
          </div>

          {error && <div style={{ ...s.error, marginTop: 12 }}>{error}</div>}
        </form>
      </section>

      {/* Feed */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '48px 0' }}>
          <div style={{
            width: 32, height: 32, border: '3px solid #E5E7EB',
            borderTopColor: '#7C3AED', borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto 12px',
          }} />
          <SkeletonFeed />
        </div>
      ) : posts.length === 0 ? (
        <div style={{
          ...s.card,
          textAlign: 'center',
          padding: '48px 24px',
        }}>
          <div style={{
            width: 56, height: 56, borderRadius: '50%',
            background: '#F3EEFF', display: 'flex', alignItems: 'center',
            justifyContent: 'center', margin: '0 auto 16px',
          }}>
            <MessageSquarePlus size={26} color="#7C3AED" />
          </div>
          <p style={{
            fontFamily: 'DM Sans, sans-serif', fontSize: 15,
            fontWeight: 600, color: '#111827', margin: '0 0 6px',
          }}>
            Nenhuma publicacao ainda
          </p>
          <p style={{ ...s.muted, margin: 0 }}>
            Seja a primeira a compartilhar algo com o grupo!
          </p>
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
            <p style={{ ...s.muted, textAlign: 'center', padding: '16px 0' }}>
              Carregando mais...
            </p>
          )}

          <div ref={sentinelRef} style={{ height: 1 }} />
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
