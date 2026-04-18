import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { MentalHealthQuestionnaire } from '../components/MentalHealthQuestionnaire';
import { ALL_INSTRUMENTS, Instrument } from '../data/mentalHealthQuestions';
import { formatDateTimeBR } from '../utils/format';
import { Brain, ClipboardList, TrendingUp, Clock } from 'lucide-react';
import { MentalHealthTimeline } from '../components/MentalHealthTimeline';
import { NextAssessmentBadge } from '../components/NextAssessmentBadge';
import { PhaseContextCard } from '../components/PhaseContextCard';
import api from '../services/api';

type Tab = 'avaliação' | 'padrão' | 'histórico' | 'evolução';

const SEVERITY_COLORS: Record<string, string> = {
  minimal: '#16A34A', mild: '#84CC16', low: '#16A34A', none: '#16A34A',
  moderate: '#D97706', moderately_severe: '#EA580C',
  severe: '#DC2626', high: '#DC2626',
};
const SEVERITY_LABELS: Record<string, string> = {
  minimal: 'Mínimo', mild: 'Leve', low: 'Baixo', none: 'Nenhum',
  moderate: 'Moderado', moderately_severe: 'Moderado-grave',
  severe: 'Severo', high: 'Alto',
};
const PATTERN_LABELS: Record<string, string> = {
  stable: 'Padrão estavel',
  luteal_exacerbation: 'Piora na fase lútea',
  pmdd_pattern: 'Padrão compativel com TDPM',
  generalized_depression: 'Depressão persistente',
  generalized_anxiety: 'Ansiedade persistente',
  mixed: 'Padrão misto',
  needs_clinical_review: 'Avaliação clínica recomendada',
};
const PHASE_LABELS: Record<string, string> = {
  menstrual: 'Menstrual', follicular: 'Folicular', ovulatory: 'Ovulatória', luteal: 'Lútea', unknown: 'Desconhecida',
};

const card: React.CSSProperties = { background: '#fff', borderRadius: 16, border: '1px solid #E5E7EB', padding: 20, marginBottom: 16 };
const tabBtn = (active: boolean): React.CSSProperties => ({
  flex: 1, padding: '10px 4px', borderRadius: 999, border: 'none', fontSize: 13, fontWeight: 600,
  cursor: 'pointer', background: active ? '#14161F' : '#F3F4F6', color: active ? '#fff' : '#6B7280',
  fontFamily: "'Figtree', sans-serif", transition: 'all 0.15s',
});

export default function MentalHealth() {
  const [tab, setTab] = useState<Tab>('avaliação');
  const [activeInstrument, setActiveInstrument] = useState<Instrument | null>(null);
  const [result, setResult] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [pattern, setPattern] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [patternLoading, setPatternLoading] = useState(false);
  const [timelineType, setTimelineType] = useState<'phq9' | 'gad7' | 'pss10'>('phq9');

  useEffect(() => {
    if (tab === 'avaliação' || tab === 'padrão') {
      setPatternLoading(true);
      Promise.all([
        api.get('/mental-health/pattern/latest').catch(() => ({ data: null })),
        api.get('/mental-health/history?type=phq9').catch(() => ({ data: [] })),
      ]).then(([p, h]) => { setPattern(p.data); setHistory(h.data ?? []); }).finally(() => setPatternLoading(false));
    }
    if (tab === 'histórico') {
      setLoading(true);
      api.get('/mental-health/history').then(r => setHistory(r.data ?? [])).catch(() => {}).finally(() => setLoading(false));
    }
  }, [tab]);

  const handleComplete = async (instrument: Instrument, answers: Record<string, number>) => {
    setSubmitting(true);
    try {
      const res = await api.post('/mental-health/assessment', { assessmentType: instrument.key, answers });
      setResult(res.data);
      setActiveInstrument(null);
    } catch { alert('Erro ao enviar avaliação.'); }
    finally { setSubmitting(false); }
  };

  const handleRecomputePattern = async () => {
    setPatternLoading(true);
    try {
      const res = await api.post('/mental-health/pattern/compute');
      setPattern(res.data);
    } catch { alert('Erro ao recalcular padrão.'); }
    finally { setPatternLoading(false); }
  };

  return (
    <Layout>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
        <Brain size={26} color="#14161F" />
        <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 26, fontWeight: 600, color: '#14161F', margin: 0 }}>Saúde Mental</h1>
      </div>
      <p style={{ fontSize: 14, color: '#6B7280', margin: '0 0 16px' }}>Avalie, acompanhe e entenda seus padrões emocionais</p>

      {/* Tab pills */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
        <button style={tabBtn(tab === 'avaliação')} onClick={() => { setTab('avaliação'); setActiveInstrument(null); setResult(null); }}>Avaliação</button>
        <button style={tabBtn(tab === 'padrão')} onClick={() => setTab('padrão')}>Meu Padrão</button>
        <button style={tabBtn(tab === 'histórico')} onClick={() => setTab('histórico')}>Histórico</button>
        <button style={tabBtn(tab === 'evolução')} onClick={() => setTab('evolução')}>Evolução</button>
      </div>

      {/* ── Tab 1: Avaliação ── */}
      {tab === 'avaliação' && !activeInstrument && !result && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <PhaseContextCard activeTab="mental" />
          <NextAssessmentBadge
            suggestedDays={pattern?.suggestedNextAssessmentDays ?? null}
            lastAssessmentDate={history.length > 0 ? history[0]?.createdAt : null}
          />
          {ALL_INSTRUMENTS.map(inst => (
            <div key={inst.key} style={card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 600, color: '#1F2937', margin: '0 0 4px' }}>{inst.title}</h3>
                  <p style={{ fontSize: 13, color: '#6B7280', margin: '0 0 8px' }}>{inst.description}</p>
                  <span style={{ fontSize: 12, color: '#9CA3AF' }}>{inst.questions.length} perguntas</span>
                </div>
                <button onClick={() => setActiveInstrument(inst)} style={{
                  padding: '8px 16px', borderRadius: 10, border: 'none', background: '#14161F', color: '#fff',
                  fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: "'Figtree', sans-serif", flexShrink: 0,
                }}>Iniciar</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'avaliação' && activeInstrument && (
        <MentalHealthQuestionnaire instrument={activeInstrument} onComplete={(answers) => handleComplete(activeInstrument, answers)} />
      )}

      {tab === 'avaliação' && result && (
        <>
        {result.criticalAlertTriggered && (
          <div style={{
            ...card, background: '#FDFAF3', borderColor: '#E89A80',
            display: 'flex', alignItems: 'flex-start', gap: 12, padding: 18,
          }}>
            <span style={{ fontSize: 24, flexShrink: 0 }}>💜</span>
            <div>
              <p style={{ fontSize: 14, color: '#14161F', lineHeight: 1.6, margin: '0 0 12px', fontWeight: 500 }}>
                Notamos algo importante na sua avaliação. Se estiver passando por um momento dificil,
                o CVV atende 24h pelo número 188 (ligação gratuita) ou em cvv.org.br
              </p>
              <a href="tel:188" style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '8px 18px', borderRadius: 10, background: '#14161F',
                color: '#fff', fontSize: 13, fontWeight: 600, textDecoration: 'none',
                fontFamily: "'Figtree', sans-serif",
              }}>
                Ligar agora — 188
              </a>
            </div>
          </div>
        )}
        <div style={{ ...card, background: '#F0FDF4', borderColor: '#BBF7D0', textAlign: 'center' }}>
          <h3 style={{ fontSize: 18, fontWeight: 600, color: '#166534', marginBottom: 8 }}>Avaliação concluida!</h3>
          <div style={{ fontSize: 36, fontWeight: 700, color: '#1F2937', marginBottom: 4 }}>{result.totalScore}</div>
          <span style={{ padding: '4px 14px', borderRadius: 999, fontSize: 13, fontWeight: 600, color: '#fff', background: SEVERITY_COLORS[result.severityLevel] || '#6B7280' }}>
            {SEVERITY_LABELS[result.severityLevel] || result.severityLevel}
          </span>
          {result.cyclePhaseAtAssessment && result.cyclePhaseAtAssessment !== 'unknown' && (
            <p style={{ fontSize: 12, color: '#6B7280', marginTop: 8 }}>Fase do ciclo: {PHASE_LABELS[result.cyclePhaseAtAssessment]} (dia {result.cycleDay})</p>
          )}
          <button onClick={() => setResult(null)} style={{ marginTop: 16, padding: '10px 24px', borderRadius: 10, border: 'none', background: '#14161F', color: '#fff', fontWeight: 600, fontSize: 14, cursor: 'pointer', fontFamily: "'Figtree', sans-serif" }}>Nova avaliação</button>
        </div>
        </>
      )}

      {/* ── Tab 2: Padrão ── */}
      {tab === 'padrão' && (
        patternLoading ? <p style={{ color: '#6B7280', textAlign: 'center', padding: 20 }}>Carregando...</p> : (
          <div>
            {!pattern ? (
              <div style={{ ...card, textAlign: 'center' }}>
                <p style={{ color: '#6B7280', marginBottom: 12 }}>Nenhum padrão calculado ainda. Realize pelo menos 3 avaliações e clique abaixo.</p>
                <button onClick={handleRecomputePattern} style={{ padding: '10px 24px', borderRadius: 10, border: 'none', background: '#14161F', color: '#fff', fontWeight: 600, fontSize: 14, cursor: 'pointer', fontFamily: "'Figtree', sans-serif" }}>Calcular padrão</button>
              </div>
            ) : (
              <>
                <div style={card}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 600, color: '#1F2937', margin: 0 }}>Padrão identificado</h3>
                    <button onClick={handleRecomputePattern} style={{ fontSize: 12, color: '#14161F', background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'Figtree', sans-serif" }}>Recalcular</button>
                  </div>
                  <div style={{ padding: '10px 14px', borderRadius: 10, background: '#FDFAF3', marginBottom: 12, fontSize: 14, fontWeight: 600, color: '#5B21B6' }}>
                    {PATTERN_LABELS[pattern.overallPattern] || pattern.overallPattern}
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                    {pattern.pmddSuspected && <span style={{ padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 600, background: '#FEE2E2', color: '#DC2626' }}>TDPM suspeito</span>}
                    {pattern.generalDepressionSuspected && <span style={{ padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 600, background: '#FEF3C7', color: '#D97706' }}>Depressão persistente</span>}
                    {pattern.generalAnxietySuspected && <span style={{ padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 600, background: '#DBEAFE', color: '#2563EB' }}>Ansiedade persistente</span>}
                  </div>
                </div>

                {/* Clinician alert */}
                {pattern.clinicianAlertRequired && (
                  <div style={{ ...card, background: '#FEF2F2', borderColor: '#FECACA' }}>
                    <p style={{ fontSize: 14, color: '#991B1B', fontWeight: 500, margin: 0, lineHeight: 1.6 }}>
                      Seu médico foi notificado sobre uma mudanca no seu padrão. Considere agendar uma consulta em breve.
                    </p>
                  </div>
                )}

                {/* Trend cards */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                  {[
                    { label: 'Humor (PHQ-9)', trend: pattern.phq9Trend },
                    { label: 'Ansiedade (GAD-7)', trend: pattern.gad7Trend },
                  ].map((item, i) => {
                    const trendConfig: Record<string, { icon: string; color: string; label: string }> = {
                      improving: { icon: '↓', color: '#16A34A', label: 'Melhorando' },
                      stable: { icon: '→', color: '#6B7280', label: 'Estavel' },
                      worsening: { icon: '↑', color: '#DC2626', label: 'Piorando' },
                      insufficient_data: { icon: '—', color: '#9CA3AF', label: 'Dados insuficientes' },
                    };
                    const tc = trendConfig[item.trend] || trendConfig.insufficient_data;
                    return (
                      <div key={i} style={{ ...card, textAlign: 'center', marginBottom: 0 }}>
                        <p style={{ fontSize: 12, color: '#6B7280', margin: '0 0 4px' }}>{item.label}</p>
                        <span style={{ fontSize: 24, color: tc.color }}>{tc.icon}</span>
                        <p style={{ fontSize: 12, fontWeight: 600, color: tc.color, margin: '4px 0 0' }}>{tc.label}</p>
                      </div>
                    );
                  })}
                </div>

                {/* Adherence */}
                {pattern.adherenceScore != null && (
                  <div style={card}>
                    <h3 style={{ fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 8 }}>Aderencia</h3>
                    <div style={{ height: 10, background: '#E5E7EB', borderRadius: 5, overflow: 'hidden', marginBottom: 6 }}>
                      <div style={{ height: '100%', width: `${pattern.adherenceScore}%`, background: pattern.adherenceScore >= 66 ? '#16A34A' : pattern.adherenceScore >= 33 ? '#D97706' : '#DC2626', borderRadius: 5, transition: 'width 0.5s' }} />
                    </div>
                    <p style={{ fontSize: 12, color: '#6B7280', margin: 0 }}>Você completou {pattern.adherenceScore}% das avaliações recomendadas nos últimos 3 meses.</p>
                  </div>
                )}

                {/* Phase comparison bars */}
                <div style={card}>
                  <h3 style={{ fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 12 }}>Comparativo por fase do ciclo</h3>
                  {[
                    { label: 'PHQ-9 Lútea', val: pattern.lutealPhq9Avg, max: 27, color: '#DC2626' },
                    { label: 'PHQ-9 Folicular', val: pattern.follicularPhq9Avg, max: 27, color: '#16A34A' },
                    { label: 'GAD-7 Lútea', val: pattern.lutealGad7Avg, max: 21, color: '#DC2626' },
                    { label: 'GAD-7 Folicular', val: pattern.follicularGad7Avg, max: 21, color: '#16A34A' },
                  ].map((bar, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                      <span style={{ fontSize: 12, color: '#6B7280', minWidth: 110 }}>{bar.label}</span>
                      <div style={{ flex: 1, height: 14, background: '#F3F4F6', borderRadius: 7, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${bar.val != null ? (bar.val / bar.max) * 100 : 0}%`, background: bar.color, borderRadius: 7, transition: 'width 0.5s' }} />
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#374151', minWidth: 30 }}>{bar.val ?? '—'}</span>
                    </div>
                  ))}
                </div>

                <div style={{ ...card, background: '#FDFAF3' }}>
                  <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.6, margin: 0 }}>{pattern.patientSummary}</p>
                </div>
              </>
            )}
          </div>
        )
      )}

      {/* ── Tab 3: Histórico ── */}
      {tab === 'histórico' && (
        loading ? <p style={{ color: '#6B7280', textAlign: 'center', padding: 20 }}>Carregando...</p> : (
          history.length === 0 ? (
            <div style={{ ...card, textAlign: 'center' }}>
              <p style={{ color: '#6B7280' }}>Nenhuma avaliação registrada.</p>
            </div>
          ) : (
            <div>
              {history.map((h: any) => {
                const sevColor = SEVERITY_COLORS[h.severityLevel] || '#6B7280';
                return (
                  <div key={h.id} style={{ ...card, padding: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <span style={{ fontSize: 13, fontWeight: 600, color: '#1F2937' }}>{(h.assessmentType || '').toUpperCase()}</span>
                        <span style={{ fontSize: 12, color: '#9CA3AF', marginLeft: 8 }}>{formatDateTimeBR(h.createdAt)}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 18, fontWeight: 700, color: '#1F2937' }}>{h.totalScore}</span>
                        <span style={{ padding: '2px 10px', borderRadius: 999, fontSize: 11, fontWeight: 600, color: '#fff', background: sevColor }}>
                          {SEVERITY_LABELS[h.severityLevel] || h.severityLevel}
                        </span>
                      </div>
                    </div>
                    {h.cyclePhaseAtAssessment && h.cyclePhaseAtAssessment !== 'unknown' && (
                      <p style={{ fontSize: 11, color: '#9CA3AF', marginTop: 4 }}>Fase: {PHASE_LABELS[h.cyclePhaseAtAssessment]} (dia {h.cycleDay})</p>
                    )}
                  </div>
                );
              })}
            </div>
          )
        )
      )}

      {/* ── Tab 4: Evolução ── */}
      {tab === 'evolução' && (
        <div>
          <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
            {([['phq9', 'Humor'], ['gad7', 'Ansiedade'], ['pss10', 'Estresse']] as const).map(([key, label]) => (
              <button key={key} onClick={() => setTimelineType(key)} style={{
                flex: 1, padding: '8px 4px', borderRadius: 999, border: 'none', fontSize: 12, fontWeight: 600,
                cursor: 'pointer', background: timelineType === key ? '#FBEAE1' : '#F3F4F6',
                color: timelineType === key ? '#14161F' : '#6B7280', fontFamily: "'Figtree', sans-serif",
              }}>{label}</button>
            ))}
          </div>
          <div style={card}>
            <MentalHealthTimeline type={timelineType} />
          </div>
          <p style={{ fontSize: 12, color: '#6B7280', textAlign: 'center', marginTop: 8 }}>
            {timelineType === 'phq9' && 'Pontuações mais baixas indicam menos sintomas depressivos.'}
            {timelineType === 'gad7' && 'Pontuações mais baixas indicam menos sintomas de ansiedade.'}
            {timelineType === 'pss10' && 'Pontuações mais baixas indicam menor estresse percebido.'}
          </p>
        </div>
      )}

      <p style={{ fontSize: 11, color: '#9CA3AF', textAlign: 'center', marginTop: 20, fontStyle: 'italic' }}>
        Estes dados são confidenciais e protegidos. Em caso de crise: CVV 188 (24h).
      </p>
    </Layout>
  );
}
