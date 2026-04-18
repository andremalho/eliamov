import React, { useEffect, useState } from 'react';
import { cycleApi, CycleEntry, CurrentPhase } from '../services/cycle.api';
import Layout from '../components/Layout';
import { formatBR } from '../utils/format';
import { Droplets, Sprout, Sun, Moon, ArrowRight, Plus, Trash2, ShieldCheck, Calendar } from 'lucide-react';
import { HormonalInsightCard } from '../components/HormonalInsightCard';
import { CycleOnboardingForm } from '../components/CycleOnboardingForm';

const PHASES: Record<string, { label: string; color: string; bg: string; icon: any; desc: string; tips: string[] }> = {
  menstrual: { label: 'Menstrual', color: '#DB2777', bg: '#FDF2F8', icon: Droplets, desc: 'Fase de renovação. Cuide-se com carinho.', tips: ['Yoga restaurativa', 'Caminhada leve', 'Alimentos ricos em ferro', 'Descanso adequado'] },
  follicular: { label: 'Folicular', color: '#16A34A', bg: '#F0FDF4', icon: Sprout, desc: 'Energia crescente. Otimo para desafios!', tips: ['Treino de forca progressiva', 'HIIT', 'Aumente a carga', 'Proteina de qualidade'] },
  ovulatory: { label: 'Ovulatória', color: '#D97706', bg: '#FFFBEB', icon: Sun, desc: 'Pico de energia e disposição.', tips: ['Performance máxima', 'Tente PRs', 'Aquecimento prolongado (risco ligamentar)', 'Socialize'] },
  luteal: { label: 'Lútea', color: '#14161F', bg: '#FBEAE1', icon: Moon, desc: 'Fase de recolhimento. Respeite seu ritmo.', tips: ['Pilates', 'Treino moderado', 'Alimentos anti-inflamatorios', 'Redução de cortisol'] },
};

const today = () => new Date().toISOString().slice(0, 10);

export default function Cycle() {
  const [entries, setEntries] = useState<CycleEntry[]>([]);
  const [current, setCurrent] = useState<CurrentPhase | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [startDate, setStartDate] = useState(today());
  const [cycleLength, setCycleLength] = useState(28);
  const [periodLength, setPeriodLength] = useState(5);

  const refresh = async () => {
    const [list, cur] = await Promise.all([cycleApi.list(), cycleApi.current()]);
    setEntries(list);
    setCurrent(cur);
  };

  useEffect(() => {
    refresh().catch(() => setError('Não foi possivel carregar.')).finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await cycleApi.create({ startDate, cycleLength, periodLength });
      setShowForm(false);
      await refresh();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Falha ao registrar');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remover este registro?')) return;
    try { await cycleApi.remove(id); await refresh(); } catch { setError('Falha ao remover.'); }
  };

  const cp = current?.phase ?? null;
  const phase = PHASES[cp ?? ''] ?? null;
  const PhaseIcon = phase?.icon ?? Sun;

  return (
    <Layout title="Ciclo menstrual" subtitle="Acompanhe suas fases e otimize seu treino.">
      {loading ? <p style={{ color: '#6B7280', textAlign: 'center', padding: 20 }}>Carregando...</p> : (
        <>
          {/* Current phase card */}
          {phase && cp && (
            <div style={{ background: `linear-gradient(135deg, ${phase.color}15, ${phase.color}08)`, border: `1.5px solid ${phase.color}30`, borderRadius: 18, padding: '20px', marginBottom: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: phase.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <PhaseIcon size={22} color="#fff" />
                </div>
                <div>
                  <div style={{ fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 600, color: '#14161F' }}>Fase {phase.label}</div>
                  <div style={{ fontSize: 13, color: '#6B7280' }}>Dia {current?.dayOfCycle ?? '--'} do ciclo</div>
                </div>
              </div>
              <p style={{ fontSize: 14, color: '#374151', marginBottom: 12 }}>{phase.desc}</p>

              {/* Phase tips */}
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
                {phase.tips.map((tip, i) => (
                  <span key={i} style={{ fontSize: 11, padding: '4px 10px', borderRadius: 999, background: phase.bg, color: phase.color, fontWeight: 500 }}>{tip}</span>
                ))}
              </div>

              {/* Next period prediction */}
              {current?.nextStart && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#6B7280' }}>
                  <Calendar size={14} />
                  Próxima menstruação: <strong style={{ color: '#111827' }}>{formatBR(current.nextStart)}</strong>
                </div>
              )}
            </div>
          )}

          {/* Hormonal insight card */}
          <HormonalInsightCard />

          {/* No cycle data */}
          {!cp && (
            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E5E7EB', padding: 20, textAlign: 'center', marginBottom: 18 }}>
              <Droplets size={28} color="#14161F" style={{ marginBottom: 8 }} />
              <p style={{ fontSize: 14, fontWeight: 500, color: '#111827', marginBottom: 4 }}>Registre seu ciclo</p>
              <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 12 }}>Seus treinos serão adaptados automaticamente a cada fase.</p>
            </div>
          )}

          {/* Privacy notice */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, background: '#FDFAF3', borderRadius: 10, padding: '10px 12px', marginBottom: 16 }}>
            <ShieldCheck size={14} color="#14161F" style={{ flexShrink: 0, marginTop: 1 }} />
            <span style={{ fontSize: 11, color: '#14161F', lineHeight: 1.5 }}>Dados de ciclo são privados e nunca compartilhados com personal trainers ou gestores.</span>
          </div>

          {/* Add cycle */}
          {!showForm ? (
            <button onClick={() => setShowForm(true)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, width: '100%', padding: 12, background: '#14161F', color: '#fff', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: 'pointer', marginBottom: 18 }}>
              <Plus size={16} /> Registrar novo ciclo
            </button>
          ) : (
            <div style={{ marginBottom: 18 }}>
              <CycleOnboardingForm onSuccess={() => { setShowForm(false); refresh(); }} />
              <button onClick={() => setShowForm(false)} style={{ width: '100%', padding: 10, border: '1px solid #E5E7EB', borderRadius: 10, background: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 500, marginTop: 8 }}>Cancelar</button>
            </div>
          )}

          {/* History */}
          {entries.length > 0 && (
            <div>
              <div style={{ fontSize: 15, fontWeight: 600, color: '#111827', marginBottom: 10 }}>Histórico</div>
              {entries.map(entry => (
                <div key={entry.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff', borderRadius: 12, border: '1px solid #E5E7EB', padding: '10px 14px', marginBottom: 6 }}>
                  <div>
                    <strong style={{ fontSize: 13, color: '#111827' }}>{formatBR(entry.startDate)}</strong>
                    <span style={{ fontSize: 12, color: '#6B7280', marginLeft: 8 }}>{entry.cycleLength}d / período {entry.periodLength}d</span>
                  </div>
                  <button onClick={() => handleDelete(entry.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', padding: 4 }}><Trash2 size={14} /></button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </Layout>
  );
}
