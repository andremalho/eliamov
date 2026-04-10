import React from 'react';
import { TrainerStudent } from '../../services/trainer.api';
import { ChevronRight } from 'lucide-react';

interface StudentListProps {
  students: TrainerStudent[];
  onSelect: (s: TrainerStudent) => void;
}

const getInitials = (name: string) =>
  name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');

const styles = {
  section: {
    marginTop: 24,
    fontFamily: "'DM Sans', sans-serif",
  } as React.CSSProperties,
  sectionTitle: {
    fontSize: 16,
    fontWeight: 700,
    color: '#111827',
    marginBottom: 12,
    fontFamily: "'DM Sans', sans-serif",
  } as React.CSSProperties,
  card: {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    background: '#FFFFFF',
    border: '1px solid #E5E7EB',
    borderRadius: 12,
    padding: '12px 14px',
    marginBottom: 8,
    cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif",
    textAlign: 'left' as const,
  } as React.CSSProperties,
  avatar: {
    width: 44,
    height: 44,
    borderRadius: '50%',
    background: '#111827',
    color: '#FFFFFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 14,
    fontWeight: 700,
    flexShrink: 0,
    fontFamily: "'DM Sans', sans-serif",
  } as React.CSSProperties,
  info: {
    flex: 1,
    marginLeft: 12,
  } as React.CSSProperties,
  name: {
    fontSize: 15,
    fontWeight: 600,
    color: '#111827',
  } as React.CSSProperties,
  statusRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
    fontSize: 13,
    color: '#6B7280',
  } as React.CSSProperties,
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: '50%',
    background: '#22C55E',
    flexShrink: 0,
  } as React.CSSProperties,
  chevron: {
    color: '#9CA3AF',
    flexShrink: 0,
  } as React.CSSProperties,
  empty: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center' as const,
    padding: '24px 0',
    fontFamily: "'DM Sans', sans-serif",
  } as React.CSSProperties,
};

const StudentList: React.FC<StudentListProps> = ({ students, onSelect }) => {
  return (
    <div style={styles.section}>
      <h2 style={styles.sectionTitle}>Suas alunas ({students.length})</h2>
      {students.length === 0 && (
        <p style={styles.empty}>Nenhuma aluna vinculada.</p>
      )}
      {students.map((s) => (
        <button key={s.id} style={styles.card} onClick={() => onSelect(s)}>
          <div style={styles.avatar}>{getInitials(s.name)}</div>
          <div style={styles.info}>
            <div style={styles.name}>{s.name}</div>
            <div style={styles.statusRow}>
              <span style={styles.statusDot} />
              Ativa
            </div>
          </div>
          <ChevronRight size={18} style={styles.chevron} />
        </button>
      ))}
    </div>
  );
};

export default StudentList;
