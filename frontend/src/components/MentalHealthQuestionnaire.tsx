import React, { useState } from 'react';
import type { Instrument } from '../data/mentalHealthQuestions';

interface Props {
  instrument: Instrument;
  onComplete: (answers: Record<string, number>) => void;
}

export function MentalHealthQuestionnaire({ instrument, onComplete }: Props) {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [showSafetyModal, setShowSafetyModal] = useState(false);
  const [pendingAdvance, setPendingAdvance] = useState(false);
  const q = instrument.questions[current];
  const total = instrument.questions.length;
  const isLast = current === total - 1;
  const progress = ((current + 1) / total) * 100;

  const selectOption = (value: number) => {
    const next = { ...answers, [q.id]: value };
    setAnswers(next);

    // PHQ-9 question 9 safety check
    if (instrument.key === 'phq9' && q.id === '9' && value >= 1) {
      setPendingAdvance(!isLast);
      setShowSafetyModal(true);
      return;
    }

    if (!isLast) {
      setTimeout(() => setCurrent(c => c + 1), 200);
    }
  };

  const handleContinueAfterModal = () => {
    setShowSafetyModal(false);
    if (pendingAdvance) {
      setPendingAdvance(false);
      setTimeout(() => setCurrent(c => c + 1), 100);
    }
  };

  return (
    <div style={{ maxWidth: 500, margin: '0 auto' }}>
      {/* Safety modal */}
      {showSafetyModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 20,
        }}>
          <div style={{
            background: '#fff', borderRadius: 24, padding: 32,
            maxWidth: 420, width: '100%', textAlign: 'center',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>💜</div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#2D1B4E', marginBottom: 12, fontFamily: "'Cormorant Garamond', serif" }}>
              Obrigada por confiar em nos
            </h2>
            <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.7, marginBottom: 20 }}>
              Percebemos que voce marcou que teve pensamentos dificeis sobre si mesma.
              Isso nao precisa ser enfrentado sozinha.
              <br /><br />
              Falar com alguem de confianca ou com um profissional de saude mental
              pode fazer uma grande diferenca.
            </p>

            <p style={{ fontSize: 13, fontWeight: 600, color: '#6B7280', marginBottom: 12 }}>
              Se precisar de apoio agora:
            </p>

            <a href="tel:188" style={{
              display: 'block', width: '100%', padding: '14px 0', borderRadius: 14,
              background: '#2D1B4E', color: '#fff', fontSize: 15, fontWeight: 700,
              textDecoration: 'none', marginBottom: 10, textAlign: 'center',
              fontFamily: "'DM Sans', sans-serif",
            }}>
              CVV — Centro de Valorizacao da Vida
            </a>

            <a href="https://www.cvv.org.br" target="_blank" rel="noopener noreferrer" style={{
              display: 'block', width: '100%', padding: '12px 0', borderRadius: 14,
              background: '#F5F3FF', color: '#7C3AED', fontSize: 14, fontWeight: 600,
              textDecoration: 'none', marginBottom: 16, textAlign: 'center',
              border: '1.5px solid #7C3AED', fontFamily: "'DM Sans', sans-serif",
            }}>
              Enviar mensagem ao CVV
            </a>

            <p style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 20 }}>
              188 — Ligacao gratuita, 24 horas, 7 dias por semana
            </p>

            <button onClick={handleContinueAfterModal} style={{
              padding: '10px 24px', borderRadius: 10,
              border: '1px solid #E5E7EB', background: '#fff',
              color: '#6B7280', fontSize: 13, fontWeight: 500,
              cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
            }}>
              Continuar o questionario
            </button>
          </div>
        </div>
      )}

      {/* Progress */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#6B7280', marginBottom: 6 }}>
          <span>Pergunta {current + 1} de {total}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div style={{ height: 6, background: '#E5E7EB', borderRadius: 3, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${progress}%`, background: '#7C3AED', borderRadius: 3, transition: 'width 0.3s' }} />
        </div>
      </div>

      {/* Question */}
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E5E7EB', padding: 24, marginBottom: 16, minHeight: 220 }}>
        <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 4 }}>{instrument.description}</p>
        <p style={{ fontSize: 16, fontWeight: 600, color: '#1F2937', marginBottom: 20, lineHeight: 1.5 }}>{q.text}</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {q.options.map((opt, i) => {
            const selected = answers[q.id] === opt.value;
            return (
              <button key={i} onClick={() => selectOption(opt.value)} style={{
                padding: '12px 16px', borderRadius: 12, textAlign: 'left',
                border: selected ? '2px solid #7C3AED' : '1.5px solid #E5E7EB',
                background: selected ? '#F5F3FF' : '#fff',
                color: selected ? '#7C3AED' : '#374151',
                fontWeight: selected ? 600 : 400,
                fontSize: 14, cursor: 'pointer', transition: 'all 0.15s',
                fontFamily: "'DM Sans', sans-serif",
              }}>
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <button onClick={() => setCurrent(c => Math.max(0, c - 1))} disabled={current === 0}
          style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #E5E7EB', background: '#fff', cursor: current === 0 ? 'default' : 'pointer', opacity: current === 0 ? 0.4 : 1, fontSize: 13, fontFamily: "'DM Sans', sans-serif" }}>
          Anterior
        </button>
        {isLast && answers[q.id] !== undefined && (
          <button onClick={() => onComplete(answers)} style={{
            padding: '10px 24px', borderRadius: 10, border: 'none',
            background: '#7C3AED', color: '#fff', fontWeight: 600,
            fontSize: 14, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
          }}>
            Concluir
          </button>
        )}
      </div>
    </div>
  );
}
