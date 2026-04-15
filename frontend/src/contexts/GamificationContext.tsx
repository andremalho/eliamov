import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { gamificationApi, UserStats } from '../services/gamification.api';

interface XpEvent {
  id: number;
  amount: number;
  action: string;
  newBadges: string[];
  leveledUp: boolean;
}

interface GamificationContextType {
  stats: UserStats | null;
  loading: boolean;
  rewardXP: (amount: number, action: string) => Promise<void>;
  refreshStats: () => Promise<void>;
  xpEvents: XpEvent[];
  dismissEvent: (id: number) => void;
}

const GamificationContext = createContext<GamificationContextType>({
  stats: null,
  loading: true,
  rewardXP: async () => {},
  refreshStats: async () => {},
  xpEvents: [],
  dismissEvent: () => {},
});

export const useGamification = () => useContext(GamificationContext);

const ACTION_LABELS: Record<string, string> = {
  workout: 'Treino concluido',
  post: 'Post criado',
  comment: 'Comentario',
  checkin: 'Check-in ciclo',
};

let eventIdCounter = 0;

export const GamificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [xpEvents, setXpEvents] = useState<XpEvent[]>([]);

  const refreshStats = useCallback(async () => {
    try {
      const s = await gamificationApi.stats();
      setStats(s);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    refreshStats().finally(() => setLoading(false));
  }, [refreshStats]);

  const rewardXP = useCallback(async (amount: number, action: string) => {
    try {
      const result = await gamificationApi.addXP(amount, action);
      const event: XpEvent = {
        id: ++eventIdCounter,
        amount,
        action: ACTION_LABELS[action] || action,
        newBadges: result.newBadges || [],
        leveledUp: result.leveledUp || false,
      };
      setXpEvents((prev) => [...prev, event]);
      // Auto-dismiss after 3 seconds
      setTimeout(() => {
        setXpEvents((prev) => prev.filter((e) => e.id !== event.id));
      }, 3000);
      // Refresh stats
      await refreshStats();
    } catch { /* ignore */ }
  }, [refreshStats]);

  const dismissEvent = useCallback((id: number) => {
    setXpEvents((prev) => prev.filter((e) => e.id !== id));
  }, []);

  return (
    <GamificationContext.Provider value={{ stats, loading, rewardXP, refreshStats, xpEvents, dismissEvent }}>
      {children}
    </GamificationContext.Provider>
  );
};
