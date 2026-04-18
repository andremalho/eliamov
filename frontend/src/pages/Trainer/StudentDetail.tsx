import React, { useEffect, useState } from 'react';
import { trainerApi, TrainerStudent, StudentWorkout, StudentProgress, Prescription } from '../../services/trainer.api';
import { formatBR, formatDateTimeBR } from '../../utils/format';
import { ArrowLeft } from 'lucide-react';
import WorkoutComment from './WorkoutComment';

interface StudentDetailProps {
  student: TrainerStudent;
  onBack: () => void;
}

type Tab = 'histórico' | 'prescrições' | 'progresso';

const formatDuration = (seconds: number): string => {
  const mins = Math.round(seconds / 60);
  if (mins < 60) return `${mins}min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}h ${m}min` : `${h}h`;
};

const getInitials = (name: string) =>
  name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');

const statusColors: Record<string, { bg: string; color: string; label: string }> = {
  pending: { bg: '#F3F4F6', color: '#6B7280', label: 'Pendente' },
  done: { bg: '#F0FDF4', color: '#166534', label: 'Concluido' },
  skipped: { bg: '#FEF2F2', color: '#991B1B', label: 'Pulado' },
};

const s = {
  screen: {
    minHeight: '100vh',
    background: '#F3F4F6',
    fontFamily: "'Figtree', sans-serif",
    padding: '0 0 32px',
  } as React.CSSProperties,
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '20px 16px 0',
  } as React.CSSProperties,
  backBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#111827',
    padding: 4,
  } as React.CSSProperties,
  studentRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '16px 16px 0',
  } as React.CSSProperties,
  avatar: {
    width: 48,
    height: 48,
    borderRadius: '50%',
    background: '#111827',
    color: '#FFFFFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 15,
    fontWeight: 700,
    flexShrink: 0,
    fontFamily: "'Figtree', sans-serif",
  } as React.CSSProperties,
  studentName: {
    fontSize: 18,
    fontWeight: 700,
    color: '#111827',
  } as React.CSSProperties,
  tabs: {
    display: 'flex',
    gap: 0,
    margin: '20px 16px 0',
    background: '#FFFFFF',
    borderRadius: 10,
    overflow: 'hidden',
    border: '1px solid #E5E7EB',
  } as React.CSSProperties,
  tab: (active: boolean) =>
    ({
      flex: 1,
      padding: '10px 0',
      textAlign: 'center' as const,
      fontSize: 13,
      fontWeight: 600,
      fontFamily: "'Figtree', sans-serif",
      border: 'none',
      cursor: 'pointer',
      background: active ? '#4C1D95' : '#FFFFFF',
      color: active ? '#FFFFFF' : '#6B7280',
      transition: 'all 0.15s',
    }) as React.CSSProperties,
  content: {
    padding: '16px 16px 0',
  } as React.CSSProperties,
  card: {
    background: '#FFFFFF',
    border: '1px solid #E5E7EB',
    borderRadius: 12,
    padding: '14px 16px',
    marginBottom: 8,
  } as React.CSSProperties,
  workoutTitle: {
    fontSize: 15,
    fontWeight: 600,
    color: '#111827',
  } as React.CSSProperties,
  workoutMeta: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
  } as React.CSSProperties,
  typeBadge: {
    display: 'inline-block',
    padding: '2px 8px',
    borderRadius: 6,
    background: '#F3F4F6',
    color: '#374151',
    fontSize: 11,
    fontWeight: 600,
    marginRight: 8,
  } as React.CSSProperties,
  commentBtn: {
    marginTop: 8,
    background: 'none',
    border: '1px solid #E5E7EB',
    borderRadius: 8,
    padding: '6px 12px',
    fontSize: 12,
    fontWeight: 600,
    color: '#4C1D95',
    cursor: 'pointer',
    fontFamily: "'Figtree', sans-serif",
  } as React.CSSProperties,
  statusBadge: (status: string) => {
    const c = statusColors[status] || statusColors.pending;
    return {
      display: 'inline-block',
      padding: '2px 10px',
      borderRadius: 6,
      background: c.bg,
      color: c.color,
      fontSize: 11,
      fontWeight: 600,
    } as React.CSSProperties;
  },
  newPrescBtn: {
    width: '100%',
    padding: '12px 0',
    background: '#4C1D95',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: 10,
    fontSize: 14,
    fontWeight: 700,
    fontFamily: "'Figtree', sans-serif",
    cursor: 'pointer',
    marginTop: 12,
  } as React.CSSProperties,
  muted: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center' as const,
    padding: '24px 0',
    fontFamily: "'Figtree', sans-serif",
  } as React.CSSProperties,
  mutedCard: {
    background: '#FFFFFF',
    border: '1px solid #E5E7EB',
    borderRadius: 12,
    padding: '24px 16px',
    textAlign: 'center' as const,
    fontSize: 14,
    color: '#9CA3AF',
  } as React.CSSProperties,
  progressRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '6px 0',
    fontSize: 14,
    color: '#111827',
    borderBottom: '1px solid #F3F4F6',
  } as React.CSSProperties,
  progressLabel: {
    fontWeight: 600,
    color: '#374151',
  } as React.CSSProperties,
  weightEntry: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '10px 0',
    borderBottom: '1px solid #F3F4F6',
    fontSize: 14,
  } as React.CSSProperties,
  sectionSubtitle: {
    fontSize: 14,
    fontWeight: 700,
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  } as React.CSSProperties,
  loading: {
    textAlign: 'center' as const,
    padding: '32px 0',
    fontSize: 14,
    color: '#9CA3AF',
  } as React.CSSProperties,
};

const StudentDetail: React.FC<StudentDetailProps> = ({ student, onBack }) => {
  const [activeTab, setActiveTab] = useState<Tab>('histórico');
  const [workouts, setWorkouts] = useState<StudentWorkout[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [progress, setProgress] = useState<StudentProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [commentingId, setCommentingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const promises: Promise<any>[] = [
          trainerApi.studentWorkouts(student.id),
          trainerApi.prescriptions(),
        ];
        if (student.permissions.viewProgress) {
          promises.push(trainerApi.studentProgress(student.id));
        }
        const results = await Promise.all(promises);
        if (cancelled) return;
        setWorkouts(results[0]);
        const allPrescriptions: Prescription[] = results[1];
        setPrescriptions(allPrescriptions.filter((p) => p.studentId === student.id));
        if (student.permissions.viewProgress && results[2]) {
          setProgress(results[2]);
        }
      } catch {
        // silent
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [student.id, student.permissions.viewProgress]);

  return (
    <div style={s.screen}>
      <div style={s.header}>
        <button style={s.backBtn} onClick={onBack}>
          <ArrowLeft size={22} />
        </button>
        <span style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>Detalhes da aluna</span>
      </div>

      <div style={s.studentRow}>
        <div style={s.avatar}>{getInitials(student.name)}</div>
        <div style={s.studentName}>{student.name}</div>
      </div>

      <div style={s.tabs}>
        {(['histórico', 'prescrições', 'progresso'] as Tab[]).map((tab) => (
          <button key={tab} style={s.tab(activeTab === tab)} onClick={() => setActiveTab(tab)}>
            {tab === 'histórico' ? 'Histórico' : tab === 'prescrições' ? 'Prescrições' : 'Progresso'}
          </button>
        ))}
      </div>

      <div style={s.content}>
        {loading && <p style={s.loading}>Carregando...</p>}

        {/* Histórico tab */}
        {!loading && activeTab === 'histórico' && (
          <>
            {workouts.length === 0 && <p style={s.muted}>Nenhum treino registrado.</p>}
            {workouts.map((w) => (
              <div key={w.id} style={s.card}>
                <div style={s.workoutTitle}>{w.title}</div>
                <div style={s.workoutMeta}>
                  <span style={s.typeBadge}>{w.type}</span>
                  {formatDuration(w.duration)} &middot; {formatDateTimeBR(w.startedAt)}
                </div>
                <button
                  style={s.commentBtn}
                  onClick={() => setCommentingId(commentingId === w.id ? null : w.id)}
                >
                  Comentar
                </button>
                {commentingId === w.id && (
                  <WorkoutComment
                    studentId={student.id}
                    workoutId={w.id}
                    onCommented={() => setCommentingId(null)}
                  />
                )}
              </div>
            ))}
          </>
        )}

        {/* Prescrições tab */}
        {!loading && activeTab === 'prescrições' && (
          <>
            {prescriptions.length === 0 && <p style={s.muted}>Nenhuma prescrição encontrada.</p>}
            {prescriptions.map((p) => (
              <div key={p.id} style={s.card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={s.workoutTitle}>{p.title}</div>
                  <span style={s.statusBadge(p.status)}>
                    {statusColors[p.status]?.label ?? p.status}
                  </span>
                </div>
                <div style={s.workoutMeta}>{formatBR(p.createdAt)}</div>
                {p.notes && (
                  <div style={{ fontSize: 13, color: '#6B7280', marginTop: 6 }}>{p.notes}</div>
                )}
              </div>
            ))}
          </>
        )}

        {/* Progresso tab */}
        {!loading && activeTab === 'progresso' && (
          <>
            {student.permissions.viewProgress ? (
              <>
                <div style={s.card}>
                  <div style={s.progressRow}>
                    <span style={s.progressLabel}>Peso atual</span>
                    <span>{progress?.currentWeight ? `${progress.currentWeight} kg` : '--'}</span>
                  </div>
                  <div style={{ ...s.progressRow, borderBottom: 'none' }}>
                    <span style={s.progressLabel}>Altura</span>
                    <span>{progress?.currentHeight ? `${progress.currentHeight} cm` : '--'}</span>
                  </div>
                </div>

                {progress && progress.weightHistory.length > 0 && (
                  <>
                    <div style={s.sectionSubtitle}>Histórico de peso</div>
                    <div style={s.card}>
                      {progress.weightHistory.map((entry) => (
                        <div key={entry.id} style={s.weightEntry}>
                          <span>{formatBR(entry.date)}</span>
                          <span style={{ fontWeight: 600 }}>{entry.weight} kg</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div style={s.mutedCard}>
                A aluna não compartilhou estas informações
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default StudentDetail;
