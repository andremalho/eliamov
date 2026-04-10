import React from 'react';
import { Bell } from 'lucide-react';
import { User } from '../../contexts/AuthContext';
import { CurrentPhase } from '../../services/cycle.api';

const PHASE_CONFIG: Record<string, { color: string; label: string }> = {
  menstrual: { color: '#F472B6', label: 'Menstrual' },
  follicular: { color: '#22C55E', label: 'Folicular' },
  ovulatory: { color: '#F59E0B', label: 'Ovulatoria' },
  luteal: { color: '#F97316', label: 'Lutea' },
};

const PHASE_MESSAGES: Record<string, string> = {
  menstrual: 'Cuide-se com carinho. Prefira exercicios leves hoje.',
  follicular: 'Energia em alta! Otimo momento para desafios.',
  ovulatory: 'Pico de energia e disposicao. Aproveite!',
  luteal: 'Fase de recolhimento. Exercicios moderados sao ideais.',
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
        <div className="home-header-avatar">
          {getInitials(user?.name ?? '?')}
        </div>

        <div className="home-header-greeting">
          <h1
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 24,
              color: '#2D1B4E',
              margin: 0,
              fontWeight: 600,
            }}
          >
            {getGreeting()}, {user ? getFirstName(user.name) : ''} ✨
          </h1>

          {config && message && (
            <p
              style={{
                margin: '4px 0 0',
                fontSize: 13,
                color: config.color,
                fontWeight: 500,
              }}
            >
              Voce esta na fase {config.label} — {message}
            </p>
          )}
        </div>

        <button className="home-header-bell" aria-label="Notificacoes">
          <Bell size={22} color="#2D1B4E" />
          <span className="home-header-bell-dot" />
        </button>
      </div>
    </div>
  );
}
