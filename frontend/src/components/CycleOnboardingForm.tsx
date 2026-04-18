import React, { useState } from 'react';
import api from '../services/api';
import { MedicationForm } from './MedicationForm';
import { medicationsApi, Medication, CreateMedicationInput } from '../services/medications.api';

type AmenorrheaReason = 'hormonal_iud' | 'continuous_pill' | 'surgery' | 'other' | null;
type IudType = 'mirena' | 'kyleena' | null;
type SurgeryType = 'subtotal_hysterectomy' | 'total_hysterectomy' | 'total_hysterectomy_oophorectomy' | 'other_surgery' | null;

const S = {
  card: {
    background: '#FDFAF3',
    border: '1px solid rgba(20,22,31,0.08)',
    padding: 22,
    marginBottom: 16,
    fontFamily: "'Figtree', sans-serif",
    color: '#14161F',
  } as React.CSSProperties,
  title: {
    fontFamily: "'Fraunces', serif",
    fontSize: 22,
    fontWeight: 450,
    letterSpacing: '-0.02em',
    color: '#14161F',
    marginBottom: 18,
    lineHeight: 1.15,
  } as React.CSSProperties,
  label: {
    fontFamily: "'Figtree', sans-serif",
    fontSize: 11,
    fontWeight: 600,
    color: 'rgba(20,22,31,0.6)',
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    display: 'block',
    marginBottom: 8,
  } as React.CSSProperties,
  input: {
    width: '100%',
    padding: '12px 14px',
    border: '1px solid rgba(20,22,31,0.12)',
    borderRadius: 2,
    fontSize: 13.5,
    outline: 'none',
    boxSizing: 'border-box' as const,
    background: '#FFFCF5',
    color: '#14161F',
    fontFamily: "'Figtree', sans-serif",
    transition: 'border-color 0.25s',
  },
  btnPrimary: {
    width: '100%',
    padding: 16,
    background: '#14161F',
    color: '#F5EFE6',
    border: 'none',
    borderRadius: 2,
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    cursor: 'pointer',
    fontFamily: "'Figtree', sans-serif",
    transition: 'background 0.3s',
  } as React.CSSProperties,
  btnSecondary: {
    width: '100%',
    padding: 16,
    background: 'transparent',
    color: '#14161F',
    border: '1px solid rgba(20,22,31,0.14)',
    borderRadius: 2,
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    cursor: 'pointer',
    fontFamily: "'Figtree', sans-serif",
    transition: 'border-color 0.25s',
  } as React.CSSProperties,
  optionCard: (selected: boolean) => ({
    padding: '14px 18px',
    border: selected ? '1px solid #14161F' : '1px solid rgba(20,22,31,0.12)',
    background: selected ? '#14161F' : 'transparent',
    cursor: 'pointer',
    fontSize: 14,
    color: selected ? '#F5EFE6' : '#14161F',
    fontWeight: selected ? 500 : 400,
    transition: 'all 0.25s cubic-bezier(0.16,1,0.3,1)',
    marginBottom: 8,
    fontFamily: "'Figtree', sans-serif",
  }) as React.CSSProperties,
  radioLabel: { fontSize: 13, color: 'rgba(20,22,31,0.78)', lineHeight: 1.5 },
  error: {
    color: '#8B3A2F',
    fontSize: 12.5,
    marginTop: 10,
    padding: '10px 14px',
    background: 'rgba(139,58,47,0.06)',
    borderLeft: '2px solid #8B3A2F',
  },
  success: {
    background: 'rgba(156,168,154,0.1)',
    borderLeft: '2px solid #9CA89A',
    color: '#5B6B5C',
    padding: '10px 14px',
    fontSize: 13,
    marginTop: 10,
  },
};

const today = () => new Date().toISOString().slice(0, 10);

export function CycleOnboardingForm({ onSuccess }: { onSuccess: () => void }) {
  const [menstruates, setMenstruates] = useState<boolean | null>(null);
  const [startDate, setStartDate] = useState(today());
  const [cycleLength, setCycleLength] = useState(28);
  const [periodLength, setPeriodLength] = useState(5);
  const [amenorrheaReason, setAmenorrheaReason] = useState<AmenorrheaReason>(null);
  const [iudType, setIudType] = useState<IudType>(null);
  const [continuousPillName, setContinuousPillName] = useState('');
  const [surgeryType, setSurgeryType] = useState<SurgeryType>(null);
  const [surgeryOtherDescription, setSurgeryOtherDescription] = useState('');
  const [amenorrheaOtherDescription, setAmenorrheaOtherDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'cycle' | 'medications'>('cycle');
  const [showMedForm, setShowMedForm] = useState(false);
  const [addedMeds, setAddedMeds] = useState<Medication[]>([]);

  const handleSubmit = async () => {
    setError(null);
    setSubmitting(true);
    try {
      if (menstruates) {
        await api.post('/cycle', { startDate, cycleLength, periodLength, menstruates: true });
      } else {
        await api.post('/cycle', {
          startDate: today(),
          menstruates: false,
          amenorrheaReason,
          iudType: amenorrheaReason === 'hormonal_iud' ? iudType : null,
          continuousPillName: amenorrheaReason === 'continuous_pill' ? continuousPillName : null,
          surgeryType: amenorrheaReason === 'surgery' ? surgeryType : null,
          surgeryOtherDescription: surgeryType === 'other_surgery' ? surgeryOtherDescription : null,
          amenorrheaOtherDescription: amenorrheaReason === 'other' ? amenorrheaOtherDescription : null,
        });
      }
      setStep('medications');
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Falha ao registrar.');
    } finally {
      setSubmitting(false);
    }
  };

  // Medications step
  if (step === 'medications') {
    const handleAddMed = async (data: CreateMedicationInput) => {
      const created = await medicationsApi.create(data);
      setAddedMeds(prev => [...prev, created]);
      setShowMedForm(false);
    };

    return (
      <div style={S.card}>
        {/* Progress */}
        <div style={{ height: 4, background: '#E5E7EB', borderRadius: 2, marginBottom: 16, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: '80%', background: '#14161F', borderRadius: 0 }} />
        </div>
        <div style={S.title}>Você usa alguma medicação atualmente?</div>

        {!showMedForm && addedMeds.length === 0 && (
          <div style={{ display: 'flex', gap: 10 }}>
            <button style={S.btnPrimary} onClick={() => setShowMedForm(true)}>Sim</button>
            <button style={S.btnSecondary} onClick={onSuccess}>Não, pular</button>
          </div>
        )}

        {showMedForm && (
          <div style={{ marginBottom: 16 }}>
            <MedicationForm onSave={handleAddMed} onCancel={() => setShowMedForm(false)} />
          </div>
        )}

        {addedMeds.length > 0 && (
          <>
            <div style={{ marginBottom: 12 }}>
              {addedMeds.map((m, i) => (
                <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: '#F9FAFB', borderRadius: 8, marginBottom: 6, fontSize: 13 }}>
                  <span style={{ fontWeight: 500, color: '#1F2937' }}>{m.name} {m.dose ? `(${m.dose})` : ''}</span>
                  <button onClick={() => setAddedMeds(prev => prev.filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', color: '#DC2626', cursor: 'pointer', fontSize: 12 }}>Remover</button>
                </div>
              ))}
            </div>
            {!showMedForm && (
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => setShowMedForm(true)} style={{ ...S.btnSecondary, width: 'auto', padding: '8px 14px', fontSize: 13 }}>+ Adicionar outra</button>
                <button style={S.btnPrimary} onClick={onSuccess}>Continuar</button>
              </div>
            )}
          </>
        )}
      </div>
    );
  }

  // Step 1: Ask if menstruating
  if (menstruates === null) {
    return (
      <div style={S.card}>
        <div style={S.title}>Você menstrua atualmente?</div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button style={S.btnPrimary} onClick={() => setMenstruates(true)}>Sim</button>
          <button style={S.btnSecondary} onClick={() => setMenstruates(false)}>Não</button>
        </div>
      </div>
    );
  }

  // Step 2a: Normal cycle form
  if (menstruates) {
    return (
      <div style={S.card}>
        <div style={S.title}>Registrar ciclo</div>
        <div style={{ marginBottom: 12 }}>
          <label style={S.label}>Data de inicio da última menstruação</label>
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={S.input} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
          <div>
            <label style={S.label}>Duração do ciclo (dias)</label>
            <input type="number" min={20} max={45} value={cycleLength} onChange={e => setCycleLength(Number(e.target.value))} style={S.input} />
          </div>
          <div>
            <label style={S.label}>Duração do período (dias)</label>
            <input type="number" min={1} max={15} value={periodLength} onChange={e => setPeriodLength(Number(e.target.value))} style={S.input} />
          </div>
        </div>
        {error && <p style={S.error}>{error}</p>}
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={{ ...S.btnSecondary, width: 'auto', padding: '10px 16px' }} onClick={() => setMenstruates(null)}>Voltar</button>
          <button style={S.btnPrimary} onClick={handleSubmit} disabled={submitting}>{submitting ? 'Salvando...' : 'Registrar'}</button>
        </div>
      </div>
    );
  }

  // Step 2b: Amenorrhea form
  const REASONS: { value: AmenorrheaReason; label: string }[] = [
    { value: 'hormonal_iud', label: 'DIU hormonal' },
    { value: 'continuous_pill', label: 'Anticoncepcional hormonal combinado continuo' },
    { value: 'surgery', label: 'Cirurgia uterina' },
    { value: 'other', label: 'Outro motivo' },
  ];

  const SURGERY_OPTIONS: { value: SurgeryType; label: string }[] = [
    { value: 'subtotal_hysterectomy', label: 'Histerectomia subtotal (utero parcialmente removido, ovarios preservados)' },
    { value: 'total_hysterectomy', label: 'Histerectomia total (utero totalmente removido, ovarios preservados)' },
    { value: 'total_hysterectomy_oophorectomy', label: 'Histerectomia total + ooforectomia bilateral (utero e ovarios removidos)' },
    { value: 'other_surgery', label: 'Outro procedimento' },
  ];

  const canSubmit = amenorrheaReason && (
    (amenorrheaReason === 'hormonal_iud' && iudType) ||
    (amenorrheaReason === 'continuous_pill' && continuousPillName.trim()) ||
    (amenorrheaReason === 'surgery' && surgeryType && (surgeryType !== 'other_surgery' || surgeryOtherDescription.trim())) ||
    (amenorrheaReason === 'other' && amenorrheaOtherDescription.trim())
  );

  return (
    <div style={S.card}>
      <div style={S.title}>Motivo da ausencia de menstruação</div>

      {REASONS.map(r => (
        <div key={r.value} style={S.optionCard(amenorrheaReason === r.value)} onClick={() => { setAmenorrheaReason(r.value); setIudType(null); setSurgeryType(null); }}>
          {r.label}
        </div>
      ))}

      {/* DIU sub-options */}
      {amenorrheaReason === 'hormonal_iud' && (
        <div style={{ padding: '12px 0 0 16px' }}>
          <label style={S.label}>Tipo de DIU</label>
          <div style={{ display: 'flex', gap: 8 }}>
            {(['mirena', 'kyleena'] as IudType[]).map(t => (
              <div key={t} style={S.optionCard(iudType === t)} onClick={() => setIudType(t)}>
                {t === 'mirena' ? 'Mirena' : 'Kyleena'}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pill sub-option */}
      {amenorrheaReason === 'continuous_pill' && (
        <div style={{ padding: '12px 0 0 16px' }}>
          <label style={S.label}>Qual metodo você usa?</label>
          <input type="text" value={continuousPillName} onChange={e => setContinuousPillName(e.target.value)} placeholder="Nome do medicamento" style={S.input} />
        </div>
      )}

      {/* Surgery sub-options */}
      {amenorrheaReason === 'surgery' && (
        <div style={{ padding: '12px 0 0 16px' }}>
          <label style={S.label}>Tipo de cirurgia</label>
          {SURGERY_OPTIONS.map(s => (
            <div key={s.value} style={S.optionCard(surgeryType === s.value)} onClick={() => setSurgeryType(s.value)}>
              <span style={S.radioLabel}>{s.label}</span>
            </div>
          ))}
          {surgeryType === 'other_surgery' && (
            <div style={{ marginTop: 8 }}>
              <input type="text" value={surgeryOtherDescription} onChange={e => setSurgeryOtherDescription(e.target.value)} placeholder="Descreva o procedimento" style={S.input} />
            </div>
          )}
        </div>
      )}

      {/* Other reason */}
      {amenorrheaReason === 'other' && (
        <div style={{ padding: '12px 0 0 16px' }}>
          <label style={S.label}>Descreva o motivo</label>
          <input type="text" value={amenorrheaOtherDescription} onChange={e => setAmenorrheaOtherDescription(e.target.value)} placeholder="Motivo da ausencia de menstruação" style={S.input} />
        </div>
      )}

      {error && <p style={S.error}>{error}</p>}

      <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
        <button style={{ ...S.btnSecondary, width: 'auto', padding: '10px 16px' }} onClick={() => setMenstruates(null)}>Voltar</button>
        <button style={S.btnPrimary} onClick={handleSubmit} disabled={submitting || !canSubmit}>{submitting ? 'Salvando...' : 'Registrar'}</button>
      </div>
    </div>
  );
}
