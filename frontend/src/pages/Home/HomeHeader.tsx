import React from 'react';
import { Bell } from 'lucide-react';
import { User } from '../../contexts/AuthContext';
import { CurrentPhase } from '../../services/cycle.api';

// Tons Lunar Bloom — preservando semântica
const PHASE_CONFIG: Record<string, { color: string; label: string }> = {
  menstrual: { color: '#B85A3D', label: 'Menstrual' },
  follicular: { color: '#9CA89A', label: 'Folicular' },
  ovulatory: { color: '#C9A977', label: 'Ovulatória' },
  luteal: { color: '#D97757', label: 'Lútea' },
};

const PHASE_MESSAGES: Record<string, string> = {
  menstrual: 'Cuide-se com carinho. Exercícios leves hoje.',
  follicular: 'Energia em alta. Ótimo momento para desafios.',
  ovulatory: 'Pico de disposição. Aproveite.',
  luteal: 'Fase de recolhimento. Intensidade moderada.',
};

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Bom dia';
  if (h < 18) return 'Boa tarde';
  return 'Boa noite';
}

function getFirstName(name: string): string {
  return name.split(' ')[0] || name;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

interface HomeHeaderProps {
  user: User | null;
  phase: CurrentPhase | null;
}

export default function HomeHeader({ user, phase }: HomeHeaderProps) {
  const phaseKey = phase?.phase ?? null;
  const config = phaseKey ? PHASE_CONFIG[phaseKey] : null;
  const message = phaseKey ? PHASE_MESSAGES[phaseKey] : null;

  return (
    <div className="home-header">
      <div className="home-header-top">
        <div
          className="home-header-avatar"
          style={{
            background: '#14161F',
            color: '#F5EFE6',
            border: '1px solid #D97757',
            fontFamily: "'Figtree', sans-serif",
            fontWeight: 600,
            letterSpacing: '0.04em',
          }}
        >
          {getInitials(user?.name ?? '?')}
        </div>

        <div className="home-header-greeting">
          <div
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 10,
              letterSpacing: '0.28em',
              textTransform: 'uppercase',
              color: 'rgba(20,22,31,0.55)',
              marginBottom: 6,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#D97757' }} aria-hidden />
            {getGreeting()}
          </div>
          <h1
            style={{
              fontFamily: "'Fraunces', serif",
              fontSize: 26,
              color: '#14161F',
              margin: 0,
              fontWeight: 400,
              letterSpacing: '-0.025em',
              lineHeight: 1.05,
            }}
          >
            {user ? getFirstName(user.name) : 'Bem-vinda'}
          </h1>

          {config && message && (
            <p
              style={{
                margin: '8px 0 0',
                fontFamily: "'Fraunces', serif",
                fontStyle: 'italic',
                fontSize: 13.5,
                color: 'rgba(20,22,31,0.72)',
                lineHeight: 1.45,
              }}
            >
              Fase{' '}
              <span style={{ color: config.color, fontWeight: 500, fontStyle: 'normal' }}>
                {config.label.toLowerCase()}
              </span>
              {' '}— {message}
            </p>
          )}
        </div>

        <button
          className="home-header-bell"
          aria-label="Notificações"
          style={{
            background: 'transparent',
            border: '1px solid rgba(20,22,31,0.12)',
            cursor: 'pointer',
            padding: 10,
            position: 'relative',
            color: '#14161F',
            transition: 'border-color 0.25s',
          }}
          onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.borderColor = '#D97757'}
          onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.borderColor = 'rgba(20,22,31,0.12)'}
        >
          <Bell size={20} />
          <span
            className="home-header-bell-dot"
            style={{
              position: 'absolute',
              top: 8,
              right: 8,
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: '#D97757',
            }}
          />
        </button>
      </div>
    </div>
  );
}
