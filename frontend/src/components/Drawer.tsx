import React, { useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface DrawerProps {
  open: boolean;
  onClose: () => void;
}

interface NavItem {
  to: string;
  label: string;
}

const groups: { title: string; items: NavItem[] }[] = [
  {
    title: 'Início',
    items: [
      { to: '/dashboard', label: 'Dashboard' },
      { to: '/insights', label: 'Insights' },
    ],
  },
  {
    title: 'Saúde feminina',
    items: [
      { to: '/cycle', label: 'Ciclo menstrual' },
      { to: '/mood', label: 'Humor & bem-estar' },
    ],
  },
  {
    title: 'Vitais',
    items: [
      { to: '/glucometer', label: 'Glicemia' },
      { to: '/blood-pressure', label: 'Pressão arterial' },
      { to: '/wearables', label: 'Wearables' },
    ],
  },
  {
    title: 'Plano',
    items: [
      { to: '/activities', label: 'Atividades' },
      { to: '/training', label: 'Treino' },
      { to: '/nutrition', label: 'Nutrição' },
      { to: '/lab-exams', label: 'Exames' },
      { to: '/appointments', label: 'Consultas' },
    ],
  },
  {
    title: 'Comunidade',
    items: [
      { to: '/communities', label: 'Grupos' },
      { to: '/feed', label: 'Feed' },
      { to: '/challenges', label: 'Desafios' },
      { to: '/community', label: 'Fórum' },
      { to: '/chat', label: 'Chat' },
      { to: '/content', label: 'Conteúdos' },
      { to: '/courses', label: 'Cursos' },
      { to: '/marketplace', label: 'Marketplace' },
    ],
  },
  {
    title: 'Conta',
    items: [
      { to: '/profile', label: 'Meu perfil' },
      { to: '/onboarding', label: 'Atualizar perfil' },
    ],
  },
];

const ChevronRight = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

export const Drawer: React.FC<DrawerProps> = ({ open, onClose }) => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const handleLogout = () => {
    logout();
    onClose();
    navigate('/login');
  };

  return (
    <>
      <div className={`drawer-backdrop ${open ? 'open' : ''}`} onClick={onClose} />
      <aside className={`drawer ${open ? 'open' : ''}`} aria-hidden={!open}>
        <div className="drawer-header">
          <div>
            <div className="brand">EliaMov</div>
            {currentUser && <div className="muted small">{currentUser.name}</div>}
          </div>
          <button className="link-button" onClick={onClose} aria-label="Fechar menu">
            ✕
          </button>
        </div>

        <nav className="drawer-nav">
          {groups.map((group) => (
            <div key={group.title} className="drawer-group">
              <div className="drawer-group-title">{group.title}</div>
              {group.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={onClose}
                  className={({ isActive }) => `drawer-item ${isActive ? 'active' : ''}`}
                  end
                >
                  <span>{item.label}</span>
                  <span className="drawer-chevron">
                    <ChevronRight />
                  </span>
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div className="drawer-footer">
          <button className="link-button" onClick={handleLogout}>
            Sair da conta
          </button>
        </div>
      </aside>
    </>
  );
};

export default Drawer;
