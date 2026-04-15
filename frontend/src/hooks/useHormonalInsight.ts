import { useEffect, useState, useCallback } from 'react';
import { hormonalInsightsApi, HormonalInsight } from '../services/hormonalInsights.api';

export function useHormonalInsight() {
  const [data, setData] = useState<HormonalInsight | null>(null);
  const [loading, setLoading] = useState(true);
  const [recomputing, setRecomputing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try { setLoading(true); setError(null); setData(await hormonalInsightsApi.latest()); }
    catch (err: any) { setError(err.message ?? 'Erro ao carregar'); }
    finally { setLoading(false); }
  }, []);

  const recompute = useCallback(async () => {
    try { setRecomputing(true); setError(null); setData(await hormonalInsightsApi.recompute()); }
    catch (err: any) { setError(err.message ?? 'Erro ao recalcular'); }
    finally { setRecomputing(false); }
  }, []);

  useEffect(() => { load(); }, [load]);
  return { data, loading, recomputing, error, reload: load, recompute };
}
