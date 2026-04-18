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
    <div style={{ maxWidth: 560, margin: '0 auto', fontFamily: "'Figtree', sans-serif", color: '#14161F' }}>
      {/* Safety modal */}
      {showSafetyModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            background: 'rgba(20,22,31,0.7)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
          }}
        >
          <div
            style={{
              background: '#FDFAF3',
              border: '1px solid rgba(20,22,31,0.12)',
              padding: 36,
              maxWidth: 460,
              width: '100%',
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div
              aria-hidden
              style={{
                position: 'absolute',
                top: '-30%',
                left: '-30%',
                width: '80%',
                height: '80%',
                background: 'radial-gradient(closest-side, rgba(217,119,87,0.2), transparent 70%)',
                filter: 'blur(40px)',
                pointerEvents: 'none',
              }}
            />
            <div style={{ position: 'relative' }}>
              <div
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 10,
                  letterSpacing: '0.3em',
                  textTransform: 'uppercase',
                  color: '#D97757',
                  marginBottom: 18,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: 10,
                }}
              >
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#D97757' }} aria-hidden />
                Você não está sozinha
              </div>
              <h2
                style={{
                  fontFamily: "'Fraunces', serif",
                  fontSize: 26,
                  fontWeight: 400,
                  letterSpacing: '-0.025em',
                  color: '#14161F',
                  margin: '0 0 16px',
                  lineHeight: 1.15,
                }}
              >
                Obrigada por <span style={{ fontStyle: 'italic', color: '#B85A3D' }}>confiar</span>.
              </h2>
              <p
                style={{
                  fontSize: 14,
                  color: 'rgba(20,22,31,0.72)',
                  lineHeight: 1.65,
                  margin: '0 0 24px',
                  maxWidth: 380,
                  marginLeft: 'auto',
                  marginRight: 'auto',
                }}
              >
                Você indicou pensamentos difíceis sobre si mesma. Isso não precisa ser enfrentado sozinha — falar com alguém de confiança ou com um profissional pode fazer diferença.
              </p>

              <p
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 10,
                  letterSpacing: '0.24em',
                  textTransform: 'uppercase',
                  color: 'rgba(20,22,31,0.55)',
                  margin: '0 0 14px',
                }}
              >
                Se precisar de apoio agora
              </p>

              <a
                href="tel:188"
                style={{
                  display: 'block',
                  width: '100%',
                  padding: 18,
                  background: '#14161F',
                  color: '#F5EFE6',
                  fontSize: 13,
                  fontWeight: 600,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  textDecoration: 'none',
                  marginBottom: 10,
                  textAlign: 'center',
                  fontFamily: "'Figtree', sans-serif",
                  border: '1px solid #D97757',
                  transition: 'background 0.3s',
                }}
              >
                Ligar — CVV 188
              </a>

              <a
                href="https://www.cvv.org.br"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'block',
                  width: '100%',
                  padding: 16,
                  background: 'transparent',
                  color: '#14161F',
                  fontSize: 12,
                  fontWeight: 600,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  textDecoration: 'none',
                  marginBottom: 18,
                  textAlign: 'center',
                  border: '1px solid rgba(20,22,31,0.14)',
                  fontFamily: "'Figtree', sans-serif",
                }}
              >
                Mensagem ao CVV
              </a>

              <p
                style={{
                  fontSize: 11,
                  color: 'rgba(20,22,31,0.5)',
                  margin: '0 0 24px',
                  fontFamily: "'Fraunces', serif",
                  fontStyle: 'italic',
                }}
              >
                Gratuito · 24 horas · 7 dias por semana
              </p>

              <button
                onClick={handleContinueAfterModal}
                style={{
                  padding: '10px 22px',
                  border: '1px solid rgba(20,22,31,0.12)',
                  background: 'transparent',
                  color: 'rgba(20,22,31,0.68)',
                  fontSize: 11,
                  fontWeight: 500,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  fontFamily: "'Figtree', sans-serif",
                }}
              >
                Continuar o questionário
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Progress */}
      <div style={{ marginBottom: 24 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: 11,
            color: 'rgba(20,22,31,0.55)',
            marginBottom: 8,
            fontFamily: "'JetBrains Mono', monospace",
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
          }}
        >
          <span>{String(current + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div style={{ height: 2, background: 'rgba(20,22,31,0.1)', position: 'relative', overflow: 'hidden' }}>
          <div
            style={{
              height: '100%',
              width: `${progress}%`,
              background: '#14161F',
              transition: 'width 0.4s cubic-bezier(0.16,1,0.3,1)',
              position: 'relative',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: -1,
                right: 0,
                bottom: -1,
                width: 20,
                background: '#D97757',
              }}
            />
          </div>
        </div>
      </div>

      {/* Question */}
      <div
        style={{
          background: '#FDFAF3',
          border: '1px solid rgba(20,22,31,0.08)',
          padding: 28,
          marginBottom: 20,
          minHeight: 240,
        }}
      >
        <p
          style={{
            fontFamily: "'Fraunces', serif",
            fontStyle: 'italic',
            fontSize: 13,
            color: 'rgba(20,22,31,0.6)',
            margin: '0 0 6px',
          }}
        >
          {instrument.description}
        </p>
        <p
          style={{
            fontFamily: "'Fraunces', serif",
            fontSize: 20,
            fontWeight: 450,
            letterSpacing: '-0.015em',
            color: '#14161F',
            margin: '0 0 24px',
            lineHeight: 1.3,
          }}
        >
          {q.text}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {q.options.map((opt, i) => {
            const selected = answers[q.id] === opt.value;
            return (
              <button
                key={i}
                onClick={() => selectOption(opt.value)}
                style={{
                  padding: '14px 18px',
                  textAlign: 'left',
                  border: `1px solid ${selected ? '#14161F' : 'rgba(20,22,31,0.12)'}`,
                  background: selected ? '#14161F' : 'transparent',
                  color: selected ? '#F5EFE6' : '#14161F',
                  fontWeight: selected ? 500 : 400,
                  fontSize: 14,
                  cursor: 'pointer',
                  transition: 'all 0.25s cubic-bezier(0.16,1,0.3,1)',
                  fontFamily: "'Figtree', sans-serif",
                }}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button
          onClick={() => setCurrent(c => Math.max(0, c - 1))}
          disabled={current === 0}
          style={{
            padding: '12px 20px',
            border: '1px solid rgba(20,22,31,0.12)',
            background: 'transparent',
            cursor: current === 0 ? 'default' : 'pointer',
            opacity: current === 0 ? 0.35 : 1,
            fontSize: 11,
            fontWeight: 500,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: '#14161F',
            fontFamily: "'Figtree', sans-serif",
          }}
        >
          Anterior
        </button>
        {isLast && answers[q.id] !== undefined && (
          <button
            onClick={() => onComplete(answers)}
            style={{
              padding: '14px 28px',
              border: 'none',
              background: '#14161F',
              color: '#F5EFE6',
              fontWeight: 600,
              fontSize: 12,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              fontFamily: "'Figtree', sans-serif",
              transition: 'background 0.3s',
            }}
            onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.background = '#D97757'}
            onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.background = '#14161F'}
          >
            Concluir
          </button>
        )}
      </div>
    </div>
  );
}
