import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { cycleApi, CurrentPhase } from '../../services/cycle.api';
import { feedApi, FeedPost } from '../../services/feed.api';
import { contentApi, Article } from '../../services/content.api';
import AppShell from '../../components/AppShell';
import {
  Sun, Zap, ArrowRight, Heart, MessageCircle,
  Droplets, Sprout, Moon, Flame, Dumbbell, Apple,
  BookOpen, Play,
} from 'lucide-react';

const PHASE_COLORS: Record<string, string> = {
  follicular: '#22C55E', ovulatory: '#D97706', luteal: '#EA580C', menstrual: '#DB2777',
};
const PHASE_INFO: Record<string, { label: string; energy: string }> = {
  follicular: { label: 'folicular', energy: 'energia alta' },
  ovulatory: { label: 'ovulatoria', energy: 'pico de disposicao' },
  luteal: { label: 'lutea', energy: 'recolhimento' },
  menstrual: { label: 'menstrual', energy: 'autocuidado' },
};
const GOAL_TIPS: Record<string, { title: string; text: string }[]> = {
  weight_loss: [
    { title: 'Deficit calorico', text: 'Um deficit de 500 kcal/dia leva a perda de ~0.5kg/semana.' },
    { title: 'Proteina', text: 'Consumir 1.4g/kg de proteina ajuda a preservar massa muscular.' },
    { title: 'Hidratacao', text: 'Beba pelo menos 2 litros de agua por dia.' },
  ],
  health: [
    { title: 'Atividade fisica', text: '150 minutos de exercicio moderado por semana e recomendado.' },
    { title: 'Hidratacao', text: 'Beba pelo menos 2 litros de agua por dia.' },
    { title: 'Sono', text: '7-9 horas de sono por noite sao essenciais.' },
  ],
  strength: [
    { title: 'Treino progressivo', text: 'Aumente a carga gradualmente a cada semana.' },
    { title: 'Recuperacao', text: 'Descanse 48h entre treinos do mesmo grupo muscular.' },
    { title: 'Proteina', text: 'Consumir 1.6-2g/kg de proteina para ganho muscular.' },
  ],
};

const PhaseIcon: React.FC<{ phase: string | null }> = ({ phase }) => {
  const s = { size: 24, color: '#fff' };
  switch (phase) {
    case 'menstrual': return <Droplets {...s} />;
    case 'follicular': return <Sprout {...s} />;
    case 'ovulatory': return <Sun {...s} />;
    case 'luteal': return <Moon {...s} />;
    default: return <Sun {...s} />;
  }
};

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Bom dia';
  if (h < 18) return 'Boa tarde';
  return 'Boa noite';
}
function getInitials(n: string): string {
  const p = n.trim().split(/\s+/);
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

  if (loading) return <AppShell><p style={{ color: '#6B7280', textAlign: 'center', padding: 40 }}>Carregando...</p></AppShell>;

  return (
    <AppShell>
      {/* Greeting */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 600, color: '#2D1B4E', margin: 0 }}>
          {getGreeting()}, {userName}
        </h1>
        {cp && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: pc, display: 'inline-block' }} />
            <span style={{ fontSize: 13, color: pc, fontWeight: 500 }}>fase {pi.label} — {pi.energy}</span>
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 20 }}>
        {[
          { to: '/cycle', label: 'Ciclo', Icon: Droplets, color: '#DB2777' },
          { to: '/nutrition', label: 'Nutricao', Icon: Apple, color: '#EA580C' },
          { to: '/training', label: 'Treino', Icon: Dumbbell, color: '#7C3AED' },
          { to: '/mood', label: 'Humor', Icon: Heart, color: '#EC4899' },
        ].map(({ to, label, Icon, color }) => (
          <Link key={to} to={to} style={{ background: '#fff', borderRadius: 14, padding: '14px 8px', border: '0.5px solid #E5E7EB', textDecoration: 'none', textAlign: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.03)' }}>
            <Icon size={20} color={color} style={{ marginBottom: 4 }} />
            <div style={{ fontSize: 11, fontWeight: 500, color: '#111827' }}>{label}</div>
          </Link>
        ))}
      </div>

      {/* Phase + Training grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
        {/* Phase card */}
        {cp ? (
          <div style={{ background: '#2D1B4E', borderRadius: 16, padding: 18, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -16, right: -16, width: 60, height: 60, borderRadius: '50%', background: 'rgba(124,58,237,0.2)' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, position: 'relative', zIndex: 1 }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: pc, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <PhaseIcon phase={cp} />
              </div>
              <div>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, fontWeight: 600, color: '#F9FAFB' }}>Fase {pi.label}</div>
                <div style={{ fontSize: 11, color: '#C4B5FD' }}>Dia {phase?.dayOfCycle ?? '--'}</div>
              </div>
            </div>
            <Link to="/cycle" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#7C3AED', color: '#fff', borderRadius: 999, padding: '6px 14px', fontSize: 12, fontWeight: 600, textDecoration: 'none', position: 'relative', zIndex: 1 }}>
              Detalhes <ArrowRight size={12} />
            </Link>
          </div>
        ) : (
          <div style={{ background: '#fff', borderRadius: 16, padding: 18, border: '0.5px solid #E5E7EB' }}>
            <div style={{ fontSize: 14, fontWeight: 500, color: '#111827', marginBottom: 6 }}>Ciclo</div>
            <p style={{ fontSize: 12, color: '#6B7280', marginBottom: 10 }}>Registre seu ciclo para planos personalizados.</p>
            <Link to="/cycle" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#7C3AED', color: '#fff', borderRadius: 999, padding: '6px 14px', fontSize: 12, fontWeight: 600, textDecoration: 'none' }}>
              Registrar <ArrowRight size={12} />
            </Link>
          </div>
        )}

        {/* Training card */}
        <div style={{ background: '#fff', borderRadius: 16, padding: 18, border: '0.5px solid #E5E7EB', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 500, color: '#111827', marginBottom: 6 }}>Treino</div>
            <p style={{ fontSize: 12, color: '#6B7280', marginBottom: 10 }}>
              {cp ? `Adaptado para fase ${pi.label}.` : 'Seus treinos e atividades.'}
            </p>
          </div>
          <Link to="/training" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#7C3AED', color: '#fff', borderRadius: 999, padding: '6px 14px', fontSize: 12, fontWeight: 600, textDecoration: 'none', alignSelf: 'flex-start' }}>
            Ver treinos <ArrowRight size={12} />
          </Link>
        </div>
      </div>

      {/* Feed + Content */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 20 }}>
        {/* Feed */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>Na sua academia</span>
            <Link to="/feed" style={{ fontSize: 12, fontWeight: 600, color: '#7C3AED', textDecoration: 'none' }}>ver tudo</Link>
          </div>
          {posts.length === 0 ? (
            <div style={{ background: '#fff', borderRadius: 14, border: '0.5px solid #E5E7EB', padding: '20px 16px', textAlign: 'center' }}>
              <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 8 }}>Nenhuma atividade recente.</p>
              <Link to="/feed" style={{ fontSize: 13, color: '#7C3AED', fontWeight: 600, textDecoration: 'none' }}>Ir para o feed</Link>
            </div>
          ) : posts.map(post => (
            <div key={post.id} style={{ background: '#fff', borderRadius: 14, border: '0.5px solid #E5E7EB', padding: '12px 14px', marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#2D1B4E', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#C4B5FD', fontWeight: 700, fontSize: 11, flexShrink: 0 }}>
                  {getInitials(post.user?.name ?? '?')}
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{post.user?.name ?? 'Aluna'}</span>
                <span style={{ fontSize: 11, color: '#9CA3AF' }}>{timeAgo(post.createdAt)}</span>
              </div>
              {post.content && <div style={{ fontSize: 13, color: '#374151', lineHeight: 1.5, marginBottom: 8 }}>{post.content}</div>}
              <div style={{ display: 'flex', gap: 14 }}>
                <button onClick={() => toggleLike(post.id)} style={{ display: 'flex', alignItems: 'center', gap: 3, background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, padding: 0, color: likedPosts[post.id] ? '#DB2777' : '#9CA3AF' }}>
                  <Heart size={14} fill={likedPosts[post.id] ? '#DB2777' : 'none'} /> {post.likesCount}
                </button>
                <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 12, color: '#9CA3AF' }}>
                  <MessageCircle size={14} /> {post.commentsCount}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Content or Tips */}
        <div>
          <span style={{ fontSize: 14, fontWeight: 600, color: '#111827', display: 'block', marginBottom: 12 }}>
            {articles.length > 0 ? `Conteudo${cp ? ` — fase ${pi.label}` : ''}` : 'Dicas para voce'}
          </span>
          {articles.length > 0 ? (
            <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 8 }}>
              {articles.map(a => {
                const cat = a.category?.slug ?? '';
                const bg = cat.includes('ciclo') ? '#EDE9FE' : cat.includes('treino') ? '#DCFCE7' : '#FEF3C7';
                const ic = cat.includes('ciclo') ? '#7C3AED' : cat.includes('treino') ? '#166534' : '#92400E';
                return (
                  <div key={a.id} style={{ minWidth: 170, maxWidth: 200, borderRadius: 12, border: '0.5px solid #E5E7EB', background: '#fff', overflow: 'hidden', flexShrink: 0 }}>
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {(GOAL_TIPS[currentUser?.fitnessGoal ?? ''] ?? GOAL_TIPS.health).map((tip, i) => (
                <div key={i} style={{ background: '#fff', borderRadius: 12, padding: '12px 14px', border: '0.5px solid #E5E7EB' }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#7C3AED', marginBottom: 3 }}>{tip.title}</div>
                  <div style={{ fontSize: 12, color: '#6B7280', lineHeight: 1.5 }}>{tip.text}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
