import React from 'react';
import { useGamification } from '../contexts/GamificationContext';
import { Zap, Award, TrendingUp } from 'lucide-react';

const BADGE_LABELS: Record<string, string> = {
  first_workout: 'Primeiro treino',
  '10_workouts': '10 treinos',
  '50_workouts': '50 treinos',
  '7_day_streak': '7 dias seguidos',
  '30_day_streak': '30 dias seguidos',
  level_5: 'Nivel 5',
  level_10: 'Nivel 10',
};

export default function GamificationToast() {
  const { xpEvents, dismissEvent } = useGamification();

  if (xpEvents.length === 0) return null;

  return (
    <div style={{
      position: 'fixed', top: 70, right: 16, zIndex: 100,
      display: 'flex', flexDirection: 'column', gap: 8,
      pointerEvents: 'none',
    }}>
      <style>{`
        @keyframes xpSlideIn { from { transform: translateX(120%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes xpFadeOut { from { opacity: 1; } to { opacity: 0; transform: translateY(-10px); } }
      `}</style>
      {xpEvents.map((event) => (
        <div key={event.id} style={{
          pointerEvents: 'auto',
          animation: 'xpSlideIn 0.3s ease-out',
        }}>
          {/* XP Toast */}
          <div onClick={() => dismissEvent(event.id)} style={{
            background: 'linear-gradient(135deg, #7C3AED, #9333EA)',
            color: '#fff', borderRadius: 12, padding: '10px 16px',
            display: 'flex', alignItems: 'center', gap: 8,
            boxShadow: '0 4px 20px rgba(124,58,237,0.4)',
            cursor: 'pointer', minWidth: 180,
            fontFamily: "'DM Sans', sans-serif",
          }}>
            <Zap size={18} style={{ color: '#FCD34D' }} />
            <div>
              <div style={{ fontSize: 15, fontWeight: 700 }}>+{event.amount} XP</div>
              <div style={{ fontSize: 11, opacity: 0.85 }}>{event.action}</div>
            </div>
          </div>

          {/* Level up */}
          {event.leveledUp && (
            <div style={{
              background: 'linear-gradient(135deg, #F59E0B, #D97706)',
              color: '#fff', borderRadius: 12, padding: '10px 16px',
              display: 'flex', alignItems: 'center', gap: 8,
              boxShadow: '0 4px 20px rgba(245,158,11,0.4)',
              marginTop: 6, fontFamily: "'DM Sans', sans-serif",
            }}>
              <TrendingUp size={18} />
              <div style={{ fontSize: 14, fontWeight: 700 }}>Subiu de nivel!</div>
            </div>
          )}

          {/* New badges */}
          {event.newBadges.map((badge) => (
            <div key={badge} style={{
              background: 'linear-gradient(135deg, #22C55E, #16A34A)',
              color: '#fff', borderRadius: 12, padding: '10px 16px',
              display: 'flex', alignItems: 'center', gap: 8,
              boxShadow: '0 4px 20px rgba(34,197,94,0.4)',
              marginTop: 6, fontFamily: "'DM Sans', sans-serif",
            }}>
              <Award size={18} />
              <div>
                <div style={{ fontSize: 14, fontWeight: 700 }}>Badge desbloqueado!</div>
                <div style={{ fontSize: 11, opacity: 0.9 }}>{BADGE_LABELS[badge] || badge}</div>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
