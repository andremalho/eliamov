import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth, isProfileComplete } from '../contexts/AuthContext';
import Layout from '../components/Layout';
import { Icon } from '../components/icons';
import ProfileMenuModal from '../components/profile-modals/ProfileMenuModal';
import LifeMomentModal from '../components/profile-modals/LifeMomentModal';
import ProfilePhotoModal from '../components/profile-modals/ProfilePhotoModal';

interface FeatureTile {
  to: string;
  title: string;
  icon: string;
  accent: string;
}

const features: FeatureTile[] = [
  { to: '/cycle', title: 'Ciclo', icon: 'cycle', accent: '#ec4899' },
  { to: '/mood', title: 'Bem-estar', icon: 'flower', accent: '#a855f7' },
  { to: '/glucometer', title: 'Glicemia', icon: 'droplet', accent: '#f59e0b' },
  { to: '/blood-pressure', title: 'Pressão', icon: 'activity', accent: '#ef4444' },
  { to: '/training', title: 'Treino', icon: 'dumbbell', accent: '#14b8a6' },
  { to: '/nutrition', title: 'Nutrição', icon: 'salad', accent: '#10b981' },
  { to: '/wearables', title: 'Wearables', icon: 'watch', accent: '#3b82f6' },
  { to: '/lab-exams', title: 'Exames', icon: 'flask', accent: '#6366f1' },
];

const initials = (name?: string) => {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0]?.toUpperCase() ?? '?';
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export default function Dashboard() {
  const { currentUser } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [lifeMomentOpen, setLifeMomentOpen] = useState(false);
  const [photoOpen, setPhotoOpen] = useState(false);

  const avatarUrl = currentUser?.profile?.avatarUrl as string | undefined;

  return (
    <Layout>
      {!isProfileComplete(currentUser) && (
        <Link to="/onboarding" className="banner">
          <div>
            <strong>Complete seu perfil</strong>
            <span className="muted small"> — leva 3 minutos e melhora seus insights.</span>
          </div>
          <span aria-hidden>›</span>
        </Link>
      )}

      <button
        type="button"
        className="profile-strip-button"
        onClick={() => setMenuOpen(true)}
        aria-label="Abrir opções do perfil"
      >
        <div className={`avatar ${avatarUrl ? 'has-photo' : ''}`} aria-hidden>
          {avatarUrl ? <img src={avatarUrl} alt="" /> : initials(currentUser?.name)}
        </div>
        <div>
          <p className="muted small">Bem-vinda</p>
          <h2 className="profile-name">{currentUser?.name?.split(' ')[0]}</h2>
        </div>
      </button>

      <Link to="/insights" className="hero-card">
        <div className="hero-card-icon">
          <Icon name="sparkles" size={32} />
        </div>
        <div className="hero-card-body">
          <h3>Insights</h3>
          <p>Análise individual sob medida para seus desejos.</p>
        </div>
        <div className="hero-card-cta" aria-hidden>
          →
        </div>
      </Link>

      <div className="section-label">Acompanhamento</div>

      <div className="feature-grid">
        {features.map((f) => (
          <Link
            key={f.to}
            to={f.to}
            className="feature-tile"
            style={{ ['--accent' as any]: f.accent }}
          >
            <div className="feature-tile-icon">
              <Icon name={f.icon} size={22} />
            </div>
            <span className="feature-tile-title">{f.title}</span>
          </Link>
        ))}
      </div>

      <ProfileMenuModal
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        onOpenLifeMoment={() => {
          setMenuOpen(false);
          setLifeMomentOpen(true);
        }}
        onOpenPhoto={() => {
          setMenuOpen(false);
          setPhotoOpen(true);
        }}
      />
      <LifeMomentModal open={lifeMomentOpen} onClose={() => setLifeMomentOpen(false)} />
      <ProfilePhotoModal open={photoOpen} onClose={() => setPhotoOpen(false)} />
    </Layout>
  );
}
