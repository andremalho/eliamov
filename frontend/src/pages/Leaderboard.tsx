import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import BadgeDisplay from '../components/BadgeDisplay';
import { gamificationApi, LeaderboardEntry } from '../services/gamification.api';
import { useGamification } from '../contexts/GamificationContext';
import { Trophy, Flame, Star, Medal, Crown, Dumbbell } from 'lucide-react';
import { initials } from '../utils/format';

const RANK_STYLES = [
  { bg: '#FEF3C7', border: '#F59E0B', color: '#92400E', icon: Crown },
  { bg: '#F1F5F9', border: '#94A3B8', color: '#475569', icon: Medal },
  { bg: '#FFF7ED', border: '#F97316', color: '#9A3412', icon: Medal },
];

export default function Leaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const { stats } = useGamification();

  useEffect(() => {
    gamificationApi.leaderboard()
      .then(setEntries)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <Layout title="Ranking" subtitle="Top membros por XP">
      {loading ? (
        <p style={{ color: '#6B7280', textAlign: 'center', padding: 40 }}>Carregando...</p>
      ) : (
        <>
          {/* My stats card */}
          {stats && (
            <div style={{
              background: 'linear-gradient(135deg, #14161F, #9333EA)',
              borderRadius: 16, padding: 20, marginBottom: 20, color: '#fff',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div>
                  <div style={{ fontSize: 12, opacity: 0.8 }}>Seu nivel</div>
                  <div style={{ fontSize: 28, fontWeight: 700 }}>Nivel {stats.level}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 12, opacity: 0.8 }}>Total XP</div>
                  <div style={{ fontSize: 24, fontWeight: 700 }}>{stats.xp}</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 16, fontSize: 13, opacity: 0.9 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Dumbbell size={14} /> {stats.totalWorkouts} treinos</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Flame size={14} /> {stats.currentStreak} dias</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Star size={14} /> {stats.badges.length} badges</span>
              </div>
            </div>
          )}

          {/* Leaderboard */}
          <div style={{
            background: '#fff', borderRadius: 16, padding: 0,
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflow: 'hidden',
          }}>
            {entries.length === 0 ? (
              <p style={{ color: '#6B7280', textAlign: 'center', padding: 32 }}>Nenhum membro no ranking.</p>
            ) : (
              entries.map((entry, i) => {
                const rankStyle = i < 3 ? RANK_STYLES[i] : null;
                const RankIcon = rankStyle?.icon ?? Trophy;
                return (
                  <div key={entry.id} style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '14px 18px',
                    borderBottom: i < entries.length - 1 ? '1px solid #F3F4F6' : 'none',
                    background: rankStyle?.bg ?? 'transparent',
                  }}>
                    {/* Rank */}
                    <div style={{
                      width: 32, height: 32, borderRadius: '50%',
                      background: rankStyle ? `${rankStyle.border}20` : '#F3F4F6',
                      border: rankStyle ? `2px solid ${rankStyle.border}` : '1px solid #E5E7EB',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 13, fontWeight: 700,
                      color: rankStyle?.color ?? '#6B7280',
                      flexShrink: 0,
                    }}>
                      {i < 3 ? <RankIcon size={16} /> : i + 1}
                    </div>

                    {/* Avatar */}
                    <div style={{
                      width: 38, height: 38, borderRadius: '50%',
                      background: 'linear-gradient(135deg, #14161F, #9333EA)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#fff', fontWeight: 700, fontSize: 13, flexShrink: 0,
                      overflow: 'hidden',
                    }}>
                      {entry.profile?.avatarUrl
                        ? <img src={entry.profile.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : initials(entry.name)}
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>{entry.name}</div>
                      <div style={{ fontSize: 12, color: '#6B7280', display: 'flex', gap: 8 }}>
                        <span>Lv {entry.level}</span>
                        <span>{entry.totalWorkouts} treinos</span>
                        {entry.currentStreak > 0 && <span><Flame size={10} style={{ verticalAlign: -1 }} /> {entry.currentStreak}</span>}
                      </div>
                    </div>

                    {/* XP */}
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: 16, fontWeight: 700, color: '#14161F' }}>{entry.xp}</div>
                      <div style={{ fontSize: 10, color: '#9CA3AF' }}>XP</div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </>
      )}
    </Layout>
  );
}
