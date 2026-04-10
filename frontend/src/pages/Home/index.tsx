import React, { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { cycleApi, CurrentPhase } from '../../services/cycle.api';
import { feedApi, FeedPost } from '../../services/feed.api';
import { contentApi, Article } from '../../services/content.api';
import Logo from '../../components/Logo';
import {
  Sun, Zap, ArrowRight, Heart, MessageCircle, Droplets, Sprout, Moon,
  Flame, Dumbbell, Apple, BookOpen, Play, Menu, User, Users, LogOut,
  TrendingUp, Brain, Activity,
} from 'lucide-react';

const C = { violet: '#7C3AED', header: '#2D1B4E', lilac: '#C4B5FD', muted: '#6B7280', border: '#E5E7EB', text: '#111827' };

const PHASE_COLORS: Record<string, string> = { follicular: '#22C55E', ovulatory: '#D97706', luteal: '#EA580C', menstrual: '#DB2777' };
const PHASE_INFO: Record<string, { label: string; energy: string }> = {
  follicular: { label: 'folicular', energy: 'energia alta' },
  ovulatory: { label: 'ovulatoria', energy: 'pico de disposicao' },
  luteal: { label: 'lutea', energy: 'recolhimento' },
  menstrual: { label: 'menstrual', energy: 'autocuidado' },
};
const GOAL_TIPS: Record<string, { title: string; text: string }[]> = {
  weight_loss: [
    { title: 'Deficit calorico', text: 'Um deficit de 500 kcal/dia leva a perda de ~0.5kg/semana.' },
    { title: 'Proteina', text: '1.4g/kg de proteina preserva massa muscular.' },
    { title: 'Hidratacao', text: 'Beba pelo menos 2L de agua por dia.' },
  ],
  health: [
    { title: 'Atividade', text: '150 min de exercicio moderado por semana.' },
    { title: 'Sono', text: '7-9 horas de sono por noite.' },
    { title: 'Agua', text: 'Beba pelo menos 2L por dia.' },
  ],
  strength: [
    { title: 'Progressao', text: 'Aumente a carga gradualmente a cada semana.' },
    { title: 'Recuperacao', text: '48h entre treinos do mesmo grupo.' },
    { title: 'Proteina', text: '1.6-2g/kg para ganho muscular.' },
  ],
};

const PhaseIcon: React.FC<{ p: string | null }> = ({ p }) => {
  const s = { size: 24, color: '#fff' };
  if (p === 'menstrual') return <Droplets {...s} />;
  if (p === 'follicular') return <Sprout {...s} />;
  if (p === 'ovulatory') return <Sun {...s} />;
  if (p === 'luteal') return <Moon {...s} />;
  return <Sun {...s} />;
};

function greet() { const h = new Date().getHours(); return h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite'; }
function ini(n: string) { const p = n.trim().split(/\s+/); return p.length === 1 ? (p[0][0]?.toUpperCase() ?? '?') : (p[0][0] + p[p.length - 1][0]).toUpperCase(); }
function ago(iso: string) { const d = Date.now() - new Date(iso).getTime(); const m = Math.floor(d / 60000); if (m < 1) return 'agora'; if (m < 60) return `${m}min`; const h = Math.floor(m / 60); if (h < 24) return `${h}h`; return `${Math.floor(h / 24)}d`; }

export default function Home() {
  const { currentUser } = useAuth();
  const [phase, setPhase] = useState<CurrentPhase | null>(null);
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const name = currentUser?.name?.split(' ')[0] ?? 'Voce';

  useEffect(() => {
    (async () => {
      try {
        const [ph, fd] = await Promise.all([
          cycleApi.current().catch(() => null),
          feedApi.getFeed(undefined, 3).catch(() => ({ data: [] as FeedPost[], nextCursor: null })),
        ]);
        setPhase(ph);
        setPosts(fd.data);
        setLiked(Object.fromEntries(fd.data.map((p: FeedPost) => [p.id, p.liked])));
        const ct = await contentApi.listArticles({ phase: ph?.phase ?? undefined, page: 1 }).catch(() => ({ data: [] as Article[], total: 0, page: 1, limit: 10, totalPages: 0 }));
        setArticles(ct.data.slice(0, 5));
      } catch {}
      setLoading(false);
    })();
  }, []);

  const cp = phase?.phase ?? null;
  const pi = PHASE_INFO[cp ?? ''] ?? { label: '--', energy: '' };
  const pc = PHASE_COLORS[cp ?? ''] ?? '#9CA3AF';

  const like = async (id: string) => {
    const was = liked[id];
    setLiked(p => ({ ...p, [id]: !was }));
    try { if (was) await feedApi.unlike(id); else await feedApi.like(id); }
    catch { setLiked(p => ({ ...p, [id]: was })); }
  };

  if (loading) return <div style={{ minHeight: '100vh', background: '#F9FAFB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'DM Sans',sans-serif" }}><p style={{ color: '#6B7280' }}>Carregando...</p></div>;

  const NAV = [
    { to: '/home', label: 'Home', Icon: Home },
    { to: '/insights', label: 'Insights IA', Icon: Brain },
    { to: '/cycle', label: 'Ciclo', Icon: Droplets },
    { to: '/mood', label: 'Humor', Icon: Heart },
    { to: '/evolution', label: 'Evolucao', Icon: TrendingUp },
    { to: '/training', label: 'Treino', Icon: Dumbbell },
    { to: '/nutrition', label: 'Nutricao', Icon: Apple },
    { to: '/activities', label: 'Atividades', Icon: Zap },
    { to: '/feed', label: 'Feed', Icon: MessageCircle },
    { to: '/communities', label: 'Grupos', Icon: Users },
    { to: '/challenges', label: 'Desafios', Icon: Activity },
    { to: '/content', label: 'Conteudo', Icon: BookOpen },
    { to: '/profile', label: 'Perfil', Icon: User },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#F9FAFB', fontFamily: "'DM Sans',sans-serif" }}>

      {/* ── Drawer overlay ─────────────────────────────────────── */}
      {drawerOpen && <div onClick={() => setDrawerOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(2px)', zIndex: 45 }} />}
      <nav style={{ position: 'fixed', top: 0, left: 0, width: 270, height: '100vh', background: '#fff', zIndex: 50, transform: drawerOpen ? 'translateX(0)' : 'translateX(-100%)', transition: 'transform 0.25s ease', display: 'flex', flexDirection: 'column', boxShadow: drawerOpen ? '4px 0 24px rgba(0,0,0,0.08)' : 'none' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderBottom: '1px solid #E5E7EB' }}>
          <Logo size={22} variant="dark" />
          <button onClick={() => setDrawerOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', padding: 4 }}><span style={{ fontSize: 20 }}><ArrowRight size={18} /></span></button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
          {NAV.map(n => (
            <NavLink key={n.to} to={n.to} onClick={() => setDrawerOpen(false)} style={({ isActive }) => ({ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 8, textDecoration: 'none', fontSize: 13, fontWeight: 500, color: isActive ? '#7C3AED' : '#6B7280', background: isActive ? '#EDE9FE' : 'transparent', transition: 'all 0.15s', marginBottom: 2 })}>
              <n.Icon size={16} /> {n.label}
            </NavLink>
          ))}
        </div>
        <div style={{ padding: '12px', borderTop: '1px solid #E5E7EB' }}>
          <button onClick={() => { localStorage.removeItem('eliamov_token'); window.location.href = '/login'; }} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px', borderRadius: 8, background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500, color: '#DC2626', width: '100%' }}>
            <LogOut size={16} /> Sair da conta
          </button>
        </div>
      </nav>

      {/* ── Gradient Header ────────────────────────────────────── */}
      <div style={{ background: 'linear-gradient(135deg, #2D1B4E 0%, #4C1D95 50%, #7C3AED 100%)', padding: '14px 20px 24px', position: 'relative', overflow: 'hidden' }}>
        {/* Decorative circles */}
        <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: '50%', background: 'rgba(244,114,182,0.12)' }} />
        <div style={{ position: 'absolute', bottom: -20, left: -20, width: 80, height: 80, borderRadius: '50%', background: 'rgba(124,58,237,0.2)' }} />

        {/* Top row: menu + logo + avatar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, position: 'relative', zIndex: 1 }}>
          <button onClick={() => setDrawerOpen(true)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', cursor: 'pointer', padding: 8, borderRadius: 10, display: 'flex', alignItems: 'center' }}>
            <Menu size={20} color="#F9FAFB" />
          </button>
          <Logo size={18} variant="light" />
          <Link to="/profile" style={{ textDecoration: 'none' }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', border: '2px solid rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F9FAFB', fontWeight: 700, fontSize: 13 }}>
              {ini(currentUser?.name ?? '?')}
            </div>
          </Link>
        </div>

        {/* Greeting */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 28, fontWeight: 600, color: '#F9FAFB', margin: '0 0 4px', lineHeight: 1.2 }}>
            {greet()}, {name}
          </h1>
          {cp && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: pc }} />
              <span style={{ fontSize: 13, color: pc, fontWeight: 500 }}>fase {pi.label} — {pi.energy}</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Content ────────────────────────────────────────────── */}
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '16px 16px 90px' }}>

        {/* Quick actions */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 18 }}>
          {[
            { to: '/cycle', label: 'Ciclo', Icon: Droplets, color: '#DB2777', bg: '#FDF2F8' },
            { to: '/nutrition', label: 'Nutricao', Icon: Apple, color: '#EA580C', bg: '#FFF7ED' },
            { to: '/training', label: 'Treino', Icon: Dumbbell, color: '#7C3AED', bg: '#EDE9FE' },
            { to: '/mood', label: 'Humor', Icon: Heart, color: '#EC4899', bg: '#FDF2F8' },
          ].map(({ to, label, Icon, color, bg }) => (
            <Link key={to} to={to} style={{ background: bg, borderRadius: 14, padding: '14px 8px', textDecoration: 'none', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', transition: 'transform 0.15s' }}>
              <Icon size={22} color={color} style={{ marginBottom: 4 }} />
              <div style={{ fontSize: 11, fontWeight: 600, color }}>{label}</div>
            </Link>
          ))}
        </div>

        {/* Phase + Training cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 18 }}>
          {cp ? (
            <div style={{ background: 'linear-gradient(135deg, #2D1B4E, #4C1D95)', borderRadius: 18, padding: 18, position: 'relative', overflow: 'hidden', boxShadow: '0 4px 20px rgba(45,27,78,0.2)' }}>
              <div style={{ position: 'absolute', top: -16, right: -16, width: 60, height: 60, borderRadius: '50%', background: 'rgba(124,58,237,0.25)' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, position: 'relative', zIndex: 1 }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: pc, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 12px ${pc}40` }}>
                  <PhaseIcon p={cp} />
                </div>
                <div>
                  <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 18, fontWeight: 600, color: '#F9FAFB' }}>Fase {pi.label}</div>
                  <div style={{ fontSize: 11, color: '#C4B5FD' }}>Dia {phase?.dayOfCycle ?? '--'}</div>
                </div>
              </div>
              <Link to="/cycle" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#7C3AED', color: '#fff', borderRadius: 999, padding: '6px 14px', fontSize: 12, fontWeight: 600, textDecoration: 'none', position: 'relative', zIndex: 1 }}>
                Detalhes <ArrowRight size={12} />
              </Link>
            </div>
          ) : (
            <div style={{ background: '#fff', borderRadius: 18, padding: 18, border: '1px solid #E5E7EB' }}>
              <Droplets size={20} color="#7C3AED" style={{ marginBottom: 8 }} />
              <div style={{ fontSize: 14, fontWeight: 600, color: '#111827', marginBottom: 4 }}>Ciclo</div>
              <p style={{ fontSize: 12, color: '#6B7280', marginBottom: 10 }}>Registre para planos personalizados.</p>
              <Link to="/cycle" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#7C3AED', color: '#fff', borderRadius: 999, padding: '6px 14px', fontSize: 12, fontWeight: 600, textDecoration: 'none' }}>Registrar <ArrowRight size={12} /></Link>
            </div>
          )}

          <div style={{ background: '#fff', borderRadius: 18, padding: 18, border: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <Dumbbell size={20} color="#7C3AED" style={{ marginBottom: 8 }} />
              <div style={{ fontSize: 14, fontWeight: 600, color: '#111827', marginBottom: 4 }}>Treino</div>
              <p style={{ fontSize: 12, color: '#6B7280', marginBottom: 10 }}>{cp ? `Adaptado para fase ${pi.label}.` : 'Seus treinos e atividades.'}</p>
            </div>
            <Link to="/training" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#7C3AED', color: '#fff', borderRadius: 999, padding: '6px 14px', fontSize: 12, fontWeight: 600, textDecoration: 'none', alignSelf: 'flex-start' }}>Ver treinos <ArrowRight size={12} /></Link>
          </div>
        </div>

        {/* Feed */}
        <div style={{ marginBottom: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span style={{ fontSize: 15, fontWeight: 600, color: '#111827' }}>Na sua academia</span>
            <Link to="/feed" style={{ fontSize: 12, fontWeight: 600, color: '#7C3AED', textDecoration: 'none' }}>ver tudo</Link>
          </div>
          {posts.length === 0 ? (
            <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #E5E7EB', padding: '24px 16px', textAlign: 'center' }}>
              <MessageCircle size={24} color="#9CA3AF" style={{ marginBottom: 8 }} />
              <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 8 }}>Nenhuma atividade recente.</p>
              <Link to="/feed" style={{ fontSize: 13, color: '#7C3AED', fontWeight: 600, textDecoration: 'none' }}>Ir para o feed</Link>
            </div>
          ) : posts.map(post => (
            <div key={post.id} style={{ background: '#fff', borderRadius: 14, border: '1px solid #E5E7EB', padding: '12px 14px', marginBottom: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg,#7C3AED,#EC4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 11, flexShrink: 0 }}>
                  {ini(post.user?.name ?? '?')}
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{post.user?.name ?? 'Aluna'}</span>
                <span style={{ fontSize: 11, color: '#9CA3AF' }}>{ago(post.createdAt)}</span>
              </div>
              {post.content && <div style={{ fontSize: 13, color: '#374151', lineHeight: 1.5, marginBottom: 8 }}>{post.content}</div>}
              <div style={{ display: 'flex', gap: 14 }}>
                <button onClick={() => like(post.id)} style={{ display: 'flex', alignItems: 'center', gap: 3, background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, padding: 0, color: liked[post.id] ? '#DB2777' : '#9CA3AF' }}>
                  <Heart size={14} fill={liked[post.id] ? '#DB2777' : 'none'} /> {post.likesCount}
                </button>
                <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 12, color: '#9CA3AF' }}><MessageCircle size={14} /> {post.commentsCount}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Content or Tips */}
        <div>
          <span style={{ fontSize: 15, fontWeight: 600, color: '#111827', display: 'block', marginBottom: 10 }}>
            {articles.length > 0 ? `Conteudo${cp ? ` — fase ${pi.label}` : ''}` : 'Dicas para voce'}
          </span>
          {articles.length > 0 ? (
            <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 8 }}>
              {articles.map(a => {
                const cat = a.category?.slug ?? '';
                const bg = cat.includes('ciclo') ? '#EDE9FE' : cat.includes('treino') ? '#DCFCE7' : '#FEF3C7';
                const ic = cat.includes('ciclo') ? '#7C3AED' : cat.includes('treino') ? '#166534' : '#92400E';
                return (
                  <div key={a.id} style={{ minWidth: 170, maxWidth: 200, borderRadius: 14, border: '1px solid #E5E7EB', background: '#fff', overflow: 'hidden', flexShrink: 0, boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                    <div style={{ height: 80, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {a.coverImageUrl ? <img src={a.coverImageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : cat.includes('treino') ? <Play size={22} color={ic} /> : <BookOpen size={22} color={ic} />}
                    </div>
                    <div style={{ padding: '8px 10px' }}>
                      <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', color: ic, marginBottom: 3 }}>{a.category?.name ?? 'Artigo'}</div>
                      <div style={{ fontSize: 12, fontWeight: 500, color: '#111827', lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const, overflow: 'hidden' }}>{a.title}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 8 }}>
              {(GOAL_TIPS[currentUser?.fitnessGoal ?? ''] ?? GOAL_TIPS.health).map((tip, i) => (
                <div key={i} style={{ background: '#fff', borderRadius: 14, padding: '14px 16px', border: '1px solid #E5E7EB', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#7C3AED', marginBottom: 3 }}>{tip.title}</div>
                  <div style={{ fontSize: 12, color: '#6B7280', lineHeight: 1.5 }}>{tip.text}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Tab bar */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: '#fff', borderTop: '1px solid #E5E7EB', display: 'flex', padding: '6px 0 env(safe-area-inset-bottom,6px)', zIndex: 30 }}>
        {[
          { to: '/home', label: 'Home', Icon: Home },
          { to: '/training', label: 'Treino', Icon: Dumbbell },
          { to: '/feed', label: 'Social', Icon: MessageCircle },
          { to: '/communities', label: 'Grupos', Icon: Users },
          { to: '/profile', label: 'Perfil', Icon: User },
        ].map(({ to, label, Icon }) => (
          <NavLink key={to} to={to} style={({ isActive }) => ({ flex: 1, display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: 2, textDecoration: 'none', padding: '4px 0', color: isActive ? '#7C3AED' : '#9CA3AF', fontSize: 9, fontWeight: 500 })}>
            <Icon size={20} /> <span>{label}</span>
          </NavLink>
        ))}
      </div>
    </div>
  );
}
