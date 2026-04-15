import React from 'react';
import { Dumbbell, Flame, Trophy, Star, Zap, Award, Crown, Target } from 'lucide-react';

const BADGES = [
  { key: 'first_workout', label: 'Primeiro treino', Icon: Dumbbell, color: '#7C3AED' },
  { key: '10_workouts', label: '10 treinos', Icon: Target, color: '#3B82F6' },
  { key: '50_workouts', label: '50 treinos', Icon: Trophy, color: '#F59E0B' },
  { key: '7_day_streak', label: '7 dias seguidos', Icon: Flame, color: '#EF4444' },
  { key: '30_day_streak', label: '30 dias seguidos', Icon: Zap, color: '#F97316' },
  { key: 'level_5', label: 'Nivel 5', Icon: Star, color: '#22C55E' },
  { key: 'level_10', label: 'Nivel 10', Icon: Crown, color: '#D97706' },
  { key: 'first_post', label: 'Primeiro post', Icon: Award, color: '#EC4899' },
];

interface Props {
  earnedBadges: string[];
  compact?: boolean;
}

export default function BadgeDisplay({ earnedBadges, compact }: Props) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: compact ? 'repeat(4, 1fr)' : 'repeat(4, 1fr)',
      gap: compact ? 8 : 12,
    }}>
      {BADGES.map(({ key, label, Icon, color }) => {
        const earned = earnedBadges.includes(key);
        return (
          <div key={key} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
            opacity: earned ? 1 : 0.3,
            transition: 'opacity 0.3s',
          }}>
            <div style={{
              width: compact ? 40 : 52, height: compact ? 40 : 52,
              borderRadius: '50%',
              background: earned ? `${color}20` : '#F3F4F6',
              border: earned ? `2px solid ${color}` : '2px solid #E5E7EB',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.3s',
            }}>
              <Icon size={compact ? 18 : 22} color={earned ? color : '#9CA3AF'} />
            </div>
            <span style={{
              fontSize: compact ? 9 : 10,
              fontWeight: earned ? 600 : 400,
              color: earned ? '#111827' : '#9CA3AF',
              textAlign: 'center',
              lineHeight: 1.2,
            }}>
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
