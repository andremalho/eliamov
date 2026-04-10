import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Award,
  FileText,
  Settings,
} from 'lucide-react';
import Overview from './Overview';
import Members from './Members';
import Trainers from './Trainers';
import Challenges from './Challenges';
import Content from './Content';
import SettingsPanel from './Settings';

type Section = 'overview' | 'members' | 'trainers' | 'challenges' | 'content' | 'settings';

const NAV_ITEMS: { key: Section; label: string; icon: React.ReactNode }[] = [
  { key: 'overview', label: 'Visao geral', icon: <LayoutDashboard size={20} /> },
  { key: 'members', label: 'Membros', icon: <Users size={20} /> },
  { key: 'trainers', label: 'Profissionais', icon: <UserCheck size={20} /> },
  { key: 'challenges', label: 'Desafios', icon: <Award size={20} /> },
  { key: 'content', label: 'Conteudo', icon: <FileText size={20} /> },
  { key: 'settings', label: 'Config', icon: <Settings size={20} /> },
];

const ALLOWED_ROLES = ['academy_admin', 'academy_manager', 'admin', 'super_admin', 'tenant_admin'];

const AdminPanel: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<Section>('overview');

  useEffect(() => {
    if (currentUser && !ALLOWED_ROLES.includes(currentUser.role)) {
      navigate('/home');
    }
  }, [currentUser, navigate]);

  if (!currentUser) {
    return (
      <div className="adm-screen">
        <p className="adm-loading">Carregando...</p>
      </div>
    );
  }

  if (!ALLOWED_ROLES.includes(currentUser.role)) {
    return null;
  }

  const renderSection = () => {
    switch (activeSection) {
      case 'overview':
        return <Overview />;
      case 'members':
        return <Members />;
      case 'trainers':
        return <Trainers />;
      case 'challenges':
        return <Challenges />;
      case 'content':
        return <Content />;
      case 'settings':
        return <SettingsPanel />;
    }
  };

  return (
    <div className="adm-screen">
      {/* Desktop sidebar */}
      <aside className="adm-sidebar">
        <div className="adm-sidebar-brand">
          <LayoutDashboard size={22} />
          <span>Admin</span>
        </div>
        <nav className="adm-sidebar-nav">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.key}
              className={`adm-sidebar-btn ${activeSection === item.key ? 'adm-sidebar-btn-active' : ''}`}
              onClick={() => setActiveSection(item.key)}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="adm-sidebar-user">
          <span className="adm-sidebar-user-name">{currentUser.name}</span>
          <span className="adm-sidebar-user-role">{currentUser.role}</span>
        </div>
      </aside>

      {/* Main content */}
      <main className="adm-main">
        <header className="adm-header">
          <h1 className="adm-header-title">
            {NAV_ITEMS.find((n) => n.key === activeSection)?.label || 'Admin'}
          </h1>
        </header>
        <div className="adm-body">{renderSection()}</div>
      </main>

      {/* Mobile bottom tabs */}
      <nav className="adm-bottom-tabs">
        {NAV_ITEMS.slice(0, 5).map((item) => (
          <button
            key={item.key}
            className={`adm-bottom-tab ${activeSection === item.key ? 'adm-bottom-tab-active' : ''}`}
            onClick={() => setActiveSection(item.key)}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default AdminPanel;
