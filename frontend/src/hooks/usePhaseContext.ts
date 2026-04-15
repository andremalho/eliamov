import { useEffect, useState } from 'react';
import { correlationApi, PhaseContext } from '../services/correlation.api';

export function usePhaseContext() {
  const [data, setData] = useState<PhaseContext | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    correlationApi.phaseContext()
      .then(setData)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error };
}
