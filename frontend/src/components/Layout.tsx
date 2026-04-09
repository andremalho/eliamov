import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import BottomNav from './BottomNav';
import Drawer from './Drawer';

interface LayoutProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
}

const HamburgerIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="4" y1="7" x2="20" y2="7" />
    <line x1="4" y1="12" x2="20" y2="12" />
    <line x1="4" y1="17" x2="20" y2="17" />
  </svg>
);

const HomeIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12L12 3l9 9" />
    <path d="M5 10v10h14V10" />
  </svg>
);

export const Layout: React.FC<LayoutProps> = ({ title, subtitle, children }) => {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="app-shell">
      <header className="app-header">
        <button
          className="icon-button"
          onClick={() => setDrawerOpen(true)}
          aria-label="Abrir menu"
        >
          <HamburgerIcon />
        </button>

        <Link to="/dashboard" className="brand">
          EliaMov
        </Link>

        <Link to="/dashboard" className="icon-button" aria-label="Ir para início">
          <HomeIcon />
        </Link>
      </header>

      <main className="app-main">
        {title && (
          <header className="page-header">
            <h2>{title}</h2>
            {subtitle && <p className="muted">{subtitle}</p>}
          </header>
        )}
        {children}
      </main>

      <BottomNav />
      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </div>
  );
};

export default Layout;
