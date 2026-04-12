import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { cycleApi, CurrentPhase } from '../../services/cycle.api';
import { feedApi, FeedPost } from '../../services/feed.api';
import { contentApi, Article } from '../../services/content.api';
import { trainingEngineApi, TodayWorkout, aiChatApi } from '../../services/training-engine.api';
import { insightsApi, InsightsResponse } from '../../services/insights.api';
import Layout from '../../components/Layout';
import {
  ArrowRight, Heart, MessageCircle, Droplets, Sprout, Sun, Moon,
  Dumbbell, Apple, BookOpen, Play, TrendingUp, Bot, Send, X,
  Sparkles, Share2, Bookmark, MoreHorizontal, Clock, Zap,
} from 'lucide-react';

const PHASE_COLORS: Record<string, string> = { follicular: '#22C55E', ovulatory: '#D97706', luteal: '#EA580C', menstrual: '#DB2777' };
const PHASE_INFO: Record<string, { label: string; energy: string; emoji: string }> = {
  follicular: { label: 'folicular', energy: 'energia alta', emoji: '🌱' },
  ovulatory: { label: 'ovulatoria', energy: 'pico de disposicao', emoji: '☀️' },
  luteal: { label: 'lutea', energy: 'recolhimento', emoji: '🌙' },
  menstrual: { label: 'menstrual', energy: 'autocuidado', emoji: '🩸' },
};

function greet() { const h = new Date().getHours(); return h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite'; }
function ini(n: string) { const p = n.trim().split(/\s+/); return p.length === 1 ? (p[0][0]?.toUpperCase() ?? '?') : (p[0][0] + p[p.length - 1][0]).toUpperCase(); }
function ago(iso: string) { const d = Date.now() - new Date(iso).getTime(); const m = Math.floor(d / 60000); if (m < 1) return 'agora'; if (m < 60) return `${m}min`; const h = Math.floor(m / 60); if (h < 24) return `${h}h`; return `${Math.floor(h / 24)}d`; }

export default function Home() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [phase, setPhase] = useState<CurrentPhase | null>(null);
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [todayWorkout, setTodayWorkout] = useState<TodayWorkout | null>(null);
  const [insightPreview, setInsightPreview] = useState<InsightsResponse | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<{from: 'user'|'elia'; text: string}[]>([
    { from: 'elia', text: 'Ola! Sou a Elia, sua assistente de saude. Como posso ajudar?' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  const userName = currentUser?.name?.split(' ')[0] ?? 'Voce';

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [ph, fd] = await Promise.all([
          cycleApi.current().catch(() => null),
          feedApi.getFeed(undefined, 10).catch(() => ({ data: [] as FeedPost[], nextCursor: null })),
        ]);
        if (cancelled) return;
        setPhase(ph);
        setPosts(fd.data);
        setLiked(Object.fromEntries(fd.data.map((p: FeedPost) => [p.id, p.liked])));
        const ct = await contentApi.listArticles({ phase: ph?.phase ?? undefined, page: 1 }).catch(() => ({ data: [] as Article[], total: 0, page: 1, limit: 10, totalPages: 0 }));
        if (!cancelled) setArticles(ct.data.slice(0, 8));
        trainingEngineApi.today().then(tw => { if (!cancelled) setTodayWorkout(tw); }).catch(() => {});
        insightsApi.generate().then(ins => { if (!cancelled) setInsightPreview(ins); }).catch(() => {});
      } catch { /* ignore */ }
      if (!cancelled) setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  const cp = phase?.phase ?? null;
  const pi = PHASE_INFO[cp ?? ''] ?? { label: '--', energy: '', emoji: '' };
  const pc = PHASE_COLORS[cp ?? ''] ?? '#9CA3AF';

  const toggleLike = async (id: string) => {
    const was = liked[id];
    setLiked(p => ({ ...p, [id]: !was }));
    try { if (was) await feedApi.unlike(id); else await feedApi.like(id); }
    catch { setLiked(p => ({ ...p, [id]: was })); }
  };

  const handleChatSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const msg = chatInput.trim();
    setChatInput('');
    setChatMessages(prev => [...prev, { from: 'user', text: msg }]);
    setChatLoading(true);
    try {
      const res = await aiChatApi.send(msg);
      setChatMessages(prev => [...prev, { from: 'elia', text: res.response }]);
    } catch {
      setChatMessages(prev => [...prev, { from: 'elia', text: 'Desculpe, houve um erro. Tente novamente.' }]);
    }
    setChatLoading(false);
  };

  // Stories data (quick access circles)
  const stories = [
    { to: '/cycle', label: 'Ciclo', Icon: Droplets, gradient: 'linear-gradient(135deg, #EC4899, #DB2777)' },
    { to: '/nutrition', label: 'Nutricao', Icon: Apple, gradient: 'linear-gradient(135deg, #F97316, #EA580C)' },
    { to: '/training', label: 'Treino', Icon: Dumbbell, gradient: 'linear-gradient(135deg, #7C3AED, #6D28D9)' },
    { to: '/evolution', label: 'Evolucao', Icon: TrendingUp, gradient: 'linear-gradient(135deg, #22C55E, #16A34A)' },
    { to: '/challenges', label: 'Desafios', Icon: Zap, gradient: 'linear-gradient(135deg, #EAB308, #CA8A04)' },
    { to: '/communities', label: 'Grupos', Icon: MessageCircle, gradient: 'linear-gradient(135deg, #3B82F6, #2563EB)' },
  ];

  return (
    <Layout>
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
          <div style={{ width: 36, height: 36, border: '3px solid #EDE9FE', borderTopColor: '#7C3AED', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : (
        <>
          {/* ─── Greeting compact ─── */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 24, fontWeight: 600, color: '#2D1B4E', margin: 0, lineHeight: 1.2 }}>
                {greet()}, {userName}
              </h1>
              {cp && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: pc }} />
                  <span style={{ fontSize: 12, color: '#6B7280', fontWeight: 500 }}>Fase {pi.label} · Dia {phase?.dayOfCycle ?? '--'}</span>
                </div>
              )}
            </div>
          </div>

          {/* ─── Stories row ─── */}
          <div style={{ display: 'flex', gap: 14, overflowX: 'auto', paddingBottom: 4, marginBottom: 20, WebkitOverflowScrolling: 'touch' }}>
            {stories.map(s => (
              <Link key={s.to} to={s.to} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, textDecoration: 'none', flexShrink: 0 }}>
                <div style={{ width: 60, height: 60, borderRadius: '50%', background: s.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 3px 12px rgba(0,0,0,0.1)' }}>
                  <s.Icon size={24} color="#fff" />
                </div>
                <span style={{ fontSize: 10, fontWeight: 600, color: '#4B5563' }}>{s.label}</span>
              </Link>
            ))}
          </div>

          {/* ─── Insights IA Card ─── */}
          <div
            onClick={() => navigate('/insights')}
            style={{
              background: 'linear-gradient(135deg, #2D1B4E 0%, #4C1D95 50%, #7C3AED 100%)',
              borderRadius: 16, padding: '18px 20px', marginBottom: 20,
              cursor: 'pointer', position: 'relative', overflow: 'hidden',
              boxShadow: '0 4px 20px rgba(124,58,237,0.2)',
            }}
          >
            <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
            <div style={{ position: 'absolute', bottom: -20, left: '60%', width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.03)' }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Sparkles size={20} color="#FCD34D" />
                  </div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>Insights IA</div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>Analise personalizada</div>
                  </div>
                </div>
                <ArrowRight size={18} color="rgba(255,255,255,0.5)" />
              </div>
              {insightPreview ? (
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const }}>
                  {insightPreview.text.replace(/[#*_]/g, '').slice(0, 150)}...
                </div>
              ) : (
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>
                  Toque para gerar sua analise com inteligencia artificial
                </div>
              )}
            </div>
          </div>

          {/* ─── Today's workout mini card ─── */}
          {todayWorkout && (
            <Link to="/training" style={{ textDecoration: 'none', display: 'block', marginBottom: 20 }}>
              <div style={{
                background: '#fff', borderRadius: 14, padding: '14px 16px',
                border: '1px solid #EDE9FE',
                display: 'flex', alignItems: 'center', gap: 14,
                boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
              }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: '#EDE9FE', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Dumbbell size={22} color="#7C3AED" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#111827', marginBottom: 2 }}>{todayWorkout.workout.name}</div>
                  <div style={{ fontSize: 11, color: '#6B7280' }}>{todayWorkout.workout.duration}min · {todayWorkout.workout.intensity}</div>
                </div>
                <div style={{ background: '#7C3AED', color: '#fff', borderRadius: 999, padding: '6px 14px', fontSize: 11, fontWeight: 700 }}>
                  Iniciar
                </div>
              </div>
            </Link>
          )}

          {/* ─── Noticias & Artigos ─── */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div>
                <span style={{ fontSize: 18, fontWeight: 700, color: '#111827', display: 'block' }}>
                  Noticias & Artigos
                </span>
                {cp && <span style={{ fontSize: 12, color: '#6B7280' }}>Conteudo para a fase {pi.label}</span>}
              </div>
              <Link to="/content" style={{ fontSize: 12, fontWeight: 600, color: '#7C3AED', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>ver tudo <ArrowRight size={12} /></Link>
            </div>

            {articles.length > 0 ? (
              <>
                {/* Featured article (first one) */}
                <Link to="/content" style={{ textDecoration: 'none', display: 'block', marginBottom: 12 }}>
                  <div style={{ borderRadius: 18, overflow: 'hidden', background: '#fff', border: '1px solid #F3F4F6', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                    <div style={{
                      height: 160, position: 'relative', overflow: 'hidden',
                      background: (() => { const cat = articles[0].category?.slug ?? ''; return cat.includes('ciclo') ? 'linear-gradient(135deg, #EDE9FE, #DDD6FE)' : cat.includes('treino') ? 'linear-gradient(135deg, #DCFCE7, #BBF7D0)' : cat.includes('nutri') ? 'linear-gradient(135deg, #FEF3C7, #FDE68A)' : 'linear-gradient(135deg, #F5F3FF, #EDE9FE)'; })(),
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {articles[0].coverImageUrl
                        ? <img src={articles[0].coverImageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <BookOpen size={40} color={(() => { const cat = articles[0].category?.slug ?? ''; return cat.includes('ciclo') ? '#7C3AED' : cat.includes('treino') ? '#16A34A' : '#D97706'; })()} />
                      }
                      <div style={{ position: 'absolute', top: 12, left: 12, background: '#7C3AED', borderRadius: 8, padding: '4px 10px', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: '#fff', letterSpacing: 0.5 }}>
                        {articles[0].category?.name ?? 'Destaque'}
                      </div>
                    </div>
                    <div style={{ padding: '14px 16px 16px' }}>
                      <div style={{ fontSize: 16, fontWeight: 700, color: '#111827', lineHeight: 1.35, marginBottom: 6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const, overflow: 'hidden' }}>
                        {articles[0].title}
                      </div>
                      {articles[0].summary && (
                        <div style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const, overflow: 'hidden', marginBottom: 10 }}>
                          {articles[0].summary}
                        </div>
                      )}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Clock size={12} color="#9CA3AF" />
                        <span style={{ fontSize: 11, color: '#9CA3AF' }}>5 min de leitura</span>
                      </div>
                    </div>
                  </div>
                </Link>

                {/* Article grid (remaining) */}
                {articles.length > 1 && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 4 }}>
                    {articles.slice(1, 5).map(a => {
                      const cat = a.category?.slug ?? '';
                      const bgColor = cat.includes('ciclo') ? 'linear-gradient(135deg, #F5F3FF, #EDE9FE)' : cat.includes('treino') ? 'linear-gradient(135deg, #F0FDF4, #DCFCE7)' : cat.includes('nutri') ? 'linear-gradient(135deg, #FFFBEB, #FEF3C7)' : cat.includes('mental') ? 'linear-gradient(135deg, #FDF2F8, #FCE7F3)' : 'linear-gradient(135deg, #F5F3FF, #EDE9FE)';
                      const iconColor = cat.includes('ciclo') ? '#7C3AED' : cat.includes('treino') ? '#16A34A' : cat.includes('nutri') ? '#D97706' : cat.includes('mental') ? '#EC4899' : '#7C3AED';
                      return (
                        <Link key={a.id} to="/content" style={{ textDecoration: 'none' }}>
                          <div style={{ borderRadius: 14, overflow: 'hidden', background: '#fff', border: '1px solid #F3F4F6', boxShadow: '0 1px 6px rgba(0,0,0,0.04)', height: '100%' }}>
                            <div style={{ height: 80, background: bgColor, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                              {a.coverImageUrl
                                ? <img src={a.coverImageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                : <BookOpen size={22} color={iconColor} />
                              }
                              <div style={{ position: 'absolute', top: 6, left: 6, background: 'rgba(255,255,255,0.92)', borderRadius: 5, padding: '2px 7px', fontSize: 8, fontWeight: 700, textTransform: 'uppercase', color: iconColor }}>
                                {a.category?.name ?? 'Artigo'}
                              </div>
                            </div>
                            <div style={{ padding: '8px 10px 10px' }}>
                              <div style={{ fontSize: 12, fontWeight: 600, color: '#111827', lineHeight: 1.35, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const, overflow: 'hidden', marginBottom: 4 }}>
                                {a.title}
                              </div>
                              <div style={{ fontSize: 10, color: '#9CA3AF', display: 'flex', alignItems: 'center', gap: 4 }}>
                                <Clock size={9} /> 3 min
                              </div>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}

                {/* More articles horizontal scroll */}
                {articles.length > 5 && (
                  <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingTop: 10, paddingBottom: 4, WebkitOverflowScrolling: 'touch' }}>
                    {articles.slice(5).map(a => {
                      const cat = a.category?.slug ?? '';
                      const iconColor = cat.includes('ciclo') ? '#7C3AED' : cat.includes('treino') ? '#16A34A' : '#D97706';
                      return (
                        <Link key={a.id} to="/content" style={{ textDecoration: 'none', flexShrink: 0 }}>
                          <div style={{ width: 160, borderRadius: 12, overflow: 'hidden', background: '#fff', border: '1px solid #F3F4F6' }}>
                            <div style={{ height: 70, background: '#F5F3FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <BookOpen size={20} color={iconColor} />
                            </div>
                            <div style={{ padding: '6px 8px 8px' }}>
                              <div style={{ fontSize: 11, fontWeight: 600, color: '#111827', lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const, overflow: 'hidden' }}>
                                {a.title}
                              </div>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </>
            ) : (
              <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #F3F4F6', padding: '28px 20px', textAlign: 'center' }}>
                <BookOpen size={28} color="#C4B5FD" style={{ marginBottom: 8 }} />
                <p style={{ fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 4 }}>Conteudo em breve</p>
                <p style={{ fontSize: 12, color: '#9CA3AF' }}>Artigos personalizados para voce</p>
              </div>
            )}
          </div>

          {/* ─── Feed section ─── */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>Feed da academia</span>
              <Link to="/feed" style={{ fontSize: 12, fontWeight: 600, color: '#7C3AED', textDecoration: 'none' }}>ver tudo</Link>
            </div>

            {posts.length === 0 ? (
              <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #F3F4F6', padding: '32px 20px', textAlign: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.03)' }}>
                <MessageCircle size={28} color="#C4B5FD" style={{ marginBottom: 8 }} />
                <p style={{ fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 4 }}>Nenhuma atividade recente</p>
                <p style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 12 }}>Seja a primeira a compartilhar!</p>
                <Link to="/feed" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 13, color: '#7C3AED', fontWeight: 600, textDecoration: 'none' }}>
                  Ir para o feed <ArrowRight size={14} />
                </Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {posts.map(post => (
                  <div key={post.id} style={{ background: '#fff', borderRadius: 16, border: '1px solid #F3F4F6', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.03)' }}>
                    {/* Post header */}
                    <div style={{ padding: '14px 16px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 38, height: 38, borderRadius: '50%',
                          background: 'linear-gradient(135deg, #7C3AED, #EC4899)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: '#fff', fontWeight: 700, fontSize: 13, flexShrink: 0,
                          boxShadow: '0 2px 8px rgba(124,58,237,0.2)',
                        }}>
                          {ini(post.user?.name ?? '?')}
                        </div>
                        <div>
                          <div style={{ fontSize: 13.5, fontWeight: 600, color: '#111827' }}>{post.user?.name ?? 'Aluna'}</div>
                          <div style={{ fontSize: 11, color: '#9CA3AF', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Clock size={10} /> {ago(post.createdAt)}
                            {post.cyclePhase && (
                              <span style={{ marginLeft: 4, background: '#F5F3FF', padding: '1px 6px', borderRadius: 4, fontSize: 9, fontWeight: 600, color: '#7C3AED' }}>
                                {post.cyclePhase}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', padding: 4 }}>
                        <MoreHorizontal size={18} />
                      </button>
                    </div>

                    {/* Post content */}
                    {post.content && (
                      <div style={{ padding: '12px 16px', fontSize: 13.5, color: '#374151', lineHeight: 1.6 }}>
                        {post.content}
                      </div>
                    )}

                    {/* Workout badge */}
                    {post.workout && (
                      <div style={{ margin: '0 16px 12px', background: '#F5F3FF', borderRadius: 12, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 8, background: '#EDE9FE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Dumbbell size={18} color="#7C3AED" />
                        </div>
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 600, color: '#2D1B4E' }}>{post.workout.title}</div>
                          <div style={{ fontSize: 10, color: '#6B7280' }}>
                            {post.workout.duration}min
                            {post.workout.calories ? ` · ${post.workout.calories} kcal` : ''}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Media */}
                    {post.mediaUrls && post.mediaUrls.length > 0 && (
                      <div style={{ padding: '0 16px 12px' }}>
                        <img src={post.mediaUrls[0]} alt="" style={{ width: '100%', borderRadius: 12, objectFit: 'cover', maxHeight: 280 }} />
                      </div>
                    )}

                    {/* Actions bar */}
                    <div style={{ padding: '8px 16px 14px', display: 'flex', alignItems: 'center', gap: 20, borderTop: '1px solid #F9FAFB' }}>
                      <button onClick={() => toggleLike(post.id)} style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 500, padding: 0, color: liked[post.id] ? '#EC4899' : '#6B7280', transition: 'color 0.15s' }}>
                        <Heart size={18} fill={liked[post.id] ? '#EC4899' : 'none'} strokeWidth={liked[post.id] ? 0 : 1.8} /> {post.likesCount}
                      </button>
                      <button style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 500, padding: 0, color: '#6B7280' }}>
                        <MessageCircle size={18} /> {post.commentsCount}
                      </button>
                      <div style={{ flex: 1 }} />
                      <button style={{ display: 'flex', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#6B7280' }}>
                        <Bookmark size={18} />
                      </button>
                    </div>
                  </div>
                ))}

                {/* Load more link */}
                <Link to="/feed" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6, padding: '14px 0', fontSize: 13, fontWeight: 600, color: '#7C3AED', textDecoration: 'none' }}>
                  Ver mais no feed <ArrowRight size={14} />
                </Link>
              </div>
            )}
          </div>
        </>
      )}

      {/* AI Chat Elia */}
      {showChat && (
        <div style={{ position: 'fixed', bottom: 90, right: 16, width: 340, maxHeight: 420, background: '#fff', borderRadius: 20, border: '1px solid #EDE9FE', boxShadow: '0 8px 40px rgba(45,27,78,0.15)', zIndex: 40, display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid #F3F4F6', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(135deg, #F5F3FF, #fff)', borderRadius: '20px 20px 0 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #7C3AED, #9333EA)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Bot size={16} color="#fff" />
              </div>
              <div>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>Elia</span>
                <div style={{ fontSize: 10, color: '#16A34A', fontWeight: 500 }}>online</div>
              </div>
            </div>
            <button onClick={() => setShowChat(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', padding: 4 }}><X size={18} /></button>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px' }}>
            {chatMessages.map((m, i) => (
              <div key={i} style={{ marginBottom: 12, display: 'flex', justifyContent: m.from === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  maxWidth: '82%', padding: '10px 14px', fontSize: 13, lineHeight: 1.5,
                  borderRadius: m.from === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  background: m.from === 'user' ? 'linear-gradient(135deg, #7C3AED, #6D28D9)' : '#F5F3FF',
                  color: m.from === 'user' ? '#fff' : '#111827',
                }}>
                  {m.text}
                </div>
              </div>
            ))}
            {chatLoading && (
              <div style={{ display: 'flex', gap: 4, padding: '8px 0' }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: '#C4B5FD', animation: `bounce 1.4s infinite ${i * 0.2}s` }} />
                ))}
                <style>{`@keyframes bounce { 0%,80%,100% { transform:translateY(0) } 40% { transform:translateY(-6px) } }`}</style>
              </div>
            )}
          </div>
          <form onSubmit={handleChatSend} style={{ padding: '10px 14px', borderTop: '1px solid #F3F4F6', display: 'flex', gap: 8 }}>
            <input value={chatInput} onChange={e => setChatInput(e.target.value)} placeholder="Pergunte a Elia..." style={{ flex: 1, padding: '10px 14px', border: '1px solid #EDE9FE', borderRadius: 12, fontSize: 13, outline: 'none', background: '#FAFAFE' }} />
            <button type="submit" style={{ background: 'linear-gradient(135deg, #7C3AED, #6D28D9)', color: '#fff', border: 'none', borderRadius: 12, padding: '10px 14px', cursor: 'pointer' }}><Send size={15} /></button>
          </form>
        </div>
      )}

      {/* Chat FAB */}
      {!showChat && (
        <button onClick={() => setShowChat(true)} style={{
          position: 'fixed', bottom: 90, right: 16,
          width: 54, height: 54, borderRadius: '50%',
          background: 'linear-gradient(135deg, #7C3AED, #9333EA)',
          color: '#fff', border: 'none', cursor: 'pointer',
          boxShadow: '0 4px 24px rgba(124,58,237,0.35)',
          zIndex: 40, display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'transform 0.2s, box-shadow 0.2s',
        }}>
          <Bot size={24} />
        </button>
      )}
    </Layout>
  );
}
