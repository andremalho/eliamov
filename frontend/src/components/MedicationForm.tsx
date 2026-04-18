import React, { useState } from 'react';
import { CreateMedicationInput, MedicationCategory, categoryLabels, categoryExamples } from '../services/medications.api';

const CATEGORIES: MedicationCategory[] = ['hormonal_contraceptive', 'hormonal_iud', 'thyroid', 'antidepressant', 'anxiolytic', 'progesterone', 'other'];

const S = {
  input: {
    width: '100%',
    padding: '12px 14px',
    border: '1px solid rgba(20,22,31,0.12)',
    borderRadius: 2,
    fontSize: 13.5,
    outline: 'none',
    boxSizing: 'border-box' as const,
    fontFamily: "'Figtree', sans-serif",
    background: '#FDFAF3',
    color: '#14161F',
    transition: 'border-color 0.25s',
  },
  label: {
    fontFamily: "'Figtree', sans-serif",
    fontSize: 11,
    fontWeight: 600,
    color: 'rgba(20,22,31,0.6)',
    letterSpacing: '0.14em',
    textTransform: 'uppercase' as const,
    display: 'block',
    marginBottom: 8,
  },
  catCard: (selected: boolean): React.CSSProperties => ({
    padding: '12px 10px',
    border: selected ? '1px solid #14161F' : '1px solid rgba(20,22,31,0.12)',
    background: selected ? '#14161F' : 'transparent',
    cursor: 'pointer',
    fontSize: 12.5,
    color: selected ? '#F5EFE6' : '#14161F',
    fontWeight: selected ? 600 : 500,
    transition: 'all 0.25s cubic-bezier(0.16,1,0.3,1)',
    textAlign: 'center' as const,
    fontFamily: "'Figtree', sans-serif",
    letterSpacing: '0.005em',
  }),
  error: {
    fontSize: 12,
    color: '#8B3A2F',
    marginTop: 4,
    padding: '10px 14px',
    background: 'rgba(139,58,47,0.06)',
    borderLeft: '2px solid #8B3A2F',
  },
};

interface Props {
  onSave: (data: CreateMedicationInput) => Promise<void>;
  onCancel: () => void;
  initialData?: Partial<CreateMedicationInput>;
}

export function MedicationForm({ onSave, onCancel, initialData }: Props) {
  const [category, setCategory] = useState<MedicationCategory | null>(initialData?.category as MedicationCategory ?? null);
  const [name, setName] = useState(initialData?.name ?? '');
  const [dose, setDose] = useState(initialData?.dose ?? '');
  const [frequency, setFrequency] = useState(initialData?.frequency ?? '');
  const [startDate, setStartDate] = useState(initialData?.startDate ?? new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState(initialData?.notes ?? '');
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const handleSave = async () => {
    const errs: string[] = [];
    if (!category) errs.push('Selecione uma categoria.');
    if (!name.trim()) errs.push('Informe o nome da medicação.');
    if (errs.length) { setErrors(errs); return; }
    setErrors([]);
    setSaving(true);
    try {
      await onSave({ name: name.trim(), category: category!, dose: dose || undefined, frequency: frequency || undefined, startDate, notes: notes || undefined });
    } catch { setErrors(['Erro ao salvar.']); }
    finally { setSaving(false); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <label style={S.label}>Categoria</label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {CATEGORIES.map(c => (
            <button
              type="button"
              key={c}
              style={S.catCard(category === c)}
              onClick={() => setCategory(c)}
            >
              {categoryLabels[c]}
            </button>
          ))}
        </div>
        {category && (
          <p
            style={{
              fontSize: 11,
              color: 'rgba(20,22,31,0.55)',
              marginTop: 10,
              fontFamily: "'Fraunces', serif",
              fontStyle: 'italic',
            }}
          >
            Ex: {categoryExamples[category]}
          </p>
        )}
      </div>

      <div>
        <label style={S.label}>Nome do medicamento</label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder={category ? categoryExamples[category] : 'Selecione a categoria'}
          style={S.input}
          onFocus={(e) => (e.currentTarget.style.borderColor = '#14161F')}
          onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(20,22,31,0.12)')}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <label style={S.label}>Dose</label>
          <input
            type="text"
            value={dose}
            onChange={e => setDose(e.target.value)}
            placeholder="ex: 20mg"
            style={S.input}
            onFocus={(e) => (e.currentTarget.style.borderColor = '#14161F')}
            onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(20,22,31,0.12)')}
          />
        </div>
        <div>
          <label style={S.label}>Frequência</label>
          <input
            type="text"
            value={frequency}
            onChange={e => setFrequency(e.target.value)}
            placeholder="ex: 1x ao dia"
            style={S.input}
            onFocus={(e) => (e.currentTarget.style.borderColor = '#14161F')}
            onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(20,22,31,0.12)')}
          />
        </div>
      </div>

      <div>
        <label style={S.label}>Data de início</label>
        <input
          type="date"
          value={startDate}
          onChange={e => setStartDate(e.target.value)}
          style={S.input}
          onFocus={(e) => (e.currentTarget.style.borderColor = '#14161F')}
          onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(20,22,31,0.12)')}
        />
      </div>

      <div>
        <label style={S.label}>Observações</label>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          rows={2}
          placeholder="Observações adicionais"
          style={{ ...S.input, resize: 'vertical' as const, lineHeight: 1.5 }}
          onFocus={(e) => (e.currentTarget.style.borderColor = '#14161F')}
          onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(20,22,31,0.12)')}
        />
      </div>

      {errors.length > 0 && <div style={S.error}>{errors.join(' ')}</div>}

      <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
        <button
          onClick={onCancel}
          style={{
            flex: 1,
            padding: 14,
            border: '1px solid rgba(20,22,31,0.12)',
            borderRadius: 2,
            background: 'transparent',
            cursor: 'pointer',
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: '#14161F',
            fontFamily: "'Figtree', sans-serif",
            transition: 'border-color 0.25s',
          }}
          onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.borderColor = '#14161F'}
          onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.borderColor = 'rgba(20,22,31,0.12)'}
        >
          Cancelar
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            flex: 1.5,
            padding: 14,
            border: 'none',
            borderRadius: 2,
            background: saving ? 'rgba(20,22,31,0.5)' : '#14161F',
            color: '#F5EFE6',
            cursor: saving ? 'default' : 'pointer',
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            fontFamily: "'Figtree', sans-serif",
            transition: 'background 0.3s',
          }}
          onMouseEnter={(e) => { if (!saving) (e.currentTarget as HTMLElement).style.background = '#D97757'; }}
          onMouseLeave={(e) => { if (!saving) (e.currentTarget as HTMLElement).style.background = '#14161F'; }}
        >
          {saving ? 'Salvando…' : 'Salvar medicação'}
        </button>
      </div>
    </div>
  );
}
