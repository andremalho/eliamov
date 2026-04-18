import { useEffect, useState, useCallback } from 'react';
import { medicationsApi, Medication, CreateMedicationInput, UpdateMedicationInput } from '../services/medications.api';

export function useMedications(includeInactive = false) {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try { setLoading(true); setError(null); setMedications(await medicationsApi.list(includeInactive)); }
    catch (err: any) { setError(err.message ?? 'Erro ao carregar medicações'); }
    finally { setLoading(false); }
  }, [includeInactive]);

  const add = useCallback(async (data: CreateMedicationInput) => {
    const created = await medicationsApi.create(data);
    setMedications(prev => [created, ...prev]);
    return created;
  }, []);

  const update = useCallback(async (id: string, data: UpdateMedicationInput) => {
    const updated = await medicationsApi.update(id, data);
    setMedications(prev => prev.map(m => m.id === id ? updated : m));
    return updated;
  }, []);

  const discontinue = useCallback(async (id: string) => {
    const updated = await medicationsApi.discontinue(id);
    setMedications(prev => includeInactive ? prev.map(m => m.id === id ? updated : m) : prev.filter(m => m.id !== id));
  }, [includeInactive]);

  useEffect(() => { load(); }, [load]);
  return { medications, loading, error, reload: load, add, update, discontinue };
}
