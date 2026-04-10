import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { cycleApi, CurrentPhase } from '../../services/cycle.api';
import { feedApi, FeedPost } from '../../services/feed.api';
import { contentApi, Article } from '../../services/content.api';
import Layout from '../../components/Layout';
import {
  ArrowRight, Heart, MessageCircle, Droplets, Sprout, Sun, Moon,
  Dumbbell, Apple, BookOpen, Play, TrendingUp,
} from 'lucide-react';

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
  const s = { size: 22, color: '#fff' };
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

  const userName = currentUser?.name?.split(' ')[0] ?? 'Voce';

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [ph, fd] = await Promise.all([
          cycleApi.current().catch(() => null),
          feedApi.getFeed(undefined, 3).catch(() => ({ data: [] as FeedPost[], nextCursor: null })),
        ]);
        if (cancelled) return;
        setPhase(ph);
        setPosts(fd.data);
        setLiked(Object.fromEntries(fd.data.map((p: FeedPost) => [p.id, p.liked])));
        const ct = await contentApi.listArticles({ phase: ph?.phase ?? undefined, page: 1 }).catch(() => ({ data: [] as Article[], total: 0, page: 1, limit: 10, totalPages: 0 }));
        if (!cancelled) setArticles(ct.data.slice(0, 5));
      } catch { /* ignore */ }
      if (!cancelled) setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  const cp = phase?.phase ?? null;
  const pi = PHASE_INFO[cp ?? ''] ?? { label: '--', energy: '' };
  const pc = PHASE_COLORS[cp ?? ''] ?? '#9CA3AF';

  const toggleLike = async (id: string) => {
    const was = liked[id];
    setLiked(p => ({ ...p, [id]: !was }));
    try { if (was) await feedApi.unlike(id); else await feedApi.like(id); }
    catch { setLiked(p => ({ ...p, [id]: was })); }
  };

  return (
    <Layout>
      {/* Greeting banner */}
      <div style={{ background: 'linear-gradient(135deg, #2D1B4E, #4C1D95, #7C3AED)', borderRadius: 18, padding: '20px 22px', marginBottom: 18, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, borderRadius: '50%', background: 'rgba(244,114,182,0.12)' }} />
        <div style={{ position: 'absolute', bottom: -15, left: -15, width: 70, height: 70, borderRadius: '50%', background: 'rgba(124,58,237,0.2)' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 26, fontWeight: 600, color: '#F9FAFB', margin: 0, lineHeight: 1.2 }}>
            {greet()}, {userName}
          </h1>
          {cp && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: pc }} />
              <span style={{ fontSize: 13, color: pc, fontWeight: 500 }}>fase {pi.label} — {pi.energy}</span>
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <p style={{ textAlign: 'center', color: '#6B7280', padding: 20 }}>Carregando...</p>
      ) : (
        <>
          {/* Quick actions */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 18 }}>
            {[
              { to: '/cycle', label: 'Ciclo', Icon: Droplets, color: '#DB2777', bg: '#FDF2F8' },
              { to: '/nutrition', label: 'Nutricao', Icon: Apple, color: '#EA580C', bg: '#FFF7ED' },
              { to: '/training', label: 'Treino', Icon: Dumbbell, color: '#7C3AED', bg: '#EDE9FE' },
              { to: '/evolution', label: 'Evolucao', Icon: TrendingUp, color: '#16A34A', bg: '#F0FDF4' },
            ].map(({ to, label, Icon, color, bg }) => (
              <Link key={to} to={to} style={{ background: bg, borderRadius: 14, padding: '14px 8px', textDecoration: 'none', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <Icon size={22} color={color} style={{ marginBottom: 4 }} />
                <div style={{ fontSize: 11, fontWeight: 600, color }}>{label}</div>
              </Link>
            ))}
          </div>

          {/* Phase + Training */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 18 }}>
            {cp ? (
              <div style={{ background: 'linear-gradient(135deg, #2D1B4E, #4C1D95)', borderRadius: 16, padding: 16, position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: -12, right: -12, width: 50, height: 50, borderRadius: '50%', background: 'rgba(124,58,237,0.25)' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, position: 'relative', zIndex: 1 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: pc, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <PhaseIcon p={cp} />
                  </div>
                  <div>
                    <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 16, fontWeight: 600, color: '#F9FAFB' }}>Fase {pi.label}</div>
                    <div style={{ fontSize: 11, color: '#C4B5FD' }}>Dia {phase?.dayOfCycle ?? '--'}</div>
                  </div>
                </div>
                <Link to="/cycle" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#7C3AED', color: '#fff', borderRadius: 999, padding: '5px 12px', fontSize: 11, fontWeight: 600, textDecoration: 'none', position: 'relative', zIndex: 1 }}>
                  Detalhes <ArrowRight size={11} />
                </Link>
              </div>
            ) : (
              <div style={{ background: '#fff', borderRadius: 16, padding: 16, border: '1px solid #E5E7EB' }}>
                <Droplets size={18} color="#7C3AED" style={{ marginBottom: 6 }} />
                <div style={{ fontSize: 13, fontWeight: 600, color: '#111827', marginBottom: 4 }}>Ciclo</div>
                <p style={{ fontSize: 11, color: '#6B7280', marginBottom: 8 }}>Registre para planos personalizados.</p>
                <Link to="/cycle" style={{ display: 'inline-flex', alignItems: 'center', gap: 3, background: '#7C3AED', color: '#fff', borderRadius: 999, padding: '5px 12px', fontSize: 11, fontWeight: 600, textDecoration: 'none' }}>Registrar <ArrowRight size={11} /></Link>
              </div>
            )}
            <div style={{ background: '#fff', borderRadius: 16, padding: 16, border: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <Dumbbell size={18} color="#7C3AED" style={{ marginBottom: 6 }} />
                <div style={{ fontSize: 13, fontWeight: 600, color: '#111827', marginBottom: 4 }}>Treino</div>
                <p style={{ fontSize: 11, color: '#6B7280', marginBottom: 8 }}>{cp ? `Fase ${pi.label}.` : 'Seus treinos.'}</p>
              </div>
              <Link to="/training" style={{ display: 'inline-flex', alignItems: 'center', gap: 3, background: '#7C3AED', color: '#fff', borderRadius: 999, padding: '5px 12px', fontSize: 11, fontWeight: 600, textDecoration: 'none', alignSelf: 'flex-start' }}>Ver treinos <ArrowRight size={11} /></Link>
            </div>
          </div>

          {/* Feed */}
          <div style={{ marginBottom: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ fontSize: 15, fontWeight: 600, color: '#111827' }}>Na sua academia</span>
              <Link to="/feed" style={{ fontSize: 12, fontWeight: 600, color: '#7C3AED', textDecoration: 'none' }}>ver tudo</Link>
            </div>
            {posts.length === 0 ? (
              <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #E5E7EB', padding: '20px 16px', textAlign: 'center' }}>
                <MessageCircle size={22} color="#9CA3AF" style={{ marginBottom: 6 }} />
                <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 6 }}>Nenhuma atividade recente.</p>
                <Link to="/feed" style={{ fontSize: 13, color: '#7C3AED', fontWeight: 600, textDecoration: 'none' }}>Ir para o feed</Link>
              </div>
            ) : posts.map(post => (
              <div key={post.id} style={{ background: '#fff', borderRadius: 14, border: '1px solid #E5E7EB', padding: '12px 14px', marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#7C3AED,#EC4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 10, flexShrink: 0 }}>
                    {ini(post.user?.name ?? '?')}
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{post.user?.name ?? 'Aluna'}</span>
                  <span style={{ fontSize: 11, color: '#9CA3AF' }}>{ago(post.createdAt)}</span>
                </div>
                {post.content && <div style={{ fontSize: 13, color: '#374151', lineHeight: 1.5, marginBottom: 8 }}>{post.content}</div>}
                <div style={{ display: 'flex', gap: 14 }}>
                  <button onClick={() => toggleLike(post.id)} style={{ display: 'flex', alignItems: 'center', gap: 3, background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, padding: 0, color: liked[post.id] ? '#DB2777' : '#9CA3AF' }}>
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
                    <div key={a.id} style={{ minWidth: 160, borderRadius: 12, border: '1px solid #E5E7EB', background: '#fff', overflow: 'hidden', flexShrink: 0 }}>
                      <div style={{ height: 70, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {a.coverImageUrl ? <img src={a.coverImageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          : cat.includes('treino') ? <Play size={20} color={ic} /> : <BookOpen size={20} color={ic} />}
                      </div>
                      <div style={{ padding: '6px 8px 8px' }}>
                        <div style={{ fontSize: 9, fontWeight: 600, textTransform: 'uppercase', color: ic, marginBottom: 2 }}>{a.category?.name ?? 'Artigo'}</div>
                        <div style={{ fontSize: 11, fontWeight: 500, color: '#111827', lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const, overflow: 'hidden' }}>{a.title}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 8 }}>
                {(GOAL_TIPS[currentUser?.fitnessGoal ?? ''] ?? GOAL_TIPS.health).map((tip, i) => (
                  <div key={i} style={{ background: '#fff', borderRadius: 12, padding: '12px 14px', border: '1px solid #E5E7EB' }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#7C3AED', marginBottom: 3 }}>{tip.title}</div>
                    <div style={{ fontSize: 12, color: '#6B7280', lineHeight: 1.5 }}>{tip.text}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </Layout>
  );
}
