import React from 'react';
import { useGamification } from '../contexts/GamificationContext';
import { BADGE_LABELS } from '../config/badges';
import { Zap, Award, TrendingUp } from 'lucide-react';

export default function GamificationToast() {
  const { xpEvents, dismissEvent } = useGamification();

  if (xpEvents.length === 0) return null;

  const toastBase: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '12px 18px',
    minWidth: 220,
    border: '1px solid rgba(245,239,230,0.14)',
    fontFamily: "'Figtree', sans-serif",
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 88,
        right: 20,
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        pointerEvents: 'none',
      }}
    >
      <style>{`
        @keyframes elia-toast-in {
          from { transform: translateX(120%) translateY(0); opacity: 0; }
          to   { transform: translateX(0) translateY(0); opacity: 1; }
        }
        @media (prefers-reduced-motion: reduce) {
          .elia-toast { animation: none; }
        }
      `}</style>

      {xpEvents.map((event) => (
        <div
          key={event.id}
          className="elia-toast"
          style={{
            pointerEvents: 'auto',
            animation: 'elia-toast-in 0.5s cubic-bezier(0.16,1,0.3,1)',
          }}
        >
          {/* XP */}
          <div
            onClick={() => dismissEvent(event.id)}
            role="button"
            style={{
              ...toastBase,
              background: '#14161F',
              color: '#F5EFE6',
              cursor: 'pointer',
              borderLeft: '2px solid #D97757',
            }}
          >
            <Zap size={16} color="#C9A977" />
            <div>
              <div
                style={{
                  fontFamily: "'Fraunces', serif",
                  fontSize: 18,
                  fontWeight: 450,
                  letterSpacing: '-0.015em',
                  lineHeight: 1.1,
                }}
              >
                +{event.amount} <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.16em', color: '#C9A977' }}>XP</span>
              </div>
              <div
                style={{
                  fontSize: 11.5,
                  color: 'rgba(245,239,230,0.65)',
                  marginTop: 2,
                  letterSpacing: '0.02em',
                }}
              >
                {event.action}
              </div>
            </div>
          </div>

          {/* Level up */}
          {event.leveledUp && (
            <div
              style={{
                ...toastBase,
                marginTop: 8,
                background: '#C9A977',
                color: '#14161F',
                borderLeft: '2px solid #14161F',
              }}
            >
              <TrendingUp size={16} />
              <div
                style={{
                  fontFamily: "'Fraunces', serif",
                  fontSize: 15,
                  fontWeight: 500,
                  letterSpacing: '-0.01em',
                }}
              >
                Subiu de nível
              </div>
            </div>
          )}

          {/* New badges */}
          {event.newBadges.map((badge) => (
            <div
              key={badge}
              style={{
                ...toastBase,
                marginTop: 8,
                background: '#FDFAF3',
                color: '#14161F',
                border: '1px solid rgba(20,22,31,0.12)',
                borderLeft: '2px solid #9CA89A',
              }}
            >
              <Award size={16} color="#9CA89A" />
              <div>
                <div
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 10,
                    letterSpacing: '0.24em',
                    textTransform: 'uppercase',
                    color: '#9CA89A',
                    marginBottom: 3,
                  }}
                >
                  ● Novo badge
                </div>
                <div
                  style={{
                    fontFamily: "'Fraunces', serif",
                    fontSize: 15,
                    fontWeight: 450,
                    letterSpacing: '-0.015em',
                  }}
                >
                  {BADGE_LABELS[badge] || badge}
                </div>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
