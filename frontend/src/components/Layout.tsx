import React from 'react';
import AppShell from './AppShell';

interface LayoutProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ title, subtitle, children }) => {
  return (
    <AppShell title={title} subtitle={subtitle}>
      {children}
    </AppShell>
  );
};

export default Layout;
