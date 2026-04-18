import React, { useCallback, useEffect, useState } from 'react';
import Layout from '../components/Layout';
import ChallengeCard from '../components/ChallengeCard';
import LeaderboardModal from '../components/LeaderboardModal';
import { challengesApi, Challenge } from '../services/challenges.api';

export default function Challenges() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);

  const loadChallenges = useCallback(async () => {
    try {
      const data = await challengesApi.list();
      setChallenges(data);
    } catch {
      setError('Não foi possivel carregar os desafios.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadChallenges();
  }, [loadChallenges]);

  const handleJoin = async (id: string) => {
    try {
      await challengesApi.join(id);
      await loadChallenges();
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Falha ao participar do desafio';
      setError(Array.isArray(msg) ? msg.join(', ') : msg);
    }
  };

  const handleViewLeaderboard = (id: string) => {
    const ch = challenges.find((c) => c.id === id) ?? null;
    setSelectedChallenge(ch);
  };

  return (
    <Layout
      title="Desafios"
      subtitle="Participe de desafios da sua academia."
    >
      {error && <div className="error">{error}</div>}

      {loading ? (
        <p className="muted" style={{ textAlign: 'center', padding: '32px 0' }}>
          Carregando...
        </p>
      ) : challenges.length === 0 ? (
        <div className="card" style={{ textAlign: 'center' }}>
          <p className="muted">Nenhum desafio ativo no momento.</p>
        </div>
      ) : (
        challenges.map((ch) => (
          <ChallengeCard
            key={ch.id}
            challenge={ch}
            onJoin={handleJoin}
            onViewLeaderboard={handleViewLeaderboard}
          />
        ))
      )}

      {selectedChallenge && (
        <LeaderboardModal
          open={!!selectedChallenge}
          challengeId={selectedChallenge.id}
          challengeTitle={selectedChallenge.title}
          goalType={selectedChallenge.goalType}
          goalValue={selectedChallenge.goalValue}
          onClose={() => setSelectedChallenge(null)}
        />
      )}
    </Layout>
  );
}
