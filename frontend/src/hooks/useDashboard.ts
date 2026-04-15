import { useEffect, useState } from 'react';
import { correlationApi, PhaseContext } from '../services/correlation.api';
import { dailyLogApi, DailyLog } from '../services/dailyLog.api';
import { hormonalInsightsApi, HormonalInsight } from '../services/hormonalInsights.api';
import api from '../services/api';

export type DashboardData = {
  phaseContext: PhaseContext | null;
  todayLog: DailyLog | null;
  hormonalInsight: HormonalInsight | null;
  lastPhq9: { score: number; date: string; trend: string } | null;
  activeMedicationsCount: number;
  nextPeriodDays: number | null;
  streakDays: number;
};

export function useDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [phaseContext, todayLog, hormonalInsight, medications, mentalHistory] =
          await Promise.allSettled([
            correlationApi.phaseContext(),
            dailyLogApi.today(),
            hormonalInsightsApi.latest(),
            api.get('/medications').then(r => r.data),
            api.get('/mental-health/history?type=phq9').then(r => r.data),
          ]);

        const phase = phaseContext.status === 'fulfilled' ? phaseContext.value : null;
        const log = todayLog.status === 'fulfilled' ? todayLog.value : null;
        const insight = hormonalInsight.status === 'fulfilled' ? hormonalInsight.value : null;
        const meds = medications.status === 'fulfilled' ? medications.value : [];
        const history = mentalHistory.status === 'fulfilled' ? mentalHistory.value : [];

        const lastPhq9 = history.length > 0 ? {
          score: history[0].totalScore,
          date: history[0].createdAt,
          trend: history.length > 1
            ? history[0].totalScore < history[1].totalScore ? 'improving'
            : history[0].totalScore > history[1].totalScore ? 'worsening'
            : 'stable'
            : 'insufficient_data',
        } : null;

        const last30 = await dailyLogApi.last30().catch(() => []);
        let streak = 0;
        const today = new Date();
        for (let i = 0; i < 30; i++) {
          const d = new Date(today);
          d.setDate(d.getDate() - i);
          const dateStr = d.toISOString().split('T')[0];
          if (last30.some(l => l.logDate === dateStr)) {
            streak++;
          } else {
            break;
          }
        }

        setData({
          phaseContext: phase,
          todayLog: log,
          hormonalInsight: insight,
          lastPhq9,
          activeMedicationsCount: meds.length,
          nextPeriodDays: phase?.daysUntilNextPeriod ?? null,
          streakDays: streak,
        });
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return { data, loading };
}
