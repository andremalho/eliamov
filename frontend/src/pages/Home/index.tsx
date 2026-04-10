import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import {
  Bell,
  Plus,
  Sun,
  Zap,
  ArrowRight,
  Heart,
  MessageCircle,
  Home as HomeIcon,
  Users,
  User,
  BookOpen,
  Play,
  Flame,
} from 'lucide-react';

/* ── palette ─────────────────────────────────────────────────── */
const C = {
  bg: '#F9FAFB',
  header: '#2D1B4E',
  violet: '#7C3AED',
  pink: '#F472B6',
  text: '#111827',
  muted: '#6B7280',
  border: '#E5E7EB',
  lilac: '#C4B5FD',
  offWhite: '#F9FAFB',
  violetSoft: '#EDE9FE',
};

const PHASE_COLORS: Record<string, string> = {
  follicular: '#22C55E',
  ovulatory: '#D97706',
  luteal: '#EA580C',
  menstrual: '#DB2777',
};

const PHASE_RING: Record<string, string> = {
  follicular: '#16A34A',
  ovulatory: '#D97706',
  ovulation: '#D97706',
  luteal: '#EA580C',
  menstrual: '#DB2777',
  seen: '#D1D5DB',
};

const PHASE_LABELS: Record<string, { label: string; energy: string }> = {
  follicular: { label: 'folicular', energy: 'energia alta' },
  ovulatory: { label: 'ovulatoria', energy: 'pico de disposicao' },
  luteal: { label: 'lutea', energy: 'recolhimento' },
  menstrual: { label: 'menstrual', energy: 'autocuidado' },
};

/* ── mock data ───────────────────────────────────────────────── */
const mockUser = { name: 'Ana', cyclePhase: 'follicular' };

const mockStories = [
  { initials: 'CM', phase: 'ovulation', name: 'Camila', seen: false },
  { initials: 'RP', phase: 'follicular', name: 'Renata', seen: false },
  { initials: 'JS', phase: 'menstrual', name: 'Julia', seen: false },
  { initials: 'BF', phase: 'luteal', name: 'Beatriz', seen: false },
  { initials: 'LM', phase: 'seen', name: 'Larissa', seen: true },
];

const mockWorkout = {
  name: 'Forca - membros inferiores',
  duration: 50,
  intensity: 'media-alta',
  exercises: 8,
  progress: 35,
  trainer: 'Carlos M.',
  cref: '012345',
};

const mockPosts = [
  {
    initials: 'CM', name: 'Camila M.', time: 'ha 12 min',
    phase: 'ovulacao', phaseBg: '#FEF3C7', phaseText: '#92400E',
    text: 'Bati meu PR no agachamento! 80 kg pela primeira vez. O treino hormonal realmente funciona.',
    likes: 24, comments: 7, liked: true,
  },
  {
    initials: 'RP', name: 'Renata P.', time: 'ha 1h',
    phase: 'folicular', phaseBg: '#DCFCE7', phaseText: '#166534',
    text: 'Terceiro treino esta semana. Nunca fui tao consistente.',
    likes: 18, comments: 3, liked: false,
  },
];

const mockContent = [
  { category: 'ciclo', title: 'Como o estrogenio afeta sua forca muscular', meta: '5 min leitura', bg: '#EDE9FE', iconColor: '#7C3AED', icon: 'BookOpen' as const },
  { category: 'treino', title: 'HIIT na fase folicular - protocolo completo', meta: '12 min video', bg: '#DCFCE7', iconColor: '#166534', icon: 'Play' as const },
  { category: 'nutricao', title: 'Proteinas na fase folicular - guia pratico', meta: '4 min leitura', bg: '#FEF3C7', iconColor: '#92400E', icon: 'Flame' as const },
];

const ContentIcon: React.FC<{ icon: string; color: string; size?: number }> = ({ icon, color, size = 22 }) => {
  switch (icon) {
    case 'BookOpen': return <BookOpen size={size} color={color} />;
    case 'Play': return <Play size={size} color={color} />;
    case 'Flame': return <Flame size={size} color={color} />;
    default: return <BookOpen size={size} color={color} />;
  }
};

/* ── helpers ──────────────────────────────────────────────────── */
function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Bom dia';
  if (h < 18) return 'Boa tarde';
  return 'Boa noite';
}

/* ── component ───────────────────────────────────────────────── */
export default function Home() {
  const [likedPosts, setLikedPosts] = useState<Record<number, boolean>>(
    Object.fromEntries(mockPosts.map((p, i) => [i, p.liked])),
  );

  const phase = mockUser.cyclePhase;
  const phaseInfo = PHASE_LABELS[phase] ?? PHASE_LABELS.follicular;
  const phaseColor = PHASE_COLORS[phase] ?? '#22C55E';

  const toggleLike = (idx: number) =>
    setLikedPosts((prev) => ({ ...prev, [idx]: !prev[idx] }));

  return (
    <div style={{ maxWidth: 430, margin: '0 auto', background: C.bg, minHeight: '100vh', position: 'relative', fontFamily: "'DM Sans', sans-serif" }}>

      {/* ── 1. STATUS BAR ──────────────────────────────────────── */}
      <div style={{ background: C.header, padding: '8px 20px', display: 'flex', justifyContent: 'space-between', fontSize: 12, color: C.lilac }}>
        <span>{new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
        <div style={{ display: 'flex', gap: 6 }}>
          <Zap size={12} />
          <span>100%</span>
        </div>
      </div>

      {/* ── 2. HEADER ──────────────────────────────────────────── */}
      <div style={{ background: C.header, padding: '12px 20px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 42, height: 42, borderRadius: '50%', background: C.violet,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: C.violetSoft, fontWeight: 700, fontSize: 16, flexShrink: 0,
        }}>
          {mockUser.name.charAt(0)}
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, fontWeight: 600, color: C.offWhite, lineHeight: 1.2 }}>
            {getGreeting()}, {mockUser.name}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: phaseColor, display: 'inline-block' }} />
            <span style={{ fontSize: 12, color: phaseColor }}>
              fase {phaseInfo.label} — {phaseInfo.energy}
            </span>
          </div>
        </div>

        <button style={{
          width: 38, height: 38, borderRadius: '50%', border: 'none', cursor: 'pointer',
          background: 'rgba(255,255,255,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative',
        }}>
          <Bell size={18} color={C.offWhite} />
          <span style={{
            position: 'absolute', top: 6, right: 6, width: 8, height: 8,
            borderRadius: '50%', background: C.pink,
          }} />
        </button>
      </div>

      {/* ── SCROLLABLE CONTENT ─────────────────────────────────── */}
      <div style={{ paddingBottom: 80 }}>

        {/* ── 3. STORIES ─────────────────────────────────────────── */}
        <div style={{ display: 'flex', gap: 14, overflowX: 'auto', padding: '16px 20px', scrollbarWidth: 'none' }}>
          {/* Add story */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flexShrink: 0, cursor: 'pointer' }}>
            <div style={{
              width: 58, height: 58, borderRadius: '50%', border: '2px solid #D1D5DB',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <div style={{
                width: 50, height: 50, borderRadius: '50%', border: '2px solid #fff',
                background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Plus size={20} color={C.muted} />
              </div>
            </div>
            <span style={{ fontSize: 10, color: C.muted }}>Novo</span>
          </div>

          {/* Story avatars */}
          {mockStories.map((s, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flexShrink: 0, cursor: 'pointer' }}>
              <div style={{
                width: 58, height: 58, borderRadius: '50%',
                background: PHASE_RING[s.phase] ?? '#D1D5DB',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <div style={{
                  width: 50, height: 50, borderRadius: '50%', border: '2px solid #fff',
                  background: C.header, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: C.lilac, fontWeight: 700, fontSize: 15,
                }}>
                  {s.initials}
                </div>
              </div>
              <span style={{ fontSize: 10, color: C.muted, maxWidth: 58, textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {s.name}
              </span>
            </div>
          ))}
        </div>

        {/* ── 4. PHASE CARD ──────────────────────────────────────── */}
        <div style={{
          margin: '10px 20px', background: C.header, borderRadius: 20, padding: '18px 20px',
          position: 'relative', overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(124,58,237,0.08)',
        }}>
          {/* Decorative circles */}
          <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, borderRadius: '50%', background: 'rgba(124,58,237,0.15)' }} />
          <div style={{ position: 'absolute', bottom: -10, left: -10, width: 60, height: 60, borderRadius: '50%', background: 'rgba(244,114,182,0.10)' }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, position: 'relative', zIndex: 1 }}>
            <div style={{
              width: 48, height: 48, borderRadius: '50%', background: 'rgba(196,181,253,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Sun size={28} color={C.lilac} />
            </div>
            <div>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 600, color: C.offWhite }}>
                Fase {phaseInfo.label}
              </div>
              <div style={{ fontSize: 12, color: C.lilac }}>
                {phaseInfo.energy} — aproveite para treinar forte
              </div>
            </div>
          </div>

          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 14,
            background: 'rgba(244,114,182,0.2)', borderRadius: 999, padding: '4px 10px',
            position: 'relative', zIndex: 1,
          }}>
            <Zap size={11} color="#FBCFE8" />
            <span style={{ fontSize: 11, color: '#FBCFE8', fontWeight: 500 }}>
              janela de pico em 3 dias
            </span>
          </div>

          <div style={{ marginTop: 14, position: 'relative', zIndex: 1 }}>
            <Link to="/training" style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: C.violet, color: '#fff', borderRadius: 999,
              padding: '8px 16px', fontSize: 13, fontWeight: 600,
              textDecoration: 'none', transition: 'background 0.15s',
            }}>
              Ver plano de hoje
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>

        {/* ── 5. WORKOUT CARD ────────────────────────────────────── */}
        <div style={{
          margin: '0 20px 14px', background: '#fff', borderRadius: 20,
          border: `0.5px solid ${C.border}`, padding: '16px 18px',
          boxShadow: '0 4px 20px rgba(124,58,237,0.08)',
        }}>
          <div style={{
            display: 'inline-block', background: C.violetSoft, color: '#5B21B6',
            fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 999, marginBottom: 6,
          }}>
            Prescrito pelo personal
          </div>
          <div style={{ fontSize: 10, color: '#9CA3AF', marginBottom: 8 }}>
            {mockWorkout.trainer} - CREF {mockWorkout.cref}
          </div>
          <div style={{ fontSize: 15, fontWeight: 500, color: C.text, marginBottom: 4 }}>
            {mockWorkout.name}
          </div>
          <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 12 }}>
            {mockWorkout.duration}min - {mockWorkout.intensity} - {mockWorkout.exercises} exercicios
          </div>

          {/* Progress bar */}
          <div style={{ height: 5, background: '#F3F4F6', borderRadius: 3, marginBottom: 12 }}>
            <div style={{ height: '100%', width: `${mockWorkout.progress}%`, background: C.violet, borderRadius: 3, transition: 'width 0.3s' }} />
          </div>

          <Link to="/activities" style={{
            display: 'block', width: '100%', padding: 12, border: 'none', borderRadius: 12,
            background: C.violet, color: '#fff', fontWeight: 600, fontSize: 14,
            textAlign: 'center', textDecoration: 'none', cursor: 'pointer',
          }}>
            Retomar treino ({mockWorkout.progress}% concluido)
          </Link>
        </div>

        {/* ── 6. FEED PREVIEW ────────────────────────────────────── */}
        <div style={{ padding: '0 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '16px 0 10px' }}>
            <span style={{ fontSize: 12, fontWeight: 500, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Na sua academia
            </span>
            <Link to="/feed" style={{ fontSize: 12, fontWeight: 600, color: C.violet, textDecoration: 'none' }}>
              ver tudo
            </Link>
          </div>

          {mockPosts.map((post, idx) => (
            <div key={idx} style={{
              background: '#fff', borderRadius: 16, border: `0.5px solid ${C.border}`,
              padding: '14px 16px', marginBottom: 10,
              boxShadow: '0 4px 20px rgba(124,58,237,0.08)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <div style={{
                  width: 34, height: 34, borderRadius: '50%', background: C.header,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: C.lilac, fontWeight: 700, fontSize: 12, flexShrink: 0,
                }}>
                  {post.initials}
                </div>
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{post.name}</span>
                  <span style={{ fontSize: 11, color: '#9CA3AF', marginLeft: 6 }}>{post.time}</span>
                </div>
                <span style={{
                  fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 999,
                  background: post.phaseBg, color: post.phaseText,
                }}>
                  {post.phase}
                </span>
              </div>
              <div style={{ fontSize: 13, color: '#374151', lineHeight: 1.5, marginBottom: 10 }}>
                {post.text}
              </div>
              <div style={{ display: 'flex', gap: 16 }}>
                <button
                  onClick={() => toggleLike(idx)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 4, background: 'none',
                    border: 'none', cursor: 'pointer', fontSize: 12, padding: 0,
                    color: likedPosts[idx] ? '#DB2777' : '#9CA3AF', transition: 'color 0.15s',
                  }}
                >
                  <Heart size={16} fill={likedPosts[idx] ? '#DB2777' : 'none'} />
                  {post.likes + (likedPosts[idx] && !post.liked ? 1 : !likedPosts[idx] && post.liked ? -1 : 0)}
                </button>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#9CA3AF' }}>
                  <MessageCircle size={16} />
                  {post.comments}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* ── 7. CONTENT CAROUSEL ────────────────────────────────── */}
        <div style={{ padding: '0 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '16px 0 10px' }}>
            <span style={{ fontSize: 12, fontWeight: 500, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Para voce hoje — fase {phaseInfo.label}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, overflowX: 'auto', padding: '0 20px 20px', scrollbarWidth: 'none' }}>
          {mockContent.map((item, i) => (
            <div key={i} style={{
              minWidth: 148, maxWidth: 148, borderRadius: 14, border: `0.5px solid ${C.border}`,
              background: '#fff', overflow: 'hidden', flexShrink: 0, cursor: 'pointer',
              boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
            }}>
              <div style={{
                height: 76, background: item.bg,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <ContentIcon icon={item.icon} color={item.iconColor} size={22} />
              </div>
              <div style={{ padding: '8px 10px 10px' }}>
                <div style={{ fontSize: 9, fontWeight: 600, textTransform: 'uppercase', color: item.iconColor, marginBottom: 4, letterSpacing: 0.5 }}>
                  {item.category}
                </div>
                <div style={{
                  fontSize: 11, fontWeight: 500, color: C.text, lineHeight: 1.3,
                  display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const,
                  overflow: 'hidden', marginBottom: 4,
                }}>
                  {item.title}
                </div>
                <div style={{ fontSize: 10, color: '#9CA3AF' }}>{item.meta}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 8. TAB BAR ───────────────────────────────────────────── */}
      <div style={{
        position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
        width: '100%', maxWidth: 430, background: '#fff',
        borderTop: `0.5px solid ${C.border}`,
        display: 'flex', padding: '8px 0 env(safe-area-inset-bottom, 8px)',
        zIndex: 50,
      }}>
        {[
          { to: '/home', label: 'Home', Icon: HomeIcon, active: true },
          { to: '/training', label: 'Treino', Icon: Zap, active: false },
          { to: '/feed', label: 'Social', Icon: Heart, active: false },
          { to: '/communities', label: 'Grupos', Icon: Users, active: false },
          { to: '/profile', label: 'Perfil', Icon: User, active: false },
        ].map(({ to, label, Icon, active }) => (
          <NavLink
            key={to}
            to={to}
            style={({ isActive }) => ({
              flex: 1, display: 'flex', flexDirection: 'column' as const, alignItems: 'center',
              gap: 2, textDecoration: 'none', padding: '4px 0',
              color: isActive || active ? C.violet : '#9CA3AF',
              fontSize: 9, fontWeight: 500,
            })}
          >
            <Icon size={22} />
            <span>{label}</span>
          </NavLink>
        ))}
      </div>
    </div>
  );
}
