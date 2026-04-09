import React from 'react';
import { NavLink } from 'react-router-dom';

const HomeIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12L12 3l9 9" />
    <path d="M5 10v10h14V10" />
  </svg>
);

const CycleIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
);

const MoodIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const DropIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2.5s6 7 6 11.5a6 6 0 0 1-12 0c0-4.5 6-11.5 6-11.5z" />
  </svg>
);

const SparkleIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8" />
  </svg>
);

const items = [
  { to: '/dashboard', label: 'Início', Icon: HomeIcon },
  { to: '/cycle', label: 'Ciclo', Icon: CycleIcon },
  { to: '/mood', label: 'Humor', Icon: MoodIcon },
  { to: '/glucometer', label: 'Glicemia', Icon: DropIcon },
  { to: '/insights', label: 'Insights', Icon: SparkleIcon },
];

export const BottomNav: React.FC = () => {
  return (
    <nav className="bottom-nav">
      {items.map(({ to, label, Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
          end
        >
          <Icon />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
};

export default BottomNav;
