import React, { useEffect, useState } from 'react';
import { mentalHealthApi, MHQuestion, MHAssessment, MeditationsResponse } from '../services/mental-health.api';
import Layout from '../components/Layout';
import { formatBR } from '../utils/format';
import { Brain, ChevronRight } from 'lucide-react';

const card: React.CSSProperties = {
  background: '#fff', borderRadius: 14, border: '1px solid #E5E7EB', padding: 16, marginBottom: 14,
};
const btnPrimary: React.CSSProperties = {
  width: '100%', padding: 12, background: '#7C3AED', color: '#fff', border: 'none', borderRadius: 12,
  fontSize: 14, fontWeight: 600, cursor: 'pointer',
};

type TabType = 'phq9' | 'gad7';

const TAB_LABELS: Record<TabType, string> = { phq9: 'Depressao (PHQ-9)', gad7: 'Ansiedade (GAD-7)' };
const TAB_REFS: Record<TabType, string> = {
  phq9: 'PHQ-9: Kroenke et al., 2001',
  gad7: 'GAD-7: Spitzer et al., 2006',
};

const OPTION_LABELS = ['Nenhuma vez', 'Varios dias', 'Mais da metade dos dias', 'Quase todos os dias'];

function severityColor(severity: string): string {
  const s = severity.toLowerCase();
  if (s.includes('minimal') || s.includes('none') || s.includes('minimo') || s.includes('minima') || s.includes('leve')) return '#16A34A';
  if (s.includes('moderate') || s.includes('moderado') || s.includes('moderada')) return '#D97706';
  return '#DC2626';
}

function severityLabel(severity: string): string {
  const map: Record<string, string> = {
    none: 'Minimo', minimal: 'Minimo', mild: 'Leve', moderate: 'Moderado',
    moderately_severe: 'Moderadamente severo', severe: 'Severo',
  };
  return map[severity.toLowerCase()] ?? severity;
}

export default function MentalHealth() {
  const [tab, setTab] = useState<TabType>('phq9');
  const [questions, setQuestions] = useState<MHQuestion[]>([]);
  const [answers, setAnswers] = useState<number[]>([]);
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [result, setResult] = useState<MHAssessment | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const [latest, setLatest] = useState<{ phq9: MHAssessment | null; gad7: MHAssessment | null }>({ phq9: null, gad7: null });
  const [history, setHistory] = useState<MHAssessment[]>([]);
  const [meditations, setMeditations] = useState<MeditationsResponse | null>(null);

  const loadData = async () => {
    try {
      const [lat, hist, med] = await Promise.all([
        mentalHealthApi.latest().catch(() => ({ phq9: null, gad7: null })),
        mentalHealthApi.history(tab).catch(() => []),
        mentalHealthApi.meditations().catch(() => null),
      ]);
      setLatest(lat);
      setHistory(hist);
      setMeditations(med);
    } catch { /* ignore */ }
  };

  useEffect(() => {
    setLoading(true);
    loadData().finally(() => setLoading(false));
  }, [tab]);

  const startAssessment = async () => {
    try {
      const qs = await mentalHealthApi.questions(tab);
      setQuestions(qs);
      setAnswers(new Array(qs.length).fill(-1));
      setResult(null);
      setShowQuestionnaire(true);
    } catch { /* ignore */ }
  };

  const handleAnswer = (qIdx: number, value: number) => {
    const next = [...answers];
    next[qIdx] = value;
    setAnswers(next);
  };

  const handleSubmit = async () => {
    if (answers.some((a) => a < 0)) return;
    setSubmitting(true);
    try {
      const res = await mentalHealthApi.submit(tab, answers);
      setResult(res);
      setShowQuestionnaire(false);
      await loadData();
    } catch { /* ignore */ } finally {
      setSubmitting(false);
    }
  };

  const allAnswered = answers.length > 0 && answers.every((a) => a >= 0);

  return (
    <Layout>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
        <Brain size={26} color="#7C3AED" />
        <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 26, fontWeight: 600, color: '#2D1B4E', margin: 0 }}>
          Saude mental
        </h1>
      </div>
      <p style={{ fontSize: 14, color: '#6B7280', margin: '0 0 20px' }}>Avalie e acompanhe sua saude emocional</p>

      {/* Section A: Assessment */}
      <div style={card}>
        {/* Tab pills */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          {(['phq9', 'gad7'] as TabType[]).map((t) => (
            <button
              key={t}
              onClick={() => { setTab(t); setShowQuestionnaire(false); setResult(null); }}
              style={{
                flex: 1, padding: '8px 4px', borderRadius: 999, border: 'none', fontSize: 13, fontWeight: 600,
                cursor: 'pointer', transition: 'all 0.15s',
                background: tab === t ? '#7C3AED' : '#F3F4F6',
                color: tab === t ? '#fff' : '#6B7280',
              }}
            >
              {TAB_LABELS[t]}
            </button>
          ))}
        </div>

        {/* Start button or questionnaire */}
        {!showQuestionnaire && !result && (
          <button onClick={startAssessment} style={btnPrimary}>Iniciar avaliacao</button>
        )}

        {/* Questionnaire */}
        {showQuestionnaire && (
          <div>
            <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 16 }}>
              Nas ultimas 2 semanas, com que frequencia voce foi incomodado(a) pelos seguintes problemas?
            </p>
            {questions.map((q, qi) => (
              <div key={qi} style={{ marginBottom: 18 }}>
                <p style={{ fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 8 }}>
                  {qi + 1}. {q.text}
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {OPTION_LABELS.map((label, val) => (
                    <label
                      key={val}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 10,
                        border: `1.5px solid ${answers[qi] === val ? '#7C3AED' : '#E5E7EB'}`,
                        background: answers[qi] === val ? '#EDE9FE' : '#fff', cursor: 'pointer', fontSize: 13,
                      }}
                    >
                      <input
                        type="radio" name={`q-${qi}`} checked={answers[qi] === val}
                        onChange={() => handleAnswer(qi, val)}
                        style={{ accentColor: '#7C3AED' }}
                      />
                      <span style={{ color: '#374151' }}>{val} - {label}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
            <button
              onClick={handleSubmit}
              disabled={!allAnswered || submitting}
              style={{ ...btnPrimary, opacity: !allAnswered || submitting ? 0.5 : 1 }}
            >
              {submitting ? 'Enviando...' : 'Enviar avaliacao'}
            </button>
          </div>
        )}

        {/* Result card */}
        {result && (
          <div style={{ background: '#F9FAFB', borderRadius: 12, padding: 16, marginTop: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 15, fontWeight: 600, color: '#374151' }}>Resultado</span>
              <span style={{
                padding: '4px 12px', borderRadius: 999, fontSize: 12, fontWeight: 600,
                background: severityColor(result.severity) + '18', color: severityColor(result.severity),
              }}>
                {severityLabel(result.severity)}
              </span>
            </div>
            <div style={{ fontSize: 32, fontWeight: 700, color: '#2D1B4E', marginBottom: 4 }}>
              {result.totalScore}
              <span style={{ fontSize: 14, fontWeight: 400, color: '#9CA3AF' }}>
                {' '}/ {tab === 'phq9' ? 27 : 21}
              </span>
            </div>
            <p style={{ fontSize: 13, color: '#6B7280', margin: '8px 0 0' }}>
              {tab === 'phq9'
                ? 'Escore total do PHQ-9. Quanto maior, mais significativos os sintomas depressivos.'
                : 'Escore total do GAD-7. Quanto maior, mais significativos os sintomas de ansiedade.'
              }
            </p>
            <p style={{ fontSize: 11, color: '#9CA3AF', marginTop: 12, fontStyle: 'italic' }}>
              Ref.: {TAB_REFS[tab]}
            </p>
            <button
              onClick={() => { setResult(null); }}
              style={{ ...btnPrimary, marginTop: 12, background: '#EDE9FE', color: '#7C3AED' }}
            >
              Nova avaliacao
            </button>
          </div>
        )}
      </div>

      {/* Section B: History + Meditations */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 32, color: '#9CA3AF' }}>Carregando...</div>
      ) : (
        <>
          {/* Latest scores */}
          <div style={card}>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 12 }}>Ultimas pontuacoes</p>
            <div style={{ display: 'flex', gap: 12 }}>
              {(['phq9', 'gad7'] as TabType[]).map((t) => {
                const a = t === 'phq9' ? latest.phq9 : latest.gad7;
                return (
                  <div key={t} style={{ flex: 1, background: '#F9FAFB', borderRadius: 12, padding: 14, textAlign: 'center' }}>
                    <p style={{ fontSize: 11, color: '#9CA3AF', margin: 0, textTransform: 'uppercase', fontWeight: 600, letterSpacing: 0.5 }}>
                      {t === 'phq9' ? 'PHQ-9' : 'GAD-7'}
                    </p>
                    {a ? (
                      <>
                        <p style={{ fontSize: 28, fontWeight: 700, color: '#2D1B4E', margin: '4px 0' }}>{a.totalScore}</p>
                        <span style={{
                          padding: '2px 10px', borderRadius: 999, fontSize: 11, fontWeight: 600,
                          background: severityColor(a.severity) + '18', color: severityColor(a.severity),
                        }}>
                          {severityLabel(a.severity)}
                        </span>
                      </>
                    ) : (
                      <p style={{ fontSize: 13, color: '#9CA3AF', margin: '8px 0 0' }}>Sem dados</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* History list */}
          {history.length > 0 && (
            <div style={card}>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 12 }}>Historico recente</p>
              {history.slice(0, 5).map((h) => (
                <div key={h.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #F3F4F6' }}>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 500, color: '#374151', margin: 0 }}>
                      {h.type === 'phq9' ? 'PHQ-9' : 'GAD-7'} - {formatBR(h.date)}
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: '#2D1B4E' }}>{h.totalScore}</span>
                    <span style={{
                      padding: '2px 8px', borderRadius: 999, fontSize: 10, fontWeight: 600,
                      background: severityColor(h.severity) + '18', color: severityColor(h.severity),
                    }}>
                      {severityLabel(h.severity)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Meditation suggestions */}
          {meditations && meditations.suggestions.length > 0 && (
            <div style={card}>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 12 }}>Sugestoes de meditacao</p>
              {meditations.suggestions.map((m, i) => (
                <div key={i} style={{ background: '#F5F3FF', borderRadius: 12, padding: 14, marginBottom: i < meditations.suggestions.length - 1 ? 10 : 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <p style={{ fontSize: 14, fontWeight: 600, color: '#5B21B6', margin: 0 }}>{m.title}</p>
                    {m.duration && <span style={{ fontSize: 11, color: '#7C3AED' }}>{m.duration}</span>}
                  </div>
                  <p style={{ fontSize: 13, color: '#6B7280', margin: '6px 0 0' }}>{m.description}</p>
                </div>
              ))}
            </div>
          )}

          {/* Privacy note */}
          <p style={{ fontSize: 11, color: '#9CA3AF', textAlign: 'center', marginTop: 20, fontStyle: 'italic' }}>
            Estes dados sao confidenciais e protegidos
          </p>
        </>
      )}
    </Layout>
  );
}
