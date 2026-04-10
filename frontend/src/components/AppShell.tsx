import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Logo from './Logo';
import {
  Home, Droplets, Dumbbell, Apple, Heart, MessageCircle,
  Users, Zap, BookOpen, Brain, User, Settings, LogOut,
  Menu, X, Activity, FlaskRound, Stethoscope, Watch,
  Gauge, Trophy, ShoppingBag, GraduationCap,
} from 'lucide-react';

const V = '#7C3AED';

const NAV_GROUPS = [
  {
    title: 'Principal',
    items: [
      { to: '/home', label: 'Home', Icon: Home },
      { to: '/insights', label: 'Insights IA', Icon: Brain },
    ],
  },
  {
    title: 'Saude',
    items: [
      { to: '/cycle', label: 'Ciclo', Icon: Droplets },
      { to: '/mood', label: 'Humor', Icon: Heart },
      { to: '/glucometer', label: 'Glicemia', Icon: Activity },
      { to: '/blood-pressure', label: 'Pressao', Icon: Gauge },
    ],
  },
  {
    title: 'Plano',
    items: [
      { to: '/training', label: 'Treino', Icon: Dumbbell },
      { to: '/nutrition', label: 'Nutricao', Icon: Apple },
      { to: '/activities', label: 'Atividades', Icon: Zap },
      { to: '/lab-exams', label: 'Exames', Icon: FlaskRound },
      { to: '/appointments', label: 'Consultas', Icon: Stethoscope },
      { to: '/wearables', label: 'Wearables', Icon: Watch },
    ],
  },
  {
    title: 'Social',
    items: [
      { to: '/feed', label: 'Feed', Icon: MessageCircle },
      { to: '/communities', label: 'Grupos', Icon: Users },
      { to: '/challenges', label: 'Desafios', Icon: Trophy },
      { to: '/content', label: 'Conteudo', Icon: BookOpen },
      { to: '/courses', label: 'Cursos', Icon: GraduationCap },
      { to: '/marketplace', label: 'Marketplace', Icon: ShoppingBag },
    ],
  },
  {
    title: 'Conta',
    items: [
      { to: '/profile', label: 'Perfil', Icon: User },
    ],
  },
];

const MOBILE_TABS = [
  { to: '/home', label: 'Home', Icon: Home },
  { to: '/training', label: 'Treino', Icon: Dumbbell },
  { to: '/feed', label: 'Social', Icon: MessageCircle },
  { to: '/communities', label: 'Grupos', Icon: Users },
  { to: '/profile', label: 'Perfil', Icon: User },
];

interface AppShellProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export default function AppShell({ children, title, subtitle }: AppShellProps) {
  const { currentUser } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const getInitials = (n: string) => {
    const p = n.trim().split(/\s+/);
    return p.length === 1 ? (p[0][0]?.toUpperCase() ?? '?') : (p[0][0] + p[p.length - 1][0]).toUpperCase();
  };

  return (
    <>
      <style>{`
        .shell { display: flex; min-height: 100vh; background: #F9FAFB; font-family: 'DM Sans', sans-serif; }

        /* Sidebar - desktop only */
        .shell-sidebar {
          display: none; width: 220px; background: #fff; border-right: 1px solid #E5E7EB;
          flex-shrink: 0; position: fixed; top: 0; left: 0; height: 100vh;
          overflow-y: auto; z-index: 40; flex-direction: column;
        }
        .shell-sidebar-logo { padding: 20px 16px 12px; }
        .shell-sidebar-nav { flex: 1; padding: 0 8px; overflow-y: auto; }
        .shell-sidebar-group-title {
          font-size: 10px; font-weight: 600; text-transform: uppercase;
          letter-spacing: 1px; color: #9CA3AF; padding: 16px 10px 6px;
        }
        .shell-sidebar-link {
          display: flex; align-items: center; gap: 10px; padding: 8px 10px;
          border-radius: 8px; text-decoration: none; font-size: 13px; font-weight: 500;
          color: #6B7280; transition: all 0.15s;
        }
        .shell-sidebar-link:hover { background: #F9FAFB; color: #111827; }
        .shell-sidebar-link.active { background: #EDE9FE; color: ${V}; }
        .shell-sidebar-footer { padding: 12px 8px; border-top: 1px solid #E5E7EB; }

        /* Main */
        .shell-main { flex: 1; min-width: 0; }
        .shell-content { max-width: 800px; margin: 0 auto; padding: 20px 20px 90px; }

        /* Top bar - mobile only */
        .shell-topbar {
          display: flex; align-items: center; justify-content: space-between;
          padding: 12px 16px; background: #fff; border-bottom: 1px solid #E5E7EB;
          position: sticky; top: 0; z-index: 30;
        }
        .shell-hamburger {
          background: none; border: none; cursor: pointer; padding: 4px;
          color: #374151; display: flex; align-items: center;
        }

        /* Bottom tabs - mobile only */
        .shell-tabs {
          display: flex; position: fixed; bottom: 0; left: 0; right: 0;
          background: #fff; border-top: 1px solid #E5E7EB;
          padding: 6px 0 env(safe-area-inset-bottom, 6px); z-index: 30;
        }
        .shell-tab {
          flex: 1; display: flex; flex-direction: column; align-items: center;
          gap: 2px; text-decoration: none; padding: 4px 0;
          color: #9CA3AF; font-size: 9px; font-weight: 500; transition: color 0.15s;
        }
        .shell-tab.active { color: ${V}; }

        /* Mobile drawer overlay */
        .shell-overlay {
          display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.4);
          z-index: 45;
        }
        .shell-overlay.open { display: block; }
        .shell-mobile-drawer {
          position: fixed; top: 0; left: -280px; width: 260px; height: 100vh;
          background: #fff; z-index: 50; transition: left 0.25s ease;
          overflow-y: auto; display: flex; flex-direction: column;
        }
        .shell-mobile-drawer.open { left: 0; }

        /* Page header */
        .shell-page-header { margin-bottom: 20px; }
        .shell-page-title { font-size: 22px; font-weight: 600; color: #111827; margin: 0; }
        .shell-page-subtitle { font-size: 14px; color: #6B7280; margin-top: 4px; }

        @media (min-width: 768px) {
          .shell-sidebar { display: flex; }
          .shell-main { margin-left: 220px; }
          .shell-topbar { display: none; }
          .shell-tabs { display: none; }
          .shell-content { padding: 28px 32px 40px; }
        }
      `}</style>

      <div className="shell">
        {/* ── Desktop sidebar ──────────────────────────────────── */}
        <aside className="shell-sidebar">
          <div className="shell-sidebar-logo"><Logo size={22} variant="dark" /></div>
          <nav className="shell-sidebar-nav">
            {NAV_GROUPS.map(g => (
              <div key={g.title}>
                <div className="shell-sidebar-group-title">{g.title}</div>
                {g.items.map(item => (
                  <NavLink key={item.to} to={item.to} className={({ isActive }) => `shell-sidebar-link ${isActive ? 'active' : ''}`}>
                    <item.Icon size={16} /> {item.label}
                  </NavLink>
                ))}
              </div>
            ))}
          </nav>
          <div className="shell-sidebar-footer">
            <button onClick={() => { localStorage.removeItem('eliamov_token'); window.location.href = '/login'; }}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 8, background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500, color: '#DC2626', width: '100%' }}>
              <LogOut size={16} /> Sair
            </button>
          </div>
        </aside>

        {/* ── Mobile drawer ────────────────────────────────────── */}
        <div className={`shell-overlay ${drawerOpen ? 'open' : ''}`} onClick={() => setDrawerOpen(false)} />
        <div className={`shell-mobile-drawer ${drawerOpen ? 'open' : ''}`}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px' }}>
            <Logo size={20} variant="dark" />
            <button onClick={() => setDrawerOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', padding: 4 }}>
              <X size={20} />
            </button>
          </div>
          {currentUser && (
            <div style={{ padding: '0 16px 12px', borderBottom: '1px solid #E5E7EB', marginBottom: 8 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>{currentUser.name}</div>
              <div style={{ fontSize: 12, color: '#6B7280' }}>{currentUser.email}</div>
            </div>
          )}
          <nav style={{ flex: 1, padding: '0 8px', overflowY: 'auto' }}>
            {NAV_GROUPS.map(g => (
              <div key={g.title}>
                <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, color: '#9CA3AF', padding: '12px 10px 4px' }}>{g.title}</div>
                {g.items.map(item => (
                  <NavLink key={item.to} to={item.to} onClick={() => setDrawerOpen(false)}
                    className={({ isActive }) => `shell-sidebar-link ${isActive ? 'active' : ''}`}>
                    <item.Icon size={16} /> {item.label}
                  </NavLink>
                ))}
              </div>
            ))}
          </nav>
          <div style={{ padding: '12px 8px', borderTop: '1px solid #E5E7EB' }}>
            <button onClick={() => { localStorage.removeItem('eliamov_token'); window.location.href = '/login'; }}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 8, background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500, color: '#DC2626', width: '100%' }}>
              <LogOut size={16} /> Sair
            </button>
          </div>
        </div>

        {/* ── Main area ────────────────────────────────────────── */}
        <div className="shell-main">
          {/* Mobile top bar */}
          <div className="shell-topbar">
            <button className="shell-hamburger" onClick={() => setDrawerOpen(true)}>
              <Menu size={22} />
            </button>
            <Logo size={18} variant="dark" />
            <Link to="/profile" style={{ textDecoration: 'none' }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: V, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#EDE9FE', fontWeight: 700, fontSize: 12 }}>
                {getInitials(currentUser?.name ?? '?')}
              </div>
            </Link>
          </div>

          {/* Page content */}
          <div className="shell-content">
            {title && (
              <div className="shell-page-header">
                <h1 className="shell-page-title">{title}</h1>
                {subtitle && <p className="shell-page-subtitle">{subtitle}</p>}
              </div>
            )}
            {children}
          </div>
        </div>

        {/* ── Mobile tabs ──────────────────────────────────────── */}
        <div className="shell-tabs">
          {MOBILE_TABS.map(({ to, label, Icon }) => (
            <NavLink key={to} to={to} className={({ isActive }) => `shell-tab ${isActive ? 'active' : ''}`}>
              <Icon size={20} /> <span>{label}</span>
            </NavLink>
          ))}
        </div>
      </div>
    </>
  );
}
