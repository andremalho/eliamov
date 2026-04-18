import React from 'react';
import { Challenge, GOAL_TYPE_LABELS } from '../services/challenges.api';

interface ChallengeCardProps {
  challenge: Challenge;
  onJoin: (id: string) => void;
  onViewLeaderboard: (id: string) => void;
}

function formatDateRange(start: string, end: string): string {
  const fmt = (iso: string) => {
    const [, m, d] = iso.slice(0, 10).split('-');
    return `${d}/${m}`;
  };
  return `${fmt(start)} — ${fmt(end)}`;
}

export default function ChallengeCard({ challenge, onJoin, onViewLeaderboard }: ChallengeCardProps) {
  const pct = Math.min(100, Math.round((challenge.myProgress / challenge.goalValue) * 100));
  const completed = challenge.myCompleted !== null;
  const fillColor = completed ? '#9CA89A' : '#D97757';

  return (
    <div className="card challenge-card">
      <h3>{challenge.title}</h3>
      {challenge.description && <p className="muted" style={{ marginBottom: 8 }}>{challenge.description}</p>}

      <span className="challenge-goal-badge">
        {challenge.goalValue} {GOAL_TYPE_LABELS[challenge.goalType]}
      </span>

      <div className="challenge-dates">
        {formatDateRange(challenge.startDate, challenge.endDate)}
      </div>

      {/* Progress bar */}
      <div className="challenge-progress-bar">
        <div
          className="challenge-progress-fill"
          style={{ width: `${pct}%`, background: fillColor }}
        />
      </div>
      <div className="challenge-progress-label">
        {challenge.myProgress}/{challenge.goalValue} · {pct}%
      </div>

      {/* Completed badge */}
      {completed && (
        <div style={{ marginTop: 8 }}>
          <span className="challenge-completed-badge">✓ Completado</span>
        </div>
      )}

      {/* Actions */}
      <div className="challenge-actions">
        {!challenge.joined ? (
          <button onClick={() => onJoin(challenge.id)}>Participar</button>
        ) : (
          <button className="outline" onClick={() => onViewLeaderboard(challenge.id)}>
            Ranking
          </button>
        )}
      </div>
    </div>
  );
}
