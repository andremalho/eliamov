import React, { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { gamificationApi } from '../services/gamification.api';
import Logo from './Logo';
import {
  Home, Droplets, Dumbbell, Apple, Heart, MessageCircle,
  Users, Zap, BookOpen, Brain, User, LogOut,
  Menu, X, Stethoscope, Trophy, TrendingUp, Scale, Flame, FlaskRound, Sun,
  Sparkles, Bell,
} from 'lucide-react';

const NAV_GROUPS = [
  { title: '', items: [
    { to: '/home', label: 'Home', Icon: Home },
    { to: '/training', label: 'Treino do dia', Icon: Dumbbell },
    { to: '/feed', label: 'Feed', Icon: MessageCircle },
    { to: '/insights', label: 'Insights IA', Icon: Sparkles },
  ]},
  { title: 'Saude', items: [
    { to: '/cycle', label: 'Ciclo menstrual', Icon: Droplets },
    { to: '/mood', label: 'Humor', Icon: Heart },
    { to: '/nutrition', label: 'Nutricao', Icon: Apple },
    { to: '/evolution', label: 'Evolucao', Icon: TrendingUp },
    { to: '/pregnancy', label: 'Gravidez', Icon: Heart },
    { to: '/menopause', label: 'Menopausa', Icon: Sun },
    { to: '/mental-health', label: 'Saude mental', Icon: Brain },
  ]},
  { title: 'Programas', items: [
    { to: '/weight-loss', label: 'Emagrecimento', Icon: Scale },
    { to: '/challenges', label: 'Desafios', Icon: Trophy },
    { to: '/communities', label: 'Comunidades', Icon: Users },
    { to: '/fertility', label: 'Fertilidade', Icon: Heart },
    { to: '/content', label: 'Conteudo', Icon: BookOpen },
  ]},
  { title: 'Mais', items: [
    { to: '/activities', label: 'Atividades', Icon: Zap },
    { to: '/appointments', label: 'Consultas', Icon: Stethoscope },
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
        .sh { min-height:100vh; background:#F8F7FC; font-family:'DM Sans',sans-serif; }

        /* ─── Top bar ─── */
        .sh-bar {
          display:flex; align-items:center; justify-content:space-between;
          padding:12px 20px;
          background:linear-gradient(135deg, #2D1B4E 0%, #4C1D95 100%);
          position:sticky; top:0; z-index:30;
        }
        .sh-menu { background:none; border:none; cursor:pointer; padding:6px; color:rgba(255,255,255,0.85); display:flex; align-items:center; border-radius:10px; transition:background 0.15s; }
        .sh-menu:hover { background:rgba(255,255,255,0.1); }

        /* ─── Content ─── */
        .sh-body { max-width:800px; margin:0 auto; padding:20px 16px 100px; }
        .sh-title { font-family:'Cormorant Garamond',serif; font-size:24px; font-weight:600; color:#2D1B4E; margin:0 0 4px; }
        .sh-sub { font-size:14px; color:#6B7280; margin:0 0 20px; }

        /* ─── Bottom tab bar ─── */
        .sh-tabs {
          display:flex; align-items:flex-end; justify-content:space-around;
          position:fixed; bottom:0; left:0; right:0;
          background:#fff;
          border-top:1px solid #EDE9FE;
          padding:0 0 env(safe-area-inset-bottom,4px);
          z-index:30;
          box-shadow:0 -2px 20px rgba(45,27,78,0.06);
        }
        .sh-tab {
          flex:1; display:flex; flex-direction:column; align-items:center; gap:2px;
          text-decoration:none; padding:8px 0 6px;
          color:#9CA3AF; font-size:10px; font-weight:500;
          transition:color 0.15s;
        }
        .sh-tab.active { color:#7C3AED; }
        .sh-tab .sh-tab-icon { transition:transform 0.15s; }
        .sh-tab.active .sh-tab-icon { transform:scale(1.1); }

        /* ─── Center tab (Insights) ─── */
        .sh-tab-center {
          flex:1; display:flex; flex-direction:column; align-items:center;
          text-decoration:none; color:#9CA3AF; font-size:10px; font-weight:600;
          padding:0 0 6px; margin-top:-18px;
          transition:color 0.15s;
        }
        .sh-tab-center.active { color:#7C3AED; }
        .sh-tab-center-btn {
          width:52px; height:52px; border-radius:50%;
          background:linear-gradient(135deg, #7C3AED 0%, #9333EA 100%);
          display:flex; align-items:center; justify-content:center;
          box-shadow:0 4px 20px rgba(124,58,237,0.35);
          margin-bottom:2px;
          transition:transform 0.2s, box-shadow 0.2s;
        }
        .sh-tab-center:hover .sh-tab-center-btn { transform:scale(1.08); box-shadow:0 6px 24px rgba(124,58,237,0.45); }
        .sh-tab-center.active .sh-tab-center-btn {
          background:linear-gradient(135deg, #6D28D9 0%, #7C3AED 100%);
          box-shadow:0 4px 24px rgba(124,58,237,0.5);
        }

        /* ─── Drawer ─── */
        .sh-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.5); backdrop-filter:blur(4px); z-index:45; opacity:0; pointer-events:none; transition:opacity 0.3s; }
        .sh-overlay.open { opacity:1; pointer-events:auto; }
        .sh-drawer {
          position:fixed; top:0; left:0; width:300px; height:100vh;
          background:#fff; z-index:50;
          transform:translateX(-100%); transition:transform 0.3s cubic-bezier(0.4,0,0.2,1);
          display:flex; flex-direction:column;
          box-shadow:8px 0 40px rgba(0,0,0,0.12);
        }
        .sh-drawer.open { transform:translateX(0); }
        .sh-dh {
          display:flex; justify-content:space-between; align-items:center;
          padding:20px 20px 16px;
          background:linear-gradient(135deg, #2D1B4E 0%, #4C1D95 100%);
        }
        .sh-dp {
          padding:16px 20px;
          border-bottom:1px solid #F3F4F6;
          background:#FAFAFE;
        }
        .sh-dn { flex:1; overflow-y:auto; padding:8px 12px; }
        .sh-gt { font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:1.2px; color:#C4B5FD; padding:18px 10px 6px; }
        .sh-nl {
          display:flex; align-items:center; gap:12px;
          padding:10px 12px; border-radius:10px;
          text-decoration:none; font-size:13.5px; font-weight:500;
          color:#4B5563; transition:all 0.15s;
        }
        .sh-nl:hover { background:#F5F3FF; color:#2D1B4E; }
        .sh-nl.active { background:#EDE9FE; color:#7C3AED; font-weight:600; }
        .sh-df { padding:16px; border-top:1px solid #F3F4F6; }

        @media(min-width:768px) { .sh-body { padding:28px 32px 100px; } }
      `}</style>

      <div className="sh">
        {/* Drawer overlay */}
        <div className={`sh-overlay ${open ? 'open' : ''}`} onClick={() => setOpen(false)} />

        {/* Drawer */}
        <nav className={`sh-drawer ${open ? 'open' : ''}`}>
          <div className="sh-dh">
            <Logo size={22} variant="light" />
            <button onClick={() => setOpen(false)} style={{ background:'none', border:'none', cursor:'pointer', color:'rgba(255,255,255,0.7)', padding:4 }}><X size={20} /></button>
          </div>
          {currentUser && (
            <div className="sh-dp">
              <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                <div style={{ width:40, height:40, borderRadius:'50%', background:'linear-gradient(135deg, #7C3AED, #9333EA)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:700, fontSize:14, boxShadow:'0 2px 8px rgba(124,58,237,0.25)' }}>
                  {ini(currentUser.name)}
                </div>
                <div>
                  <div style={{ fontSize:14, fontWeight:600, color:'#111827' }}>{currentUser.name}</div>
                  <div style={{ fontSize:11, color:'#6B7280', marginTop:1 }}>{currentUser.email}</div>
                </div>
              </div>
            </div>
          )}
          <div className="sh-dn">
            {NAV_GROUPS.map(g => (
              <div key={g.title}>
                {g.title && <div className="sh-gt">{g.title}</div>}
                {g.items.map(it => (
                  <NavLink key={it.to} to={it.to} onClick={() => setOpen(false)} className={({ isActive }) => `sh-nl ${isActive ? 'active' : ''}`}>
                    <it.Icon size={17} /> {it.label}
                  </NavLink>
                ))}
              </div>
            ))}
          </div>
          <div className="sh-df">
            <button onClick={() => { localStorage.removeItem('eliamov_token'); window.location.href = '/login'; }} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 12px', borderRadius:10, background:'none', border:'none', cursor:'pointer', fontSize:13.5, fontWeight:500, color:'#DC2626', width:'100%', transition:'background 0.15s' }}>
              <LogOut size={17} /> Sair da conta
            </button>
          </div>
        </nav>

        {/* Top bar */}
        {!hideHeader && (
          <div className="sh-bar">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button className="sh-menu" onClick={() => setOpen(true)}><Menu size={22} /></button>
              {streak > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(255,255,255,0.15)', padding: '4px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700, color: '#FCD34D', backdropFilter: 'blur(4px)' }}>
                  <Flame size={13} /> {streak}
                </div>
              )}
            </div>
            <Logo size={20} variant="light" />
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Link to="/profile" style={{ textDecoration:'none' }}>
                <div style={{ width:34, height:34, borderRadius:'50%', background:'rgba(255,255,255,0.15)', border:'2px solid rgba(255,255,255,0.3)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:700, fontSize:12, transition:'border-color 0.15s' }}>
                  {ini(currentUser?.name ?? '?')}
                </div>
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

        {/* Tab bar with center Insights button */}
        <div className="sh-tabs">
          {TABS.map(({ to, label, Icon, center }) => (
            center ? (
              <NavLink key={to} to={to} className={({ isActive }) => `sh-tab-center ${isActive ? 'active' : ''}`}>
                <div className="sh-tab-center-btn">
                  <Icon size={24} color="#fff" />
                </div>
                <span>{label}</span>
              </NavLink>
            ) : (
              <NavLink key={to} to={to} className={({ isActive }) => `sh-tab ${isActive ? 'active' : ''}`}>
                <span className="sh-tab-icon"><Icon size={21} /></span>
                <span>{label}</span>
              </NavLink>
            )
          ))}
        </div>
      </div>
    </>
  );
}
