import React, { useState } from 'react';
import { TrainerStudent } from '../../services/trainer.api';
import { trainerApi } from '../../services/trainer.api';
import { X } from 'lucide-react';

interface PrescribeWorkoutProps {
  students: TrainerStudent[];
  onClose: () => void;
}

const styles = {
  overlay: {
    position: 'fixed' as const,
    inset: 0,
    background: 'rgba(17, 24, 39, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: 16,
    fontFamily: "'Figtree', sans-serif",
  } as React.CSSProperties,
  modal: {
    background: '#FFFFFF',
    borderRadius: 16,
    width: '100%',
    maxWidth: 440,
    maxHeight: '90vh',
    overflow: 'auto',
    padding: '24px 20px',
  } as React.CSSProperties,
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  } as React.CSSProperties,
  title: {
    fontSize: 18,
    fontWeight: 700,
    color: '#111827',
    fontFamily: "'Figtree', sans-serif",
    margin: 0,
  } as React.CSSProperties,
  closeBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#6B7280',
    padding: 4,
  } as React.CSSProperties,
  label: {
    display: 'block',
    fontSize: 13,
    fontWeight: 600,
    color: '#374151',
    marginBottom: 6,
    fontFamily: "'Figtree', sans-serif",
  } as React.CSSProperties,
  input: {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #E5E7EB',
    borderRadius: 10,
    fontSize: 14,
    fontFamily: "'Figtree', sans-serif",
    color: '#111827',
    outline: 'none',
    marginBottom: 16,
  } as React.CSSProperties,
  select: {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #E5E7EB',
    borderRadius: 10,
    fontSize: 14,
    fontFamily: "'Figtree', sans-serif",
    color: '#111827',
    outline: 'none',
    marginBottom: 16,
    background: '#FFFFFF',
  } as React.CSSProperties,
  textarea: {
    width: '100%',
    minHeight: 90,
    padding: '10px 12px',
    border: '1px solid #E5E7EB',
    borderRadius: 10,
    fontSize: 14,
    fontFamily: "'Figtree', sans-serif",
    color: '#111827',
    resize: 'vertical' as const,
    outline: 'none',
    marginBottom: 16,
  } as React.CSSProperties,
  submitBtn: {
    width: '100%',
    padding: '12px 0',
    background: '#4C1D95',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: 10,
    fontSize: 15,
    fontWeight: 700,
    fontFamily: "'Figtree', sans-serif",
    cursor: 'pointer',
  } as React.CSSProperties,
  disabledBtn: {
    opacity: 0.5,
    cursor: 'not-allowed',
  } as React.CSSProperties,
  toast: {
    marginTop: 12,
    padding: '10px 14px',
    background: '#F0FDF4',
    border: '1px solid #BBF7D0',
    borderRadius: 8,
    fontSize: 13,
    color: '#166534',
    fontFamily: "'Figtree', sans-serif",
  } as React.CSSProperties,
};

const PrescribeWorkout: React.FC<PrescribeWorkoutProps> = ({ students, onClose }) => {
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [sending, setSending] = useState(false);
  const [toast, setToast] = useState('');

  const canSubmit = selectedStudentId && title.trim() && !sending;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSending(true);
    try {
      await trainerApi.prescribe(selectedStudentId, {
        title: title.trim(),
        notes: notes.trim() || undefined,
        scheduledDates: scheduledDate ? [scheduledDate] : undefined,
      });
      const studentName = students.find((s) => s.id === selectedStudentId)?.name ?? 'A aluna';
      setToast(`Treino prescrito! ${studentName} sera notificada.`);
      setTimeout(() => onClose(), 1800);
    } catch {
      setToast('Erro ao prescrever treino.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h2 style={styles.title}>Prescrever treino</h2>
          <button style={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <label style={styles.label}>Selecionar aluna</label>
        <select
          style={styles.select}
          value={selectedStudentId}
          onChange={(e) => setSelectedStudentId(e.target.value)}
        >
          <option value="">Selecione...</option>
          {students.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>

        <label style={styles.label}>Titulo do treino</label>
        <input
          style={styles.input}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ex: Treino de forca - Semana 1"
        />

        <label style={styles.label}>Observações e instruções</label>
        <textarea
          style={styles.textarea}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Orientações para a aluna..."
        />

        <label style={styles.label}>Data agendada</label>
        <input
          style={styles.input}
          type="date"
          value={scheduledDate}
          onChange={(e) => setScheduledDate(e.target.value)}
        />

        <button
          style={{
            ...styles.submitBtn,
            ...(!canSubmit ? styles.disabledBtn : {}),
          }}
          disabled={!canSubmit}
          onClick={handleSubmit}
        >
          {sending ? 'Prescrevendo...' : 'Prescrever'}
        </button>

        {toast && <div style={styles.toast}>{toast}</div>}
      </div>
    </div>
  );
};

export default PrescribeWorkout;
