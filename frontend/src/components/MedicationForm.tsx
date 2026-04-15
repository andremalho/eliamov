import React, { useState } from 'react';
import { CreateMedicationInput, MedicationCategory, categoryLabels, categoryExamples } from '../services/medications.api';

const CATEGORIES: MedicationCategory[] = ['hormonal_contraceptive', 'hormonal_iud', 'thyroid', 'antidepressant', 'anxiolytic', 'progesterone', 'other'];

const S = {
  input: { width: '100%', padding: '10px 12px', border: '1.5px solid #E5E7EB', borderRadius: 10, fontSize: 14, outline: 'none', boxSizing: 'border-box' as const, fontFamily: "'DM Sans', sans-serif" },
  label: { fontSize: 12, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 4 } as React.CSSProperties,
  catCard: (selected: boolean) => ({
    padding: '10px 12px', borderRadius: 10, border: selected ? '2px solid #7C3AED' : '1.5px solid #E5E7EB',
    background: selected ? '#F5F3FF' : '#fff', cursor: 'pointer', fontSize: 13,
    color: selected ? '#7C3AED' : '#374151', fontWeight: selected ? 600 : 400,
    transition: 'all 0.15s', textAlign: 'center' as const,
  }),
  error: { fontSize: 12, color: '#DC2626', marginTop: 4 },
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
    if (!name.trim()) errs.push('Informe o nome da medicacao.');
    if (errs.length) { setErrors(errs); return; }
    setErrors([]);
    setSaving(true);
    try {
      await onSave({ name: name.trim(), category: category!, dose: dose || undefined, frequency: frequency || undefined, startDate, notes: notes || undefined });
    } catch { setErrors(['Erro ao salvar.']); }
    finally { setSaving(false); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div>
        <label style={S.label}>Categoria</label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {CATEGORIES.map(c => (
            <div key={c} style={S.catCard(category === c)} onClick={() => setCategory(c)}>
              {categoryLabels[c]}
            </div>
          ))}
        </div>
        {category && <p style={{ fontSize: 11, color: '#9CA3AF', marginTop: 6 }}>{categoryExamples[category]}</p>}
      </div>
      <div>
        <label style={S.label}>Nome do medicamento</label>
        <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder={category ? categoryExamples[category] : 'Selecione a categoria'} style={S.input} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div>
          <label style={S.label}>Dose (opcional)</label>
          <input type="text" value={dose} onChange={e => setDose(e.target.value)} placeholder="ex: 20mg" style={S.input} />
        </div>
        <div>
          <label style={S.label}>Frequencia (opcional)</label>
          <input type="text" value={frequency} onChange={e => setFrequency(e.target.value)} placeholder="ex: 1x ao dia" style={S.input} />
        </div>
      </div>
      <div>
        <label style={S.label}>Data de inicio</label>
        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={S.input} />
      </div>
      <div>
        <label style={S.label}>Observacoes (opcional)</label>
        <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="Observacoes adicionais" style={{ ...S.input, resize: 'vertical' as const }} />
      </div>
      {errors.length > 0 && <div style={S.error}>{errors.join(' ')}</div>}
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={onCancel} style={{ flex: 1, padding: 10, border: '1px solid #E5E7EB', borderRadius: 10, background: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 500, fontFamily: "'DM Sans', sans-serif" }}>Cancelar</button>
        <button onClick={handleSave} disabled={saving} style={{ flex: 1, padding: 10, border: 'none', borderRadius: 10, background: '#7C3AED', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600, opacity: saving ? 0.6 : 1, fontFamily: "'DM Sans', sans-serif" }}>{saving ? 'Salvando...' : 'Salvar medicacao'}</button>
      </div>
    </div>
  );
}
