import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth, isProfileComplete } from '../contexts/AuthContext';
import Layout from '../components/Layout';
import { Icon } from '../components/icons';
import CycleGroupBanner from '../components/CycleGroupBanner';
import StoriesBar from '../components/StoriesBar';
import StoryViewer from '../components/StoryViewer';
import { StoryGroup } from '../services/stories.api';
import { storiesApi } from '../services/stories.api';
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
  { to: '/cycle', title: 'Ciclo', icon: 'cycle', accent: '#D97757' },
  { to: '/mood', title: 'Bem-estar', icon: 'flower', accent: '#B85A3D' },
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
  const [storyGroup, setStoryGroup] = useState<StoryGroup | null>(null);
  const [showCreateStory, setShowCreateStory] = useState(false);
  const [newStoryUrl, setNewStoryUrl] = useState('');
  const [newStoryType, setNewStoryType] = useState<'image' | 'video'>('image');
  const [creatingStory, setCreatingStory] = useState(false);

  const avatarUrl = currentUser?.profile?.avatarUrl as string | undefined;

  return (
    <Layout>
      <StoriesBar
        onOpenStory={setStoryGroup}
        onCreateStory={() => setShowCreateStory(true)}
      />

      {showCreateStory && (
        <div className="card" style={{ marginBottom: 16, padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <strong>Novo Story</strong>
            <button
              type="button"
              style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: 'var(--color-muted)' }}
              onClick={() => setShowCreateStory(false)}
            >
              &times;
            </button>
          </div>
          <input
            className="input"
            placeholder="URL da mídia"
            value={newStoryUrl}
            onChange={e => setNewStoryUrl(e.target.value)}
            style={{ marginBottom: 8 }}
          />
          <select
            className="input"
            value={newStoryType}
            onChange={e => setNewStoryType(e.target.value as 'image' | 'video')}
            style={{ marginBottom: 12 }}
          >
            <option value="image">Imagem</option>
            <option value="video">Vídeo</option>
          </select>
          <button
            className="btn btn-primary"
            disabled={!newStoryUrl.trim() || creatingStory}
            onClick={async () => {
              setCreatingStory(true);
              try {
                await storiesApi.create({ mediaUrl: newStoryUrl.trim(), mediaType: newStoryType });
                setNewStoryUrl('');
                setShowCreateStory(false);
              } catch {
                // ignore
              } finally {
                setCreatingStory(false);
              }
            }}
          >
            {creatingStory ? 'Publicando...' : 'Publicar'}
          </button>
        </div>
      )}

      {storyGroup && (
        <StoryViewer group={storyGroup} onClose={() => setStoryGroup(null)} />
      )}

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

      <CycleGroupBanner />

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
