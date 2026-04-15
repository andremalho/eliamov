import React, { useState } from 'react';
import { useMedications } from '../hooks/useMedications';
import { MedicationForm } from './MedicationForm';
import { categoryLabels, CreateMedicationInput } from '../services/medications.api';
import { formatBR } from '../utils/format';

const CATEGORY_COLORS: Record<string, string> = {
  hormonal_contraceptive: '#EC4899', hormonal_iud: '#8B5CF6', thyroid: '#3B82F6',
  antidepressant: '#10B981', anxiolytic: '#F59E0B', progesterone: '#F97316', other: '#6B7280',
};

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
        .med-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.5); backdrop-filter:blur(4px); z-index:60; opacity:0; pointer-events:none; transition:opacity 0.3s; }
        .med-overlay.open { opacity:1; pointer-events:auto; }
        .med-panel { position:fixed; top:0; right:0; width:380px; max-width:100vw; height:100vh; background:#fff; z-index:65; transform:translateX(100%); transition:transform 0.3s cubic-bezier(0.4,0,0.2,1); display:flex; flex-direction:column; box-shadow:-8px 0 40px rgba(0,0,0,0.12); }
        .med-panel.open { transform:translateX(0); }
      `}</style>

      <div className={`med-overlay ${isOpen ? 'open' : ''}`} onClick={onClose} />

      <div className={`med-panel ${isOpen ? 'open' : ''}`}>
        {/* Header */}
        <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid #F3F4F6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1F2937', margin: 0 }}>Minhas Medicacoes</h2>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setShowForm(true)} style={{ padding: '6px 14px', borderRadius: 8, border: 'none', background: '#7C3AED', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>+ Adicionar</button>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', fontSize: 20, padding: 4 }}>✕</button>
          </div>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
          {loading && <p style={{ color: '#9CA3AF', fontSize: 13 }}>Carregando...</p>}

          {/* Add form */}
          {showForm && (
            <div style={{ marginBottom: 16, padding: 16, background: '#F9FAFB', borderRadius: 14 }}>
              <MedicationForm onSave={handleAdd} onCancel={() => setShowForm(false)} />
            </div>
          )}

          {/* Active medications */}
          <p style={{ fontSize: 12, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>Em uso ({active.length})</p>
          {active.length === 0 && !loading && <p style={{ fontSize: 13, color: '#9CA3AF', marginBottom: 16 }}>Nenhuma medicacao ativa.</p>}
          {active.map(m => (
            <div key={m.id} style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 12, padding: 14, marginBottom: 10 }}>
              {editingId === m.id ? (
                <MedicationForm
                  initialData={{ name: m.name, category: m.category, dose: m.dose ?? '', frequency: m.frequency ?? '', startDate: m.startDate, notes: m.notes ?? '' }}
                  onSave={async (data) => { await update(m.id, data); setEditingId(null); }}
                  onCancel={() => setEditingId(null)}
                />
              ) : (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                    <div>
                      <span style={{ fontSize: 15, fontWeight: 600, color: '#1F2937' }}>{m.name}</span>
                      <span style={{ marginLeft: 8, padding: '2px 8px', borderRadius: 999, fontSize: 10, fontWeight: 600, color: '#fff', background: CATEGORY_COLORS[m.category] || '#6B7280' }}>
                        {categoryLabels[m.category]}
                      </span>
                    </div>
                  </div>
                  {(m.dose || m.frequency) && (
                    <p style={{ fontSize: 12, color: '#6B7280', margin: '0 0 4px' }}>{[m.dose, m.frequency].filter(Boolean).join(' · ')}</p>
                  )}
                  <p style={{ fontSize: 11, color: '#9CA3AF', margin: '0 0 8px' }}>Desde {formatBR(m.startDate)}</p>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => setEditingId(m.id)} style={{ fontSize: 12, color: '#7C3AED', background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>Editar</button>
                    {confirmId === m.id ? (
                      <>
                        <span style={{ fontSize: 11, color: '#6B7280' }}>Tem certeza?</span>
                        <button onClick={() => handleDiscontinue(m.id)} style={{ fontSize: 12, color: '#DC2626', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}>Confirmar</button>
                        <button onClick={() => setConfirmId(null)} style={{ fontSize: 12, color: '#6B7280', background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>Cancelar</button>
                      </>
                    ) : (
                      <button onClick={() => setConfirmId(m.id)} style={{ fontSize: 12, color: '#DC2626', background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>Descontinuar</button>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}

          {/* History */}
          {inactive.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <button onClick={() => setShowHistory(!showHistory)} style={{ fontSize: 13, color: '#7C3AED', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500, fontFamily: "'DM Sans', sans-serif", display: 'flex', alignItems: 'center', gap: 4 }}>
                {showHistory ? '▾' : '▸'} Ver medicacoes anteriores ({inactive.length})
              </button>
              {showHistory && inactive.map(m => (
                <div key={m.id} style={{ background: '#F9FAFB', borderRadius: 10, padding: 12, marginTop: 8, opacity: 0.6 }}>
                  <span style={{ fontSize: 14, fontWeight: 500, color: '#374151' }}>{m.name}</span>
                  <span style={{ marginLeft: 6, fontSize: 10, color: '#9CA3AF' }}>{categoryLabels[m.category]}</span>
                  <p style={{ fontSize: 11, color: '#9CA3AF', margin: '4px 0 0' }}>De {formatBR(m.startDate)} ate {formatBR(m.endDate)}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '12px 20px', borderTop: '1px solid #F3F4F6' }}>
          <p style={{ fontSize: 11, color: '#9CA3AF', margin: 0, lineHeight: 1.5 }}>
            O registro de medicacoes ajuda a correlacionar seu historico de saude com mudancas no ciclo e humor.
          </p>
        </div>
      </div>
    </>
  );
}
