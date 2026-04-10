import React, { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { cycleApi, CurrentPhase } from '../../services/cycle.api';
import { feedApi, FeedPost } from '../../services/feed.api';
import { contentApi, Article } from '../../services/content.api';
import {
  Plus, Sun, Zap, ArrowRight, Heart, MessageCircle,
  Home as HomeIcon, Users, User, BookOpen, Play, Flame,
  Droplets, Sprout, Moon, Activity, Dumbbell, Apple, Brain, LogOut,
} from 'lucide-react';
import Logo from '../../components/Logo';

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

const PhaseIcon: React.FC<{ phase: string | null; size?: number; color?: string }> = ({ phase, size = 28, color = C.lilac }) => {
  switch (phase) {
    case 'menstrual': return <Droplets size={size} color={color} />;
    case 'follicular': return <Sprout size={size} color={color} />;
    case 'ovulatory': return <Sun size={size} color={color} />;
    case 'luteal': return <Moon size={size} color={color} />;
    default: return <Sun size={size} color={color} />;
  }
};

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Bom dia';
  if (h < 18) return 'Boa tarde';
  return 'Boa noite';
}
function getInitials(name: string): string {
  const p = name.trim().split(/\s+/);
  return p.length === 1 ? (p[0][0]?.toUpperCase() ?? '?') : (p[0][0] + p[p.length - 1][0]).toUpperCase();
}
function timeAgo(iso: string): string {
  const d = Date.now() - new Date(iso).getTime();
  const m = Math.floor(d / 60000);
  if (m < 1) return 'agora';
  if (m < 60) return `ha ${m}min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `ha ${h}h`;
  return `ha ${Math.floor(h / 24)}d`;
}

const GOAL_TIPS: Record<string, { title: string; text: string }[]> = {
  weight_loss: [
    { title: 'Deficit calorico', text: 'Um deficit de 500 kcal/dia leva a perda de ~0.5kg/semana.' },
    { title: 'Proteina', text: 'Consumir 1.4g/kg de proteina ajuda a preservar massa muscular.' },
  ],
  health: [
    { title: 'Atividade fisica', text: '150 minutos de exercicio moderado por semana e recomendado.' },
    { title: 'Hidratacao', text: 'Beba pelo menos 2 litros de agua por dia.' },
  ],
  strength: [
    { title: 'Treino progressivo', text: 'Aumente a carga gradualmente a cada semana.' },
    { title: 'Recuperacao', text: 'Descanse 48h entre treinos do mesmo grupo muscular.' },
  ],
};

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
    (async () => {
      try {
        const [ph, fd] = await Promise.all([
          cycleApi.current().catch(() => null),
          feedApi.getFeed(undefined, 3).catch(() => ({ data: [] as FeedPost[], nextCursor: null })),
        ]);
        setPhase(ph);
        setPosts(fd.data);
        setLikedPosts(Object.fromEntries(fd.data.map((p: FeedPost) => [p.id, p.liked])));
        const ct = await contentApi.listArticles({ phase: ph?.phase ?? undefined, page: 1 }).catch(() => ({ data: [] as Article[], total: 0, page: 1, limit: 10, totalPages: 0 }));
        setArticles(ct.data.slice(0, 5));
      } catch { /* ignore */ }
      setLoading(false);
    })();
  }, []);

  const cp = phase?.phase ?? null;
  const pi = PHASE_INFO[cp ?? ''] ?? { label: '--', energy: '' };
  const pc = PHASE_COLORS[cp ?? ''] ?? '#9CA3AF';

  const toggleLike = async (id: string) => {
    const was = likedPosts[id];
    setLikedPosts(p => ({ ...p, [id]: !was }));
    try { if (was) await feedApi.unlike(id); else await feedApi.like(id); }
    catch { setLikedPosts(p => ({ ...p, [id]: was })); }
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: C.muted, fontFamily: "'DM Sans', sans-serif" }}>Carregando...</p>
    </div>
  );

  /* ── Sidebar for desktop ────────────────────────────────────── */
  const sidebar = (
    <aside className="home-sidebar">
      <div style={{ padding: '24px 20px 16px' }}><Logo size={24} variant="dark" /></div>
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 2, padding: '0 12px' }}>
        {[
          { to: '/home', label: 'Home', Icon: HomeIcon },
          { to: '/cycle', label: 'Ciclo', Icon: Droplets },
          { to: '/training', label: 'Treino', Icon: Dumbbell },
          { to: '/nutrition', label: 'Nutricao', Icon: Apple },
          { to: '/mood', label: 'Humor', Icon: Heart },
          { to: '/feed', label: 'Feed Social', Icon: MessageCircle },
          { to: '/communities', label: 'Comunidades', Icon: Users },
          { to: '/challenges', label: 'Desafios', Icon: Zap },
          { to: '/content', label: 'Conteudo', Icon: BookOpen },
          { to: '/insights', label: 'Insights IA', Icon: Brain },
          { to: '/profile', label: 'Perfil', Icon: User },
        ].map(({ to, label, Icon }) => (
          <NavLink key={to} to={to} className="home-sidebar-link" style={({ isActive }) => ({
            display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
            borderRadius: 10, textDecoration: 'none', fontSize: 14, fontWeight: 500,
            color: isActive ? C.violet : C.muted,
            background: isActive ? C.violetSoft : 'transparent',
            transition: 'all 0.15s',
          })}>
            <Icon size={18} /> {label}
          </NavLink>
        ))}
      </nav>
      <div style={{ padding: '16px 12px', marginTop: 'auto', borderTop: '1px solid #E5E7EB' }}>
        <button onClick={() => { localStorage.removeItem('eliamov_token'); window.location.href = '/login'; }} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 500, color: '#DC2626', width: '100%' }}>
          <LogOut size={18} /> Sair
        </button>
      </div>
    </aside>
  );

  /* ── Feed post card (reused) ────────────────────────────────── */
  const renderPost = (post: FeedPost) => (
    <div key={post.id} style={{ background: '#fff', borderRadius: 16, border: `0.5px solid ${C.border}`, padding: '14px 16px', marginBottom: 10, boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
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
        <button onClick={() => toggleLike(post.id)} style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, padding: 0, color: likedPosts[post.id] ? '#DB2777' : '#9CA3AF' }}>
          <Heart size={16} fill={likedPosts[post.id] ? '#DB2777' : 'none'} /> {post.likesCount}
        </button>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#9CA3AF' }}>
          <MessageCircle size={16} /> {post.commentsCount}
        </span>
      </div>
    </div>
  );

  /* ── Article card (reused) ──────────────────────────────────── */
  const renderArticle = (article: Article) => {
    const cat = article.category?.slug ?? '';
    const isCiclo = cat.includes('ciclo');
    const isTreino = cat.includes('treino');
    const bg = isCiclo ? '#EDE9FE' : isTreino ? '#DCFCE7' : '#FEF3C7';
    const ic = isCiclo ? '#7C3AED' : isTreino ? '#166534' : '#92400E';
    return (
      <div key={article.id} style={{ minWidth: 180, flex: '1 1 180px', maxWidth: 240, borderRadius: 14, border: `0.5px solid ${C.border}`, background: '#fff', overflow: 'hidden', cursor: 'pointer', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
        <div style={{ height: 90, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {article.coverImageUrl ? <img src={article.coverImageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : isTreino ? <Play size={24} color={ic} /> : isCiclo ? <BookOpen size={24} color={ic} /> : <Flame size={24} color={ic} />}
        </div>
        <div style={{ padding: '10px 12px' }}>
          <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', color: ic, marginBottom: 4 }}>{article.category?.name ?? 'Artigo'}</div>
          <div style={{ fontSize: 13, fontWeight: 500, color: C.text, lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const, overflow: 'hidden' }}>{article.title}</div>
        </div>
      </div>
    );
  };

  return (
    <>
      <style>{`
        .home-layout { display: flex; min-height: 100vh; background: ${C.bg}; font-family: 'DM Sans', sans-serif; }
        .home-sidebar { display: none; width: 240px; border-right: 1px solid ${C.border}; background: #fff; flex-shrink: 0; position: sticky; top: 0; height: 100vh; overflow-y: auto; flex-direction: column; }
        .home-main { flex: 1; max-width: 900px; }
        .home-mobile-tab { display: flex; position: fixed; bottom: 0; left: 0; right: 0; background: #fff; border-top: 0.5px solid ${C.border}; padding: 8px 0 env(safe-area-inset-bottom, 8px); z-index: 50; }
        .home-desktop-grid { display: flex; flex-direction: column; gap: 16px; }
        @media (min-width: 768px) {
          .home-sidebar { display: block; }
          .home-mobile-tab { display: none; }
          .home-main { padding: 0 32px; }
          .home-desktop-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
          .home-feed-content { display: grid; grid-template-columns: 2fr 1fr; gap: 24px; }
        }
        @media (min-width: 1200px) { .home-main { max-width: 960px; } }
      `}</style>

      <div className="home-layout">
        {sidebar}

        <div className="home-main">
          {/* ── HEADER ─────────────────────────────────────────── */}
          <div style={{ background: C.header, padding: '16px 24px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: C.violet, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.violetSoft, fontWeight: 700, fontSize: 16, flexShrink: 0 }}>
              {getInitials(currentUser?.name ?? '?')}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, fontWeight: 600, color: C.offWhite, lineHeight: 1.2 }}>
                {getGreeting()}, {userName}
              </div>
              {cp && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: pc, display: 'inline-block' }} />
                  <span style={{ fontSize: 12, color: pc }}>fase {pi.label} — {pi.energy}</span>
                </div>
              )}
            </div>
            <button onClick={() => { localStorage.removeItem('eliamov_token'); window.location.href = '/login'; }} title="Sair" style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer' }}>
              <LogOut size={18} color="#F9FAFB" />
            </button>
          </div>

          {/* ── CONTENT AREA ───────────────────────────────────── */}
          <div style={{ padding: '20px 20px 100px' }}>

            {/* Quick actions */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
              {[
                { to: '/cycle', label: 'Ciclo', Icon: Droplets, color: '#DB2777' },
                { to: '/nutrition', label: 'Nutricao', Icon: Flame, color: '#EA580C' },
                { to: '/training', label: 'Treino', Icon: Zap, color: '#7C3AED' },
                { to: '/mood', label: 'Humor', Icon: Heart, color: '#EC4899' },
              ].map(({ to, label, Icon, color }) => (
                <Link key={to} to={to} style={{ flex: '1 1 70px', background: '#fff', borderRadius: 14, padding: '14px 8px', border: `0.5px solid ${C.border}`, textDecoration: 'none', textAlign: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.03)' }}>
                  <Icon size={20} color={color} style={{ marginBottom: 4 }} />
                  <div style={{ fontSize: 11, fontWeight: 500, color: C.text }}>{label}</div>
                </Link>
              ))}
            </div>

            {/* Desktop: 2-column grid for phase + workout */}
            <div className="home-desktop-grid" style={{ marginBottom: 20 }}>
              {/* Phase card */}
              {cp ? (
                <div style={{ background: C.header, borderRadius: 20, padding: '20px', position: 'relative', overflow: 'hidden', boxShadow: '0 4px 20px rgba(124,58,237,0.08)' }}>
                  <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, borderRadius: '50%', background: 'rgba(124,58,237,0.15)' }} />
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, position: 'relative', zIndex: 1 }}>
                    <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(196,181,253,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <PhaseIcon phase={cp} />
                    </div>
                    <div>
                      <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 600, color: C.offWhite }}>Fase {pi.label}</div>
                      <div style={{ fontSize: 12, color: C.lilac }}>Dia {phase?.dayOfCycle ?? '--'} do ciclo</div>
                    </div>
                  </div>
                  <div style={{ marginTop: 16, position: 'relative', zIndex: 1 }}>
                    <Link to="/cycle" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: C.violet, color: '#fff', borderRadius: 999, padding: '8px 16px', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
                      Ver detalhes <ArrowRight size={13} />
                    </Link>
                  </div>
                </div>
              ) : (
                <div style={{ background: '#fff', borderRadius: 16, padding: '20px', border: `0.5px solid ${C.border}` }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: C.text, marginBottom: 6 }}>Registre seu ciclo</div>
                  <p style={{ fontSize: 13, color: C.muted, marginBottom: 12 }}>Registre seu ciclo menstrual para receber planos personalizados.</p>
                  <Link to="/cycle" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: C.violet, color: '#fff', borderRadius: 999, padding: '8px 16px', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
                    Registrar <ArrowRight size={13} />
                  </Link>
                </div>
              )}

              {/* Training card */}
              <div style={{ background: '#fff', borderRadius: 16, padding: '20px', border: `0.5px solid ${C.border}`, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: C.text, marginBottom: 6 }}>Treino</div>
                  <p style={{ fontSize: 13, color: C.muted, marginBottom: 12 }}>
                    {cp ? `Plano adaptado para fase ${pi.label}.` : 'Acesse seus treinos e atividades.'}
                  </p>
                </div>
                <Link to="/training" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: C.violet, color: '#fff', borderRadius: 999, padding: '8px 16px', fontSize: 13, fontWeight: 600, textDecoration: 'none', alignSelf: 'flex-start' }}>
                  Ver treinos <ArrowRight size={13} />
                </Link>
              </div>
            </div>

            {/* Feed + sidebar content area */}
            <div className="home-feed-content">
              {/* Feed section */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: C.text }}>Na sua academia</span>
                  <Link to="/feed" style={{ fontSize: 12, fontWeight: 600, color: C.violet, textDecoration: 'none' }}>ver tudo</Link>
                </div>
                {posts.length === 0 ? (
                  <div style={{ background: '#fff', borderRadius: 16, border: `0.5px solid ${C.border}`, padding: '24px 16px', textAlign: 'center' }}>
                    <p style={{ fontSize: 13, color: C.muted, marginBottom: 8 }}>Nenhuma atividade recente.</p>
                    <Link to="/feed" style={{ fontSize: 13, color: C.violet, fontWeight: 600, textDecoration: 'none' }}>Ir para o feed</Link>
                  </div>
                ) : posts.map(renderPost)}
              </div>

              {/* Content section */}
              <div>
                <div style={{ marginBottom: 12 }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: C.text }}>
                    Conteudo{cp ? ` — fase ${pi.label}` : ''}
                  </span>
                </div>
                {articles.length === 0 ? (
                  <div style={{ background: '#fff', borderRadius: 16, border: `0.5px solid ${C.border}`, padding: '24px 16px', textAlign: 'center' }}>
                    <p style={{ fontSize: 13, color: C.muted }}>Conteudo sendo preparado para voce.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {articles.map(renderArticle)}
                  </div>
                )}
              </div>
            </div>

            {articles.length === 0 && (
              <div style={{ marginTop: 20 }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: C.text }}>Dicas para voce</span>
                <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {(GOAL_TIPS[currentUser?.fitnessGoal ?? ''] ?? GOAL_TIPS.health ?? []).map((tip, i) => (
                    <div key={i} style={{ background: '#fff', borderRadius: 14, padding: '14px 16px', border: `0.5px solid ${C.border}` }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: C.violet, marginBottom: 4 }}>{tip.title}</div>
                      <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.5 }}>{tip.text}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── MOBILE TAB BAR ───────────────────────────────────── */}
        <div className="home-mobile-tab">
          {[
            { to: '/home', label: 'Home', Icon: HomeIcon },
            { to: '/training', label: 'Treino', Icon: Zap },
            { to: '/feed', label: 'Social', Icon: Heart },
            { to: '/communities', label: 'Grupos', Icon: Users },
            { to: '/profile', label: 'Perfil', Icon: User },
          ].map(({ to, label, Icon }) => (
            <NavLink key={to} to={to} style={({ isActive }) => ({
              flex: 1, display: 'flex', flexDirection: 'column' as const, alignItems: 'center',
              gap: 2, textDecoration: 'none', padding: '4px 0',
              color: isActive ? C.violet : '#9CA3AF', fontSize: 9, fontWeight: 500,
            })}>
              <Icon size={22} /> <span>{label}</span>
            </NavLink>
          ))}
        </div>
      </div>
    </>
  );
}
