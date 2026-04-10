import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Zap, Heart, Users, User } from 'lucide-react';

const tabs = [
  { to: '/home', label: 'Home', Icon: Home },
  { to: '/training', label: 'Treino', Icon: Zap },
  { to: '/feed', label: 'Social', Icon: Heart },
  { to: '/communities', label: 'Grupos', Icon: Users },
  { to: '/profile', label: 'Perfil', Icon: User },
];

export default function HomeTabBar() {
  return (
    <nav
      className="home-tab-bar"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: '#fff',
        boxShadow: '0 -1px 6px rgba(0,0,0,0.08)',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        height: 56,
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        zIndex: 100,
      }}
    >
      {tabs.map(({ to, label, Icon }) => (
        <NavLink
          key={to}
          to={to}
          style={({ isActive }) => ({
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textDecoration: 'none',
            color: isActive ? '#7c3aed' : '#9ca3af',
            fontSize: 10,
            fontWeight: isActive ? 600 : 400,
            gap: 2,
            flex: 1,
            height: '100%',
          })}
        >
          <Icon size={22} />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
