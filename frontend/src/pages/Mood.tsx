import React, { useEffect, useState } from 'react';
import { moodApi, MoodEntry, MoodSummary } from '../services/mood.api';
import Layout from '../components/Layout';
import { formatBR } from '../utils/format';
import { Smile, Trash2, Moon, AlertCircle, Zap, Brain } from 'lucide-react';

const today = () => new Date().toISOString().slice(0, 10);

const SCALE = [1, 2, 3, 4, 5];

const ENERGY_COLORS = ['#EF4444', '#F97316', '#EAB308', '#84CC16', '#22C55E'];
const MOOD_COLORS = ['#EF4444', '#F97316', '#EAB308', '#60A5FA', '#14161F'];

const s = {
  card: {
    background: '#fff',
    border: '1px solid #E5E7EB',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
  } as React.CSSProperties,
  title: {
    fontFamily: 'Figtree, sans-serif',
    fontSize: 15,
    fontWeight: 600,
    color: '#111827',
    margin: '0 0 14px',
  } as React.CSSProperties,
  label: {
    fontFamily: 'Figtree, sans-serif',
    fontSize: 12,
    fontWeight: 600,
    color: '#6B7280',
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
    marginBottom: 8,
    display: 'block',
  } as React.CSSProperties,
  muted: {
    fontFamily: 'Figtree, sans-serif',
    fontSize: 13,
    color: '#6B7280',
  } as React.CSSProperties,
  mutedSmall: {
    fontFamily: 'Figtree, sans-serif',
    fontSize: 11,
    color: '#6B7280',
  } as React.CSSProperties,
  input: {
    fontFamily: 'Figtree, sans-serif',
    fontSize: 14,
    color: '#111827',
    width: '100%',
    padding: '10px 12px',
    borderRadius: 10,
    border: '1px solid #E5E7EB',
    background: '#F9FAFB',
    outline: 'none',
    boxSizing: 'border-box' as const,
  } as React.CSSProperties,
  textarea: {
    fontFamily: 'Figtree, sans-serif',
    fontSize: 14,
    color: '#111827',
    width: '100%',
    padding: '10px 12px',
    borderRadius: 10,
    border: '1px solid #E5E7EB',
    background: '#F9FAFB',
    outline: 'none',
    resize: 'none' as const,
    boxSizing: 'border-box' as const,
    lineHeight: 1.5,
  } as React.CSSProperties,
  submitBtn: (disabled: boolean) => ({
    fontFamily: 'Figtree, sans-serif',
    fontSize: 14,
    fontWeight: 600,
    width: '100%',
    padding: '12px 0',
    borderRadius: 12,
    border: 'none',
    background: disabled ? '#D1D5DB' : '#14161F',
    color: '#fff',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'background 0.15s',
    marginTop: 4,
  } as React.CSSProperties),
  error: {
    fontFamily: 'Figtree, sans-serif',
    fontSize: 13,
    color: '#dc2626',
    background: '#FEF2F2',
    border: '1px solid #FECACA',
    borderRadius: 10,
    padding: '8px 12px',
    marginBottom: 12,
  } as React.CSSProperties,
  circle: (active: boolean, color: string) => ({
    width: 44,
    height: 44,
    borderRadius: '50%',
    border: active ? `2.5px solid ${color}` : '1.5px solid #E5E7EB',
    background: active ? color : '#F9FAFB',
    color: active ? '#fff' : '#6B7280',
    fontFamily: 'Figtree, sans-serif',
    fontSize: 15,
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s',
    boxShadow: active ? `0 2px 8px ${color}44` : 'none',
  } as React.CSSProperties),
  metricBox: {
    flex: 1,
    textAlign: 'center' as const,
    padding: '10px 4px',
    borderRadius: 10,
    background: '#F9FAFB',
  } as React.CSSProperties,
};

export default function Mood() {
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [summary, setSummary] = useState<MoodSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [date, setDate] = useState(today());
  const [energy, setEnergy] = useState(3);
  const [mood, setMood] = useState(3);
  const [sleepHours, setSleepHours] = useState<number | ''>(7);
  const [pain, setPain] = useState(false);
  const [notes, setNotes] = useState('');

  const refresh = async () => {
    const [list, sum] = await Promise.all([moodApi.list(), moodApi.summary()]);
    setEntries(list);
    setSummary(sum);
  };

  useEffect(() => {
    refresh()
      .catch(() => setError('Não foi possivel carregar os registros.'))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await moodApi.create({
        date,
        energy,
        mood,
        sleepHours: sleepHours === '' ? undefined : Number(sleepHours),
        pain,
        notes: notes || undefined,
      });
      setNotes('');
      setSleepHours(7);
      setPain(false);
      await refresh();
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Falha ao registrar';
      setError(Array.isArray(msg) ? msg.join(', ') : msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remover este registro?')) return;
    try {
      await moodApi.remove(id);
      await refresh();
    } catch {
      setError('Falha ao remover registro.');
    }
  };

  return (
    <Layout title="Humor & bem-estar" subtitle="Registre como você esta se sentindo hoje.">
      {loading ? (
        <div style={{ textAlign: 'center', padding: '48px 0' }}>
          <div style={{
            width: 32, height: 32, border: '3px solid #E5E7EB',
            borderTopColor: '#14161F', borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto 12px',
          }} />
          <p style={s.muted}>Carregando...</p>
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      ) : (
        <>
          {/* Summary card */}
          {summary && summary.count > 0 && (
            <section style={s.card}>
              <p style={s.title}>Últimos 7 dias</p>
              <div style={{ display: 'flex', gap: 8 }}>
                <div style={s.metricBox}>
                  <Zap size={16} color="#EAB308" style={{ marginBottom: 4 }} />
                  <div style={{ fontFamily: 'Figtree, sans-serif', fontSize: 16, fontWeight: 700, color: '#111827' }}>
                    {summary.avgEnergy ?? '--'}<span style={{ fontSize: 11, color: '#6B7280' }}>/5</span>
                  </div>
                  <div style={s.mutedSmall}>Energia</div>
                </div>
                <div style={s.metricBox}>
                  <Smile size={16} color="#14161F" style={{ marginBottom: 4 }} />
                  <div style={{ fontFamily: 'Figtree, sans-serif', fontSize: 16, fontWeight: 700, color: '#111827' }}>
                    {summary.avgMood ?? '--'}<span style={{ fontSize: 11, color: '#6B7280' }}>/5</span>
                  </div>
                  <div style={s.mutedSmall}>Humor</div>
                </div>
                <div style={s.metricBox}>
                  <Moon size={16} color="#60A5FA" style={{ marginBottom: 4 }} />
                  <div style={{ fontFamily: 'Figtree, sans-serif', fontSize: 16, fontWeight: 700, color: '#111827' }}>
                    {summary.avgSleep != null ? `${summary.avgSleep}` : '--'}<span style={{ fontSize: 11, color: '#6B7280' }}>h</span>
                  </div>
                  <div style={s.mutedSmall}>Sono</div>
                </div>
                <div style={s.metricBox}>
                  <AlertCircle size={16} color="#EF4444" style={{ marginBottom: 4 }} />
                  <div style={{ fontFamily: 'Figtree, sans-serif', fontSize: 16, fontWeight: 700, color: '#111827' }}>
                    {summary.painDays}
                  </div>
                  <div style={s.mutedSmall}>Dias c/ dor</div>
                </div>
              </div>
            </section>
          )}

          {/* Form card */}
          <section style={s.card}>
            <p style={{
              fontFamily: "'Fraunces', Georgia, serif",
              fontSize: 22,
              fontWeight: 600,
              color: '#111827',
              margin: '0 0 16px',
              textAlign: 'center',
            }}>
              Como você esta hoje?
            </p>

            <form onSubmit={handleSubmit}>
              {/* Date */}
              <div style={{ marginBottom: 16 }}>
                <span style={s.label}>Data</span>
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required style={s.input} />
              </div>

              {/* Energy scale */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                  <Zap size={14} color="#EAB308" />
                  <span style={s.label}>Energia</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
                  {SCALE.map((n) => (
                    <button
                      key={n}
                      type="button"
                      style={s.circle(energy === n, ENERGY_COLORS[n - 1])}
                      onClick={() => setEnergy(n)}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mood scale */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                  <Brain size={14} color="#14161F" />
                  <span style={s.label}>Humor</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
                  {SCALE.map((n) => (
                    <button
                      key={n}
                      type="button"
                      style={s.circle(mood === n, MOOD_COLORS[n - 1])}
                      onClick={() => setMood(n)}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sleep hours slider */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Moon size={14} color="#60A5FA" />
                    <span style={s.label}>Horas de sono</span>
                  </div>
                  <span style={{
                    fontFamily: 'Figtree, sans-serif',
                    fontSize: 16, fontWeight: 700, color: '#111827',
                    background: '#F3EEFF', borderRadius: 8, padding: '2px 10px',
                  }}>
                    {sleepHours === '' ? '--' : sleepHours}h
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={14}
                  step={0.5}
                  value={sleepHours === '' ? 7 : sleepHours}
                  onChange={(e) => setSleepHours(Number(e.target.value))}
                  style={{
                    width: '100%',
                    accentColor: '#14161F',
                    height: 6,
                  }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={s.mutedSmall}>0h</span>
                  <span style={s.mutedSmall}>14h</span>
                </div>
              </div>

              {/* Pain toggle */}
              <div style={{
                marginBottom: 20,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                borderRadius: 10,
                background: pain ? '#FEF2F2' : '#F9FAFB',
                border: pain ? '1px solid #FECACA' : '1px solid #E5E7EB',
                transition: 'all 0.15s',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <AlertCircle size={16} color={pain ? '#EF4444' : '#9CA3AF'} />
                  <span style={{
                    fontFamily: 'Figtree, sans-serif',
                    fontSize: 13,
                    fontWeight: 500,
                    color: pain ? '#DC2626' : '#6B7280',
                  }}>
                    Senti dor hoje
                  </span>
                </div>
                {/* Toggle switch */}
                <button
                  type="button"
                  onClick={() => setPain(!pain)}
                  style={{
                    width: 44, height: 24, borderRadius: 12,
                    background: pain ? '#EF4444' : '#D1D5DB',
                    border: 'none', cursor: 'pointer',
                    position: 'relative', transition: 'background 0.2s',
                    padding: 0,
                  }}
                >
                  <div style={{
                    width: 18, height: 18, borderRadius: '50%',
                    background: '#fff',
                    position: 'absolute', top: 3,
                    left: pain ? 23 : 3,
                    transition: 'left 0.2s',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
                  }} />
                </button>
              </div>

              {/* Notes */}
              <div style={{ marginBottom: 16 }}>
                <span style={s.label}>Notas</span>
                <textarea
                  style={s.textarea}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Como foi o seu dia? (opcional)"
                />
              </div>

              {error && <div style={s.error}>{error}</div>}

              <button type="submit" disabled={submitting} style={s.submitBtn(submitting)}>
                {submitting ? 'Salvando...' : 'Salvar registro'}
              </button>
            </form>
          </section>

          {/* History */}
          <section style={s.card}>
            <p style={s.title}>Histórico</p>
            {entries.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <Smile size={32} color="#D1D5DB" style={{ marginBottom: 8 }} />
                <p style={{ ...s.muted, margin: 0 }}>Nenhum registro ainda.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {entries.map((entry) => (
                  <div key={entry.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 12px',
                    borderRadius: 10,
                    background: '#F9FAFB',
                    border: '1px solid #F3F4F6',
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontFamily: 'Figtree, sans-serif', fontSize: 13,
                        fontWeight: 600, color: '#111827', marginBottom: 3,
                      }}>
                        {formatBR(entry.date)}
                      </div>
                      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                        <span style={s.mutedSmall}>
                          <Zap size={10} style={{ verticalAlign: 'middle', marginRight: 2 }} />
                          {entry.energy}/5
                        </span>
                        <span style={s.mutedSmall}>
                          <Smile size={10} style={{ verticalAlign: 'middle', marginRight: 2 }} />
                          {entry.mood}/5
                        </span>
                        {entry.sleepHours != null && (
                          <span style={s.mutedSmall}>
                            <Moon size={10} style={{ verticalAlign: 'middle', marginRight: 2 }} />
                            {entry.sleepHours}h
                          </span>
                        )}
                        {entry.pain && (
                          <span style={{ ...s.mutedSmall, color: '#EF4444' }}>
                            <AlertCircle size={10} style={{ verticalAlign: 'middle', marginRight: 2 }} />
                            dor
                          </span>
                        )}
                      </div>
                      {entry.notes && (
                        <div style={{ ...s.mutedSmall, marginTop: 4, fontStyle: 'italic' }}>
                          {entry.notes}
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDelete(entry.id)}
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        padding: 6, borderRadius: 6, color: '#9CA3AF',
                        display: 'flex', alignItems: 'center',
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </Layout>
  );
}
