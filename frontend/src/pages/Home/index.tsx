import React, { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { cycleApi, CurrentPhase } from '../../services/cycle.api';
import { feedApi, FeedPost } from '../../services/feed.api';
import { contentApi, Article } from '../../services/content.api';
import {
  Bell, Plus, Sun, Zap, ArrowRight, Heart, MessageCircle,
  Home as HomeIcon, Users, User, BookOpen, Play, Flame,
  Droplets, Sprout, Moon,
} from 'lucide-react';

/* ── palette ─────────────────────────────────────────────────── */
const C = {
  bg: '#F9FAFB', header: '#2D1B4E', violet: '#7C3AED', pink: '#F472B6',
  text: '#111827', muted: '#6B7280', border: '#E5E7EB', lilac: '#C4B5FD',
  offWhite: '#F9FAFB', violetSoft: '#EDE9FE',
};

const PHASE_COLORS: Record<string, string> = {
  follicular: '#22C55E', ovulatory: '#D97706', luteal: '#EA580C', menstrual: '#DB2777',
};

const PHASE_INFO: Record<string, { label: string; energy: string }> = {
  follicular: { label: 'folicular', energy: 'energia alta' },
  ovulatory: { label: 'ovulatoria', energy: 'pico de disposicao' },
  luteal: { label: 'lutea', energy: 'recolhimento' },
  menstrual: { label: 'menstrual', energy: 'autocuidado' },
};

const PhaseIcon: React.FC<{ phase: string | null; size?: number }> = ({ phase, size = 28 }) => {
  switch (phase) {
    case 'menstrual': return <Droplets size={size} color={C.lilac} />;
    case 'follicular': return <Sprout size={size} color={C.lilac} />;
    case 'ovulatory': return <Sun size={size} color={C.lilac} />;
    case 'luteal': return <Moon size={size} color={C.lilac} />;
    default: return <Sun size={size} color={C.lilac} />;
  }
};

const ContentIcon: React.FC<{ cat: string; color: string }> = ({ cat, color }) => {
  if (cat?.includes('treino') || cat?.includes('video')) return <Play size={22} color={color} />;
  if (cat?.includes('nutri')) return <Flame size={22} color={color} />;
  return <BookOpen size={22} color={color} />;
};

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Bom dia';
  if (h < 18) return 'Boa tarde';
  return 'Boa noite';
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0]?.toUpperCase() ?? '?';
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'agora';
  if (mins < 60) return `ha ${mins}min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `ha ${hrs}h`;
  const days = Math.floor(hrs / 24);
  return `ha ${days}d`;
}

/* ── component ───────────────────────────────────────────────── */
export default function Home() {
  const { currentUser } = useAuth();
  const [phase, setPhase] = useState<CurrentPhase | null>(null);
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  const userName = currentUser?.name?.split(' ')[0] ?? 'Voce';

  useEffect(() => {
    const load = async () => {
      try {
        const [phaseRes, feedRes] = await Promise.all([
          cycleApi.current().catch(() => null),
          feedApi.getFeed(undefined, 3).catch(() => ({ data: [], nextCursor: null })),
        ]);
        setPhase(phaseRes);
        setPosts(feedRes.data);
        setLikedPosts(Object.fromEntries(feedRes.data.map((p: FeedPost) => [p.id, p.liked])));

        const phaseName = phaseRes?.phase ?? undefined;
        const contentRes = await contentApi
          .listArticles({ phase: phaseName, page: 1 })
          .catch(() => ({ data: [], total: 0, page: 1, limit: 10, totalPages: 0 }));
        setArticles(contentRes.data.slice(0, 5));
      } catch { /* ignore */ }
      setLoading(false);
    };
    load();
  }, []);

  const currentPhase = phase?.phase ?? null;
  const phaseInfo = PHASE_INFO[currentPhase ?? ''] ?? { label: '—', energy: '' };
  const phaseColor = PHASE_COLORS[currentPhase ?? ''] ?? '#9CA3AF';

  const toggleLike = async (postId: string) => {
    const wasLiked = likedPosts[postId];
    setLikedPosts(prev => ({ ...prev, [postId]: !wasLiked }));
    try {
      if (wasLiked) await feedApi.unlike(postId);
      else await feedApi.like(postId);
    } catch {
      setLikedPosts(prev => ({ ...prev, [postId]: wasLiked }));
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: C.muted, fontFamily: "'DM Sans', sans-serif" }}>Carregando...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 430, margin: '0 auto', background: C.bg, minHeight: '100vh', position: 'relative', fontFamily: "'DM Sans', sans-serif" }}>

      {/* ── STATUS BAR ─────────────────────────────────────────── */}
      <div style={{ background: C.header, padding: '8px 20px', display: 'flex', justifyContent: 'space-between', fontSize: 12, color: C.lilac }}>
        <span>{new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
        <div style={{ display: 'flex', gap: 6 }}><Zap size={12} /><span>100%</span></div>
      </div>

      {/* ── HEADER ─────────────────────────────────────────────── */}
      <div style={{ background: C.header, padding: '12px 20px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 42, height: 42, borderRadius: '50%', background: C.violet, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.violetSoft, fontWeight: 700, fontSize: 16, flexShrink: 0 }}>
          {getInitials(currentUser?.name ?? '?')}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, fontWeight: 600, color: C.offWhite, lineHeight: 1.2 }}>
            {getGreeting()}, {userName}
          </div>
          {currentPhase && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: phaseColor, display: 'inline-block' }} />
              <span style={{ fontSize: 12, color: phaseColor }}>fase {phaseInfo.label} — {phaseInfo.energy}</span>
            </div>
          )}
        </div>
        <Link to="/notifications" style={{ width: 38, height: 38, borderRadius: '50%', border: 'none', background: 'rgba(255,255,255,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
          <Bell size={18} color={C.offWhite} />
        </Link>
      </div>

      {/* ── SCROLLABLE ─────────────────────────────────────────── */}
      <div style={{ paddingBottom: 80 }}>

        {/* ── PHASE CARD ───────────────────────────────────────── */}
        {currentPhase && (
          <div style={{ margin: '16px 20px', background: C.header, borderRadius: 20, padding: '18px 20px', position: 'relative', overflow: 'hidden', boxShadow: '0 4px 20px rgba(124,58,237,0.08)' }}>
            <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, borderRadius: '50%', background: 'rgba(124,58,237,0.15)' }} />
            <div style={{ position: 'absolute', bottom: -10, left: -10, width: 60, height: 60, borderRadius: '50%', background: 'rgba(244,114,182,0.10)' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, position: 'relative', zIndex: 1 }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(196,181,253,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <PhaseIcon phase={currentPhase} />
              </div>
              <div>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 600, color: C.offWhite }}>Fase {phaseInfo.label}</div>
                <div style={{ fontSize: 12, color: C.lilac }}>Dia {phase?.dayOfCycle ?? '—'} do ciclo</div>
              </div>
            </div>
            <div style={{ marginTop: 14, position: 'relative', zIndex: 1 }}>
              <Link to="/training" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: C.violet, color: '#fff', borderRadius: 999, padding: '8px 16px', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
                Ver plano de hoje <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        )}

        {/* ── NO CYCLE DATA ────────────────────────────────────── */}
        {!currentPhase && (
          <div style={{ margin: '16px 20px', background: '#fff', borderRadius: 16, padding: '18px 20px', border: `0.5px solid ${C.border}` }}>
            <div style={{ fontSize: 14, fontWeight: 500, color: C.text, marginBottom: 6 }}>Registre seu ciclo</div>
            <p style={{ fontSize: 13, color: C.muted, marginBottom: 12 }}>Registre seu ciclo menstrual para receber planos personalizados.</p>
            <Link to="/cycle" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: C.violet, color: '#fff', borderRadius: 999, padding: '8px 16px', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
              Registrar ciclo <ArrowRight size={13} />
            </Link>
          </div>
        )}

        {/* ── QUICK ACTIONS ────────────────────────────────────── */}
        <div style={{ display: 'flex', gap: 10, padding: '0 20px', marginBottom: 16 }}>
          {[
            { to: '/cycle', label: 'Ciclo', Icon: Droplets, color: '#DB2777' },
            { to: '/nutrition', label: 'Nutricao', Icon: Flame, color: '#EA580C' },
            { to: '/training', label: 'Treino', Icon: Zap, color: '#7C3AED' },
            { to: '/mood', label: 'Humor', Icon: Heart, color: '#EC4899' },
          ].map(({ to, label, Icon, color }) => (
            <Link key={to} to={to} style={{ flex: 1, background: '#fff', borderRadius: 14, padding: '12px 8px', border: `0.5px solid ${C.border}`, textDecoration: 'none', textAlign: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.03)' }}>
              <Icon size={20} color={color} style={{ marginBottom: 4 }} />
              <div style={{ fontSize: 11, fontWeight: 500, color: C.text }}>{label}</div>
            </Link>
          ))}
        </div>

        {/* ── FEED PREVIEW ─────────────────────────────────────── */}
        <div style={{ padding: '0 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '8px 0 10px' }}>
            <span style={{ fontSize: 12, fontWeight: 500, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 0.5 }}>Na sua academia</span>
            <Link to="/feed" style={{ fontSize: 12, fontWeight: 600, color: C.violet, textDecoration: 'none' }}>ver tudo</Link>
          </div>

          {posts.length === 0 && (
            <div style={{ background: '#fff', borderRadius: 16, border: `0.5px solid ${C.border}`, padding: '20px 16px', textAlign: 'center' }}>
              <p style={{ fontSize: 13, color: C.muted }}>Nenhuma atividade recente na sua academia.</p>
              <Link to="/feed" style={{ fontSize: 13, color: C.violet, fontWeight: 600, textDecoration: 'none' }}>Ir para o feed</Link>
            </div>
          )}

          {posts.map((post) => (
            <div key={post.id} style={{ background: '#fff', borderRadius: 16, border: `0.5px solid ${C.border}`, padding: '14px 16px', marginBottom: 10, boxShadow: '0 4px 20px rgba(124,58,237,0.08)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: '50%', background: C.header, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.lilac, fontWeight: 700, fontSize: 12, flexShrink: 0 }}>
                  {getInitials(post.user?.name ?? '?')}
                </div>
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{post.user?.name ?? 'Aluna'}</span>
                  <span style={{ fontSize: 11, color: '#9CA3AF', marginLeft: 6 }}>{timeAgo(post.createdAt)}</span>
                </div>
              </div>
              {post.content && <div style={{ fontSize: 13, color: '#374151', lineHeight: 1.5, marginBottom: 10 }}>{post.content}</div>}
              <div style={{ display: 'flex', gap: 16 }}>
                <button onClick={() => toggleLike(post.id)} style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, padding: 0, color: likedPosts[post.id] ? '#DB2777' : '#9CA3AF', transition: 'color 0.15s' }}>
                  <Heart size={16} fill={likedPosts[post.id] ? '#DB2777' : 'none'} />
                  {post.likesCount}
                </button>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#9CA3AF' }}>
                  <MessageCircle size={16} /> {post.commentsCount}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* ── CONTENT CAROUSEL ─────────────────────────────────── */}
        {articles.length > 0 && (
          <>
            <div style={{ padding: '0 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '16px 0 10px' }}>
                <span style={{ fontSize: 12, fontWeight: 500, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Para voce hoje{currentPhase ? ` — fase ${phaseInfo.label}` : ''}
                </span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, overflowX: 'auto', padding: '0 20px 20px', scrollbarWidth: 'none' }}>
              {articles.map((article) => {
                const catSlug = article.category?.slug ?? '';
                const isCiclo = catSlug.includes('ciclo');
                const isTreino = catSlug.includes('treino');
                const bg = isCiclo ? '#EDE9FE' : isTreino ? '#DCFCE7' : '#FEF3C7';
                const iconColor = isCiclo ? '#7C3AED' : isTreino ? '#166534' : '#92400E';
                return (
                  <div key={article.id} style={{ minWidth: 148, maxWidth: 148, borderRadius: 14, border: `0.5px solid ${C.border}`, background: '#fff', overflow: 'hidden', flexShrink: 0, cursor: 'pointer', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
                    <div style={{ height: 76, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {article.coverImageUrl
                        ? <img src={article.coverImageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <ContentIcon cat={catSlug} color={iconColor} />
                      }
                    </div>
                    <div style={{ padding: '8px 10px 10px' }}>
                      <div style={{ fontSize: 9, fontWeight: 600, textTransform: 'uppercase', color: iconColor, marginBottom: 4, letterSpacing: 0.5 }}>
                        {article.category?.name ?? 'Artigo'}
                      </div>
                      <div style={{ fontSize: 11, fontWeight: 500, color: C.text, lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const, overflow: 'hidden' }}>
                        {article.title}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* ── TAB BAR ────────────────────────────────────────────── */}
      <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 430, background: '#fff', borderTop: `0.5px solid ${C.border}`, display: 'flex', padding: '8px 0 env(safe-area-inset-bottom, 8px)', zIndex: 50 }}>
        {[
          { to: '/home', label: 'Home', Icon: HomeIcon },
          { to: '/training', label: 'Treino', Icon: Zap },
          { to: '/feed', label: 'Social', Icon: Heart },
          { to: '/communities', label: 'Grupos', Icon: Users },
          { to: '/profile', label: 'Perfil', Icon: User },
        ].map(({ to, label, Icon }) => (
          <NavLink key={to} to={to} style={({ isActive }) => ({ flex: 1, display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: 2, textDecoration: 'none', padding: '4px 0', color: isActive ? C.violet : '#9CA3AF', fontSize: 9, fontWeight: 500 })}>
            <Icon size={22} />
            <span>{label}</span>
          </NavLink>
        ))}
      </div>
    </div>
  );
}
