import React, { useState } from 'react';
import { X, Plus, ChevronRight, ChevronDown } from 'lucide-react';
import { useMedications } from '../hooks/useMedications';
import { MedicationForm } from './MedicationForm';
import { categoryLabels, CreateMedicationInput } from '../services/medications.api';
import { formatBR } from '../utils/format';

/** Tons Lunar Bloom — tipos de medicação por categoria */
const CATEGORY_TINTS: Record<string, { bg: string; fg: string; border: string }> = {
  hormonal_contraceptive: { bg: 'rgba(217,119,87,0.12)',  fg: '#B85A3D', border: '#D97757' },
  hormonal_iud:           { bg: 'rgba(184,90,61,0.12)',   fg: '#B85A3D', border: '#B85A3D' },
  thyroid:                { bg: 'rgba(156,168,154,0.14)', fg: '#5B6B5C', border: '#9CA89A' },
  antidepressant:         { bg: 'rgba(20,22,31,0.06)',    fg: '#14161F', border: '#14161F' },
  anxiolytic:             { bg: 'rgba(201,169,119,0.14)', fg: '#7A5F2E', border: '#C9A977' },
  progesterone:           { bg: 'rgba(232,154,128,0.16)', fg: '#B85A3D', border: '#E89A80' },
  other:                  { bg: 'rgba(20,22,31,0.06)',    fg: 'rgba(20,22,31,0.68)', border: 'rgba(20,22,31,0.3)' },
};

const defaultTint = { bg: 'rgba(20,22,31,0.06)', fg: 'rgba(20,22,31,0.68)', border: 'rgba(20,22,31,0.3)' };

interface Props { isOpen: boolean; onClose: () => void }

export function MedicationsSidebar({ isOpen, onClose }: Props) {
  const { medications, loading, add, update, discontinue } = useMedications(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  const active = medications.filter(m => m.active);
  const inactive = medications.filter(m => !m.active);

  const handleAdd = async (data: CreateMedicationInput) => {
    await add(data);
    setShowForm(false);
  };

  const handleDiscontinue = async (id: string) => {
    await discontinue(id);
    setConfirmId(null);
  };

  return (
    <>
      <style>{`
        .med-overlay {
          position: fixed; inset: 0;
          background: rgba(20,22,31,0.58);
          backdrop-filter: blur(6px);
          z-index: 60;
          opacity: 0; pointer-events: none;
          transition: opacity 0.35s cubic-bezier(0.16,1,0.3,1);
        }
        .med-overlay.open { opacity: 1; pointer-events: auto; }
        .med-panel {
          position: fixed; top: 0; right: 0;
          width: 420px; max-width: 100vw; height: 100vh;
          background: #FDFAF3;
          z-index: 65;
          transform: translateX(100%);
          transition: transform 0.4s cubic-bezier(0.16,1,0.3,1);
          display: flex; flex-direction: column;
          border-left: 1px solid rgba(20,22,31,0.08);
          font-family: 'Figtree', sans-serif;
          color: #14161F;
        }
        .med-panel.open { transform: translateX(0); }
        @media (prefers-reduced-motion: reduce) {
          .med-overlay, .med-panel { transition: none !important; }
        }
      `}</style>

      <div className={`med-overlay ${isOpen ? 'open' : ''}`} onClick={onClose} />

      <div className={`med-panel ${isOpen ? 'open' : ''}`}>
        {/* Header */}
        <div
          style={{
            padding: '24px 24px 20px',
            borderBottom: '1px solid rgba(20,22,31,0.08)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: 12,
          }}
        >
          <div>
            <div
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 10,
                letterSpacing: '0.28em',
                textTransform: 'uppercase',
                color: '#D97757',
                marginBottom: 8,
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#D97757' }} aria-hidden />
              Farmacoterapia
            </div>
            <h2
              style={{
                fontFamily: "'Fraunces', serif",
                fontSize: 24,
                fontWeight: 450,
                letterSpacing: '-0.02em',
                color: '#14161F',
                margin: 0,
                lineHeight: 1.1,
              }}
            >
              Suas medicações
            </h2>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button
              onClick={() => setShowForm(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 14px',
                border: 'none',
                background: '#14161F',
                color: '#F5EFE6',
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                fontFamily: "'Figtree', sans-serif",
                transition: 'background 0.25s',
              }}
              onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.background = '#D97757'}
              onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.background = '#14161F'}
            >
              <Plus size={13} /> Adicionar
            </button>
            <button
              onClick={onClose}
              aria-label="Fechar"
              style={{
                background: 'none',
                border: '1px solid transparent',
                cursor: 'pointer',
                color: 'rgba(20,22,31,0.62)',
                padding: 6,
                transition: 'border-color 0.25s',
              }}
              onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.borderColor = 'rgba(20,22,31,0.12)'}
              onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.borderColor = 'transparent'}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
          {loading && (
            <p
              style={{
                color: 'rgba(20,22,31,0.5)',
                fontSize: 11,
                fontFamily: "'JetBrains Mono', monospace",
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
              }}
            >
              Carregando…
            </p>
          )}

          {/* Add form */}
          {showForm && (
            <div
              style={{
                marginBottom: 20,
                padding: 18,
                background: '#F5EFE6',
                border: '1px solid rgba(20,22,31,0.08)',
              }}
            >
              <MedicationForm onSave={handleAdd} onCancel={() => setShowForm(false)} />
            </div>
          )}

          {/* Active medications */}
          <p
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 10,
              fontWeight: 600,
              color: 'rgba(20,22,31,0.55)',
              textTransform: 'uppercase',
              letterSpacing: '0.28em',
              margin: '0 0 12px',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#D97757' }} aria-hidden />
            Em uso ({active.length})
          </p>
          {active.length === 0 && !loading && (
            <p style={{ fontSize: 13, color: 'rgba(20,22,31,0.55)', marginBottom: 20, lineHeight: 1.5 }}>
              Nenhuma medicação ativa.
            </p>
          )}
          {active.map(m => {
            const tint = CATEGORY_TINTS[m.category] ?? defaultTint;
            return (
              <div
                key={m.id}
                style={{
                  background: '#FDFAF3',
                  border: '1px solid rgba(20,22,31,0.08)',
                  padding: 16,
                  marginBottom: 12,
                }}
              >
                {editingId === m.id ? (
                  <MedicationForm
                    initialData={{ name: m.name, category: m.category, dose: m.dose ?? '', frequency: m.frequency ?? '', startDate: m.startDate, notes: m.notes ?? '' }}
                    onSave={async (data) => { await update(m.id, data); setEditingId(null); }}
                    onCancel={() => setEditingId(null)}
                  />
                ) : (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8, gap: 10, flexWrap: 'wrap' }}>
                      <span
                        style={{
                          fontFamily: "'Fraunces', serif",
                          fontSize: 17,
                          fontWeight: 450,
                          letterSpacing: '-0.01em',
                          color: '#14161F',
                        }}
                      >
                        {m.name}
                      </span>
                      <span
                        style={{
                          padding: '3px 10px',
                          fontSize: 10,
                          fontWeight: 600,
                          fontFamily: "'JetBrains Mono', monospace",
                          letterSpacing: '0.14em',
                          textTransform: 'uppercase',
                          color: tint.fg,
                          background: tint.bg,
                          border: `1px solid ${tint.border}44`,
                        }}
                      >
                        {categoryLabels[m.category]}
                      </span>
                    </div>
                    {(m.dose || m.frequency) && (
                      <p style={{ fontSize: 12.5, color: '#14161F', margin: '0 0 4px', lineHeight: 1.45 }}>
                        {[m.dose, m.frequency].filter(Boolean).join(' · ')}
                      </p>
                    )}
                    <p
                      style={{
                        fontSize: 11,
                        color: 'rgba(20,22,31,0.5)',
                        margin: '0 0 10px',
                        fontFamily: "'JetBrains Mono', monospace",
                        letterSpacing: '0.08em',
                      }}
                    >
                      desde {formatBR(m.startDate)}
                    </p>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                      <button
                        onClick={() => setEditingId(m.id)}
                        style={{
                          fontSize: 11,
                          color: '#14161F',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          fontFamily: "'Figtree', sans-serif",
                          letterSpacing: '0.12em',
                          textTransform: 'uppercase',
                          fontWeight: 600,
                          textDecoration: 'underline',
                          textUnderlineOffset: 3,
                          textDecorationColor: '#D97757',
                          padding: 0,
                        }}
                      >
                        Editar
                      </button>
                      {confirmId === m.id ? (
                        <>
                          <span style={{ fontSize: 11, color: 'rgba(20,22,31,0.6)' }}>Confirmar?</span>
                          <button
                            onClick={() => handleDiscontinue(m.id)}
                            style={{
                              fontSize: 11,
                              color: '#8B3A2F',
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              fontWeight: 700,
                              fontFamily: "'Figtree', sans-serif",
                              letterSpacing: '0.12em',
                              textTransform: 'uppercase',
                              padding: 0,
                            }}
                          >
                            Sim
                          </button>
                          <button
                            onClick={() => setConfirmId(null)}
                            style={{
                              fontSize: 11,
                              color: 'rgba(20,22,31,0.55)',
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              fontFamily: "'Figtree', sans-serif",
                              letterSpacing: '0.12em',
                              textTransform: 'uppercase',
                              padding: 0,
                            }}
                          >
                            Não
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => setConfirmId(m.id)}
                          style={{
                            fontSize: 11,
                            color: '#8B3A2F',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            fontFamily: "'Figtree', sans-serif",
                            letterSpacing: '0.12em',
                            textTransform: 'uppercase',
                            fontWeight: 500,
                            padding: 0,
                          }}
                        >
                          Descontinuar
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}

          {/* History */}
          {inactive.length > 0 && (
            <div style={{ marginTop: 24 }}>
              <button
                onClick={() => setShowHistory(!showHistory)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: 11,
                  color: '#14161F',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 600,
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                  fontFamily: "'Figtree', sans-serif",
                  padding: 0,
                }}
              >
                {showHistory ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                Histórico ({inactive.length})
              </button>
              {showHistory && inactive.map(m => (
                <div
                  key={m.id}
                  style={{
                    background: 'rgba(20,22,31,0.03)',
                    padding: 14,
                    marginTop: 10,
                    opacity: 0.68,
                    borderLeft: '2px solid rgba(20,22,31,0.15)',
                  }}
                >
                  <span style={{ fontSize: 14, fontWeight: 500, color: '#14161F' }}>{m.name}</span>
                  <span
                    style={{
                      marginLeft: 8,
                      fontSize: 10,
                      color: 'rgba(20,22,31,0.5)',
                      fontFamily: "'JetBrains Mono', monospace",
                      letterSpacing: '0.14em',
                      textTransform: 'uppercase',
                    }}
                  >
                    {categoryLabels[m.category]}
                  </span>
                  <p
                    style={{
                      fontSize: 11,
                      color: 'rgba(20,22,31,0.5)',
                      margin: '4px 0 0',
                      fontFamily: "'JetBrains Mono', monospace",
                      letterSpacing: '0.06em',
                    }}
                  >
                    {formatBR(m.startDate)} → {formatBR(m.endDate)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '14px 24px',
            borderTop: '1px solid rgba(20,22,31,0.08)',
            background: 'rgba(20,22,31,0.02)',
          }}
        >
          <p
            style={{
              fontFamily: "'Fraunces', serif",
              fontStyle: 'italic',
              fontSize: 12,
              color: 'rgba(20,22,31,0.62)',
              margin: 0,
              lineHeight: 1.5,
            }}
          >
            O registro de medicações correlaciona seu histórico de saúde com mudanças no ciclo e humor.
          </p>
        </div>
      </div>
    </>
  );
}
