import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useGamification } from '../contexts/GamificationContext';
import { initials } from '../utils/format';
import Logo from './Logo';
import {
  Home, Droplets, Dumbbell, Apple, Heart, MessageCircle,
  Users, Zap, BookOpen, Brain, User, LogOut,
  Menu, X, Stethoscope, Trophy, TrendingUp, Scale, Flame, FlaskRound, Sun,
  Sparkles, Star, Medal,
} from 'lucide-react';

const NAV_GROUPS = [
  { title: '', items: [
    { to: '/home', label: 'Home', Icon: Home },
    { to: '/training', label: 'Treino do dia', Icon: Dumbbell },
    { to: '/feed', label: 'Feed', Icon: MessageCircle },
    { to: '/insights', label: 'Insights IA', Icon: Sparkles },
  ]},
  { title: 'Saúde', items: [
    { to: '/cycle', label: 'Ciclo menstrual', Icon: Droplets },
    { to: '/mood', label: 'Humor', Icon: Heart },
    { to: '/nutrition', label: 'Nutrição', Icon: Apple },
    { to: '/evolution', label: 'Evolução', Icon: TrendingUp },
    { to: '/pregnancy', label: 'Gravidez', Icon: Heart },
    { to: '/menopause', label: 'Menopausa', Icon: Sun },
    { to: '/mental-health', label: 'Saúde mental', Icon: Brain },
  ]},
  { title: 'Programas', items: [
    { to: '/weight-loss', label: 'Emagrecimento', Icon: Scale },
    { to: '/challenges', label: 'Desafios', Icon: Trophy },
    { to: '/leaderboard', label: 'Ranking', Icon: Medal },
    { to: '/communities', label: 'Comunidades', Icon: Users },
    { to: '/fertility', label: 'Fertilidade', Icon: Heart },
    { to: '/content', label: 'Conteúdo', Icon: BookOpen },
  ]},
  { title: 'Mais', items: [
    { to: '/activities', label: 'Atividades', Icon: Zap },
    { to: '/appointments', label: 'Consultas', Icon: Stethoscope },
    { to: '/teleconsult', label: 'Teleconsulta', Icon: Users },
    { to: '/lab-analysis', label: 'Exames lab', Icon: FlaskRound },
    { to: '/profile', label: 'Perfil', Icon: User },
  ]},
];

const TABS = [
  { to: '/home', label: 'Home', Icon: Home },
  { to: '/training', label: 'Treino', Icon: Dumbbell },
  { to: '/insights', label: 'Insights', Icon: Sparkles, center: true },
  { to: '/feed', label: 'Feed', Icon: MessageCircle },
  { to: '/profile', label: 'Perfil', Icon: User },
];

const GRAIN =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='200' height='200' filter='url(%23n)' opacity='0.9'/></svg>";

interface Props { children: React.ReactNode; title?: string; subtitle?: string; hideHeader?: boolean; }

export default function AppShell({ children, title, subtitle, hideHeader }: Props) {
  const { currentUser } = useAuth();
  const { stats } = useGamification();
  const [open, setOpen] = useState(false);
  const streak = stats?.currentStreak ?? 0;
  const level = stats?.level ?? 1;

  return (
    <>
      <style>{`
        .sh { min-height: 100vh; background: var(--cream, #F5EFE6); font-family: var(--font-ui, 'Figtree', sans-serif); color: var(--ink, #14161F); }

        /* ─── Top bar ─── */
        .sh-bar {
          position: sticky; top: 0; z-index: 30;
          display: flex; align-items: center; justify-content: space-between;
          padding: 14px clamp(16px, 4vw, 28px);
          background: #14161F;
          color: #F5EFE6;
          border-bottom: 1px solid rgba(245,239,230,0.08);
          overflow: hidden;
        }
        .sh-bar::before {
          content: ''; position: absolute; inset: 0;
          pointer-events: none; opacity: 0.05; mix-blend-mode: overlay;
          background-image: url("${GRAIN}");
        }
        .sh-bar::after {
          content: ''; position: absolute;
          top: -60%; right: -20%; width: 60%; height: 200%;
          background: radial-gradient(closest-side, rgba(217,119,87,0.18), transparent 70%);
          filter: blur(50px); pointer-events: none;
        }
        .sh-bar > * { position: relative; }
        .sh-menu {
          background: none; border: 1px solid transparent; cursor: pointer;
          padding: 6px; color: rgba(245,239,230,0.85);
          display: flex; align-items: center;
          transition: border-color 0.25s, background 0.25s;
        }
        .sh-menu:hover { border-color: rgba(245,239,230,0.18); background: rgba(245,239,230,0.04); }

        .sh-chip {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 5px 12px;
          border: 1px solid rgba(245,239,230,0.18);
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px; font-weight: 500;
          letter-spacing: 0.14em; text-transform: uppercase;
          color: rgba(245,239,230,0.88);
        }
        .sh-chip-dot { width: 5px; height: 5px; border-radius: 50%; }

        .sh-avatar-link { text-decoration: none; line-height: 0; }
        .sh-avatar {
          width: 34px; height: 34px; border-radius: 50%;
          background: transparent; border: 1px solid rgba(245,239,230,0.28);
          display: flex; align-items: center; justify-content: center;
          color: #F5EFE6; font-weight: 600; font-size: 12px;
          letter-spacing: 0.04em;
          transition: border-color 0.25s;
        }
        .sh-avatar:hover { border-color: #D97757; }

        /* ─── Content ─── */
        .sh-body { max-width: 900px; margin: 0 auto; padding: 28px clamp(16px, 3vw, 24px) 120px; }
        .sh-title {
          font-family: 'Fraunces', serif;
          font-size: clamp(1.8rem, 3.5vw, 2.6rem);
          font-weight: 400;
          letter-spacing: -0.025em;
          color: var(--ink, #14161F);
          margin: 0 0 8px;
          line-height: 1.08;
        }
        .sh-sub {
          font-family: 'Figtree', sans-serif;
          font-size: 14px;
          color: rgba(20,22,31,0.62);
          margin: 0 0 28px;
          line-height: 1.5;
        }

        /* ─── Bottom tab bar ─── */
        .sh-tabs {
          position: fixed; bottom: 0; left: 0; right: 0;
          display: flex; align-items: flex-end; justify-content: space-around;
          background: #FDFAF3;
          border-top: 1px solid rgba(20,22,31,0.08);
          padding: 0 0 env(safe-area-inset-bottom, 4px);
          z-index: 30;
        }
        .sh-tab {
          flex: 1;
          display: flex; flex-direction: column; align-items: center; gap: 3px;
          text-decoration: none;
          padding: 10px 0 8px;
          color: rgba(20,22,31,0.48);
          font-family: 'Figtree', sans-serif;
          font-size: 10px; font-weight: 500;
          letter-spacing: 0.02em;
          transition: color 0.25s;
          position: relative;
        }
        .sh-tab.active { color: #14161F; font-weight: 600; }
        .sh-tab.active::before {
          content: ''; position: absolute; top: 0; left: 50%;
          transform: translateX(-50%);
          width: 20px; height: 2px;
          background: #D97757;
        }

        /* ─── Center tab (Insights) ─── */
        .sh-tab-center {
          flex: 1;
          display: flex; flex-direction: column; align-items: center;
          text-decoration: none;
          color: rgba(20,22,31,0.48);
          font-family: 'Figtree', sans-serif;
          font-size: 10px; font-weight: 600;
          letter-spacing: 0.02em;
          padding: 0 0 8px; margin-top: -18px;
          transition: color 0.25s;
        }
        .sh-tab-center.active { color: #14161F; }
        .sh-tab-center-btn {
          width: 52px; height: 52px; border-radius: 50%;
          background: #14161F;
          color: #F5EFE6;
          display: flex; align-items: center; justify-content: center;
          border: 1px solid #D97757;
          margin-bottom: 4px;
          transition: transform 0.3s cubic-bezier(0.16,1,0.3,1), background 0.3s;
        }
        .sh-tab-center:hover .sh-tab-center-btn { transform: translateY(-4px); background: #D97757; border-color: #D97757; color: #14161F; }
        .sh-tab-center.active .sh-tab-center-btn { background: #D97757; border-color: #D97757; color: #14161F; }

        /* ─── Drawer ─── */
        .sh-overlay {
          position: fixed; inset: 0;
          background: rgba(20,22,31,0.58);
          backdrop-filter: blur(6px);
          z-index: 45;
          opacity: 0; pointer-events: none;
          transition: opacity 0.35s cubic-bezier(0.16,1,0.3,1);
        }
        .sh-overlay.open { opacity: 1; pointer-events: auto; }
        .sh-drawer {
          position: fixed; top: 0; left: 0;
          width: 320px; max-width: 92vw; height: 100vh;
          background: #FDFAF3;
          z-index: 50;
          transform: translateX(-100%);
          transition: transform 0.4s cubic-bezier(0.16,1,0.3,1);
          display: flex; flex-direction: column;
          border-right: 1px solid rgba(20,22,31,0.08);
        }
        .sh-drawer.open { transform: translateX(0); }
        .sh-dh {
          position: relative;
          display: flex; justify-content: space-between; align-items: center;
          padding: 24px 24px 20px;
          background: #14161F;
          color: #F5EFE6;
          overflow: hidden;
        }
        .sh-dh::before {
          content: ''; position: absolute; inset: 0;
          opacity: 0.05; mix-blend-mode: overlay;
          background-image: url("${GRAIN}");
          pointer-events: none;
        }
        .sh-dh::after {
          content: ''; position: absolute;
          top: -40%; right: -20%; width: 60%; height: 140%;
          background: radial-gradient(closest-side, rgba(217,119,87,0.22), transparent 70%);
          filter: blur(40px); pointer-events: none;
        }
        .sh-dh > * { position: relative; }
        .sh-dp {
          padding: 18px 24px;
          border-bottom: 1px solid rgba(20,22,31,0.08);
          background: #F5EFE6;
        }
        .sh-profile-avatar {
          width: 40px; height: 40px; border-radius: 50%;
          background: #14161F; color: #F5EFE6;
          border: 1px solid #D97757;
          display: flex; align-items: center; justify-content: center;
          font-weight: 600; font-size: 14px;
          letter-spacing: 0.02em;
        }
        .sh-dn { flex: 1; overflow-y: auto; padding: 10px 14px; }
        .sh-gt {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px; font-weight: 500;
          text-transform: uppercase; letter-spacing: 0.28em;
          color: rgba(20,22,31,0.48);
          padding: 20px 12px 10px;
          display: flex; align-items: center; gap: 10px;
        }
        .sh-gt::before {
          content: ''; width: 5px; height: 5px; border-radius: 50%;
          background: #D97757;
        }
        .sh-nl {
          display: flex; align-items: center; gap: 14px;
          padding: 11px 14px;
          text-decoration: none;
          font-family: 'Figtree', sans-serif;
          font-size: 13.5px; font-weight: 500;
          color: rgba(20,22,31,0.78);
          border: 1px solid transparent;
          transition: all 0.25s cubic-bezier(0.16,1,0.3,1);
        }
        .sh-nl:hover { border-color: rgba(20,22,31,0.08); background: rgba(217,119,87,0.05); color: #14161F; }
        .sh-nl.active {
          background: #14161F; color: #F5EFE6; font-weight: 500;
          border-color: #14161F;
        }
        .sh-nl.active svg { color: #D97757; }
        .sh-df { padding: 18px 20px; border-top: 1px solid rgba(20,22,31,0.08); }
        .sh-logout {
          display: flex; align-items: center; gap: 12px;
          padding: 11px 14px;
          background: none; border: 1px solid transparent;
          cursor: pointer;
          font-family: 'Figtree', sans-serif;
          font-size: 13.5px; font-weight: 500;
          color: #8B3A2F;
          width: 100%;
          transition: border-color 0.25s, background 0.25s;
        }
        .sh-logout:hover { border-color: rgba(139,58,47,0.18); background: rgba(139,58,47,0.05); }

        @media (min-width: 768px) { .sh-body { padding: 40px 36px 120px; } }
        @media (prefers-reduced-motion: reduce) {
          .sh-drawer, .sh-overlay, .sh-tab, .sh-tab-center-btn { transition: none !important; }
        }
      `}</style>

      <div className="sh">
        {/* Drawer overlay */}
        <div className={`sh-overlay ${open ? 'open' : ''}`} onClick={() => setOpen(false)} />

        {/* Drawer */}
        <nav className={`sh-drawer ${open ? 'open' : ''}`}>
          <div className="sh-dh">
            <Logo size={24} variant="light" />
            <button
              onClick={() => setOpen(false)}
              aria-label="Fechar menu"
              style={{
                background: 'none',
                border: '1px solid transparent',
                cursor: 'pointer',
                color: 'rgba(245,239,230,0.8)',
                padding: 6,
                transition: 'border-color 0.25s',
              }}
              onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.borderColor = 'rgba(245,239,230,0.2)'}
              onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.borderColor = 'transparent'}
            >
              <X size={18} />
            </button>
          </div>

          {currentUser && (
            <div className="sh-dp">
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div className="sh-profile-avatar">{initials(currentUser.name)}</div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div
                    style={{
                      fontFamily: "'Fraunces', serif",
                      fontSize: 16,
                      fontWeight: 450,
                      letterSpacing: '-0.015em',
                      color: '#14161F',
                      lineHeight: 1.2,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {currentUser.name}
                  </div>
                  <div
                    style={{
                      fontFamily: "'Figtree', sans-serif",
                      fontSize: 11.5,
                      color: 'rgba(20,22,31,0.55)',
                      marginTop: 2,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {currentUser.email}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="sh-dn">
            {NAV_GROUPS.map(g => (
              <div key={g.title || 'main'}>
                {g.title && <div className="sh-gt">{g.title}</div>}
                {g.items.map(it => (
                  <NavLink
                    key={it.to}
                    to={it.to}
                    onClick={() => setOpen(false)}
                    className={({ isActive }) => `sh-nl ${isActive ? 'active' : ''}`}
                  >
                    <it.Icon size={17} /> {it.label}
                  </NavLink>
                ))}
              </div>
            ))}
          </div>

          <div className="sh-df">
            <button
              className="sh-logout"
              onClick={() => { localStorage.removeItem('eliamov_token'); window.location.href = '/login'; }}
            >
              <LogOut size={17} /> Sair da conta
            </button>
          </div>
        </nav>

        {/* Top bar */}
        {!hideHeader && (
          <div className="sh-bar">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button className="sh-menu" onClick={() => setOpen(true)} aria-label="Abrir menu">
                <Menu size={20} />
              </button>
              {streak > 0 && (
                <span className="sh-chip" title={`${streak} dia${streak > 1 ? 's' : ''} seguidos`}>
                  <Flame size={11} />
                  {streak}
                </span>
              )}
              <span className="sh-chip" title={`Nível ${level}`}>
                <span className="sh-chip-dot" style={{ background: '#C9A977' }} />
                LV {level}
              </span>
            </div>

            <Logo size={22} variant="light" />

            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Link to="/profile" className="sh-avatar-link" aria-label="Meu perfil">
                <div className="sh-avatar">{initials(currentUser?.name ?? '?')}</div>
              </Link>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="sh-body">
          {title && <h1 className="sh-title">{title}</h1>}
          {subtitle && <p className="sh-sub">{subtitle}</p>}
          {children}
        </div>

        {/* Tab bar */}
        <div className="sh-tabs">
          {TABS.map(({ to, label, Icon, center }) => (
            center ? (
              <NavLink key={to} to={to} className={({ isActive }) => `sh-tab-center ${isActive ? 'active' : ''}`}>
                <div className="sh-tab-center-btn">
                  <Icon size={22} />
                </div>
                <span>{label}</span>
              </NavLink>
            ) : (
              <NavLink key={to} to={to} className={({ isActive }) => `sh-tab ${isActive ? 'active' : ''}`}>
                <Icon size={20} />
                <span>{label}</span>
              </NavLink>
            )
          ))}
        </div>
      </div>
    </>
  );
}
