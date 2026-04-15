import React from 'react';
import { BADGE_CONFIG } from '../config/badges';

interface Props {
  earnedBadges: string[];
  compact?: boolean;
}

export default function BadgeDisplay({ earnedBadges, compact }: Props) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: compact ? 8 : 12,
    }}>
      {BADGE_CONFIG.map(({ key, label, Icon, color }) => {
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
