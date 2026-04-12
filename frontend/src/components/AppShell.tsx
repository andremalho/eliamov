import React, { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { gamificationApi } from '../services/gamification.api';
import Logo from './Logo';
import {
  Home, Droplets, Dumbbell, Apple, Heart, MessageCircle,
  Users, Zap, BookOpen, Brain, User, LogOut,
  Menu, X, Stethoscope, Trophy, TrendingUp, Scale, Flame,
} from 'lucide-react';

const NAV_GROUPS = [
  { title: '', items: [
    { to: '/home', label: 'Home', Icon: Home },
    { to: '/training', label: 'Treino do dia', Icon: Dumbbell },
    { to: '/feed', label: 'Feed', Icon: MessageCircle },
  ]},
  { title: 'Saude', items: [
    { to: '/cycle', label: 'Ciclo menstrual', Icon: Droplets },
    { to: '/mood', label: 'Humor', Icon: Heart },
    { to: '/nutrition', label: 'Nutricao', Icon: Apple },
    { to: '/evolution', label: 'Evolucao', Icon: TrendingUp },
  ]},
  { title: 'Programas', items: [
    { to: '/weight-loss', label: 'Emagrecimento', Icon: Scale },
    { to: '/challenges', label: 'Desafios', Icon: Trophy },
    { to: '/communities', label: 'Comunidades', Icon: Users },
    { to: '/content', label: 'Conteudo', Icon: BookOpen },
  ]},
  { title: 'Mais', items: [
    { to: '/activities', label: 'Atividades', Icon: Zap },
    { to: '/appointments', label: 'Consultas', Icon: Stethoscope },
    { to: '/insights', label: 'Insights IA', Icon: Brain },
    { to: '/profile', label: 'Perfil', Icon: User },
  ]},
];

const TABS = [
  { to: '/home', label: 'Home', Icon: Home },
  { to: '/training', label: 'Treino', Icon: Dumbbell },
  { to: '/feed', label: 'Feed', Icon: MessageCircle },
  { to: '/profile', label: 'Perfil', Icon: User },
];

interface Props { children: React.ReactNode; title?: string; subtitle?: string; hideHeader?: boolean; }

export default function AppShell({ children, title, subtitle, hideHeader }: Props) {
  const { currentUser } = useAuth();
  const [open, setOpen] = useState(false);
  const [streak, setStreak] = useState(0);
  const ini = (n: string) => { const p = n.trim().split(/\s+/); return p.length === 1 ? (p[0][0]?.toUpperCase() ?? '?') : (p[0][0] + p[p.length - 1][0]).toUpperCase(); };

  useEffect(() => {
    gamificationApi.stats().then((s) => setStreak(s.currentStreak)).catch(() => {});
  }, []);

  return (
    <>
      <style>{`
        .sh { min-height:100vh; background:#F9FAFB; font-family:'DM Sans',sans-serif; }
        .sh-bar { display:flex; align-items:center; justify-content:space-between; padding:10px 16px; background:#fff; border-bottom:1px solid #E5E7EB; position:sticky; top:0; z-index:30; }
        .sh-menu { background:none; border:none; cursor:pointer; padding:6px; color:#374151; display:flex; align-items:center; border-radius:8px; }
        .sh-menu:hover { background:#F3F4F6; }
        .sh-body { max-width:800px; margin:0 auto; padding:20px 16px 90px; }
        .sh-title { font-family:'Cormorant Garamond',serif; font-size:24px; font-weight:600; color:#2D1B4E; margin:0 0 4px; }
        .sh-sub { font-size:14px; color:#6B7280; margin:0 0 20px; }
        .sh-tabs { display:flex; position:fixed; bottom:0; left:0; right:0; background:#fff; border-top:1px solid #E5E7EB; padding:6px 0 env(safe-area-inset-bottom,6px); z-index:30; }
        .sh-tab { flex:1; display:flex; flex-direction:column; align-items:center; gap:2px; text-decoration:none; padding:4px 0; color:#9CA3AF; font-size:9px; font-weight:500; transition:color 0.15s; }
        .sh-tab.active { color:#7C3AED; }
        .sh-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.5); backdrop-filter:blur(2px); z-index:45; opacity:0; pointer-events:none; transition:opacity 0.25s; }
        .sh-overlay.open { opacity:1; pointer-events:auto; }
        .sh-drawer { position:fixed; top:0; left:0; width:280px; height:100vh; background:#fff; z-index:50; transform:translateX(-100%); transition:transform 0.25s ease; display:flex; flex-direction:column; box-shadow:4px 0 24px rgba(0,0,0,0.08); }
        .sh-drawer.open { transform:translateX(0); }
        .sh-dh { display:flex; justify-content:space-between; align-items:center; padding:16px 16px 12px; border-bottom:1px solid #E5E7EB; }
        .sh-dp { padding:12px 16px; border-bottom:1px solid #E5E7EB; }
        .sh-dn { flex:1; overflow-y:auto; padding:8px; }
        .sh-gt { font-size:10px; font-weight:600; text-transform:uppercase; letter-spacing:1px; color:#9CA3AF; padding:14px 10px 4px; }
        .sh-nl { display:flex; align-items:center; gap:10px; padding:9px 10px; border-radius:8px; text-decoration:none; font-size:13px; font-weight:500; color:#6B7280; transition:all 0.15s; }
        .sh-nl:hover { background:#F9FAFB; color:#111827; }
        .sh-nl.active { background:#EDE9FE; color:#7C3AED; }
        .sh-df { padding:12px; border-top:1px solid #E5E7EB; }
        @media(min-width:768px) { .sh-body { padding:28px 32px 40px; } }
      `}</style>

      <div className="sh">
        {/* Drawer overlay */}
        <div className={`sh-overlay ${open ? 'open' : ''}`} onClick={() => setOpen(false)} />

        {/* Drawer */}
        <nav className={`sh-drawer ${open ? 'open' : ''}`}>
          <div className="sh-dh">
            <Logo size={22} variant="dark" />
            <button onClick={() => setOpen(false)} style={{ background:'none', border:'none', cursor:'pointer', color:'#6B7280', padding:4 }}><X size={20} /></button>
          </div>
          {currentUser && (
            <div className="sh-dp">
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <div style={{ width:36, height:36, borderRadius:'50%', background:'#7C3AED', display:'flex', alignItems:'center', justifyContent:'center', color:'#EDE9FE', fontWeight:700, fontSize:13 }}>
                  {ini(currentUser.name)}
                </div>
                <div>
                  <div style={{ fontSize:14, fontWeight:600, color:'#111827' }}>{currentUser.name}</div>
                  <div style={{ fontSize:11, color:'#6B7280' }}>{currentUser.email}</div>
                </div>
              </div>
            </div>
          )}
          <div className="sh-dn">
            {NAV_GROUPS.map(g => (
              <div key={g.title}>
                <div className="sh-gt">{g.title}</div>
                {g.items.map(it => (
                  <NavLink key={it.to} to={it.to} onClick={() => setOpen(false)} className={({ isActive }) => `sh-nl ${isActive ? 'active' : ''}`}>
                    <it.Icon size={16} /> {it.label}
                  </NavLink>
                ))}
              </div>
            ))}
          </div>
          <div className="sh-df">
            <button onClick={() => { localStorage.removeItem('eliamov_token'); window.location.href = '/login'; }} style={{ display:'flex', alignItems:'center', gap:8, padding:'9px 10px', borderRadius:8, background:'none', border:'none', cursor:'pointer', fontSize:13, fontWeight:500, color:'#DC2626', width:'100%' }}>
              <LogOut size={16} /> Sair da conta
            </button>
          </div>
        </nav>

        {/* Top bar */}
        {!hideHeader && (
          <div className="sh-bar">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button className="sh-menu" onClick={() => setOpen(true)}><Menu size={22} /></button>
              {streak > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 3, background: '#FEF3C7', padding: '3px 8px', borderRadius: 999, fontSize: 11, fontWeight: 600, color: '#92400E' }}>
                  <Flame size={12} /> {streak}
                </div>
              )}
            </div>
            <Logo size={18} variant="dark" />
            <Link to="/profile" style={{ textDecoration:'none' }}>
              <div style={{ width:32, height:32, borderRadius:'50%', background:'#7C3AED', display:'flex', alignItems:'center', justifyContent:'center', color:'#EDE9FE', fontWeight:700, fontSize:12 }}>
                {ini(currentUser?.name ?? '?')}
              </div>
            </Link>
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
          {TABS.map(({ to, label, Icon }) => (
            <NavLink key={to} to={to} className={({ isActive }) => `sh-tab ${isActive ? 'active' : ''}`}>
              <Icon size={20} /> <span>{label}</span>
            </NavLink>
          ))}
        </div>
      </div>
    </>
  );
}
