import React, { useEffect, useState } from 'react';
import {
  challengesApi,
  GoalType,
  GOAL_TYPE_LABELS,
  LeaderboardEntry,
} from '../services/challenges.api';

interface LeaderboardModalProps {
  open: boolean;
  challengeId: string;
  challengeTitle: string;
  goalType: GoalType;
  goalValue: number;
  onClose: () => void;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function goalUnit(goalType: GoalType): string {
  switch (goalType) {
    case 'workout_count':
      return 'treinos';
    case 'duration':
      return 'min';
    case 'streak':
      return 'dias';
  }
}

function rankClass(rank: number): string {
  if (rank === 1) return 'gold';
  if (rank === 2) return 'silver';
  if (rank === 3) return 'bronze';
  return 'default';
}

export default function LeaderboardModal({
  open,
  challengeId,
  challengeTitle,
  goalType,
  goalValue,
  onClose,
}: LeaderboardModalProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !challengeId) return;
    setLoading(true);
    challengesApi
      .leaderboard(challengeId)
      .then((res) => setEntries(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [open, challengeId]);

  if (!open) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3>Ranking</h3>
            <p className="muted" style={{ fontSize: 13 }}>{challengeTitle}</p>
          </div>
          <button className="link-button" onClick={onClose} aria-label="Fechar">
            &#10005;
          </button>
        </div>

        <div className="modal-body">
          {loading ? (
            <p className="muted">Carregando...</p>
          ) : entries.length === 0 ? (
            <p className="muted" style={{ textAlign: 'center', padding: '24px 0' }}>
              Nenhum participante ainda.
            </p>
          ) : (
            entries.map((entry) => (
              <div key={entry.userId} className="leaderboard-item">
                <div className={`leaderboard-rank ${rankClass(entry.rank)}`}>
                  {entry.rank}
                </div>

                <div className="comment-avatar">
                  {entry.avatarUrl ? (
                    <img
                      src={entry.avatarUrl}
                      alt={entry.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                    />
                  ) : (
                    getInitials(entry.name)
                  )}
                </div>

                <span className="leaderboard-name">{entry.name}</span>

                <span className="leaderboard-progress">
                  {entry.currentProgress}/{goalValue} {goalUnit(goalType)}
                </span>

                {entry.completedAt && (
                  <span className="leaderboard-check">&#10003;</span>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
