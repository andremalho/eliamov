import React, { useEffect, useState } from 'react';
import {
  trainerApi,
  TrainerDashboardData as DashboardData,
  TrainerStudent,
  StudentWorkout,
  StudentProgress,
} from '../services/trainer.api';
import Layout from '../components/Layout';
import { formatBR, formatDateTimeBR } from '../utils/format';

const formatDuration = (seconds: number): string => {
  const mins = Math.round(seconds / 60);
  if (mins < 60) return `${mins}min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}h ${m}min` : `${h}h`;
};

type Tab = 'workouts' | 'progress' | 'prescribe';

const TrainerDashboard: React.FC = () => {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Student detail state
  const [selectedStudent, setSelectedStudent] = useState<TrainerStudent | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('workouts');
  const [workouts, setWorkouts] = useState<StudentWorkout[]>([]);
  const [progress, setProgress] = useState<StudentProgress | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Comment state
  const [commentingWorkoutId, setCommentingWorkoutId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [sendingComment, setSendingComment] = useState(false);

  // Prescribe state
  const [prescribeTitle, setPrescribeTitle] = useState('');
  const [prescribeNotes, setPrescribeNotes] = useState('');
  const [sendingPrescription, setSendingPrescription] = useState(false);
  const [prescriptionSuccess, setPrescriptionSuccess] = useState('');

  useEffect(() => {
    trainerApi
      .dashboard()
      .then(setDashboard)
      .catch(() => setError('Erro ao carregar painel.'))
      .finally(() => setLoading(false));
  }, []);

  const openStudent = async (student: TrainerStudent) => {
    setSelectedStudent(student);
    setActiveTab('workouts');
    setLoadingDetail(true);
    try {
      const [w, p] = await Promise.all([
        trainerApi.studentWorkouts(student.id),
        trainerApi.studentProgress(student.id),
      ]);
      setWorkouts(w);
      setProgress(p);
    } catch {
      setWorkouts([]);
      setProgress(null);
    } finally {
      setLoadingDetail(false);
    }
  };

  const closeStudent = () => {
    setSelectedStudent(null);
    setWorkouts([]);
    setProgress(null);
    setCommentingWorkoutId(null);
    setCommentText('');
    setPrescribeTitle('');
    setPrescribeNotes('');
    setPrescriptionSuccess('');
  };

  const handleComment = async (workoutId: string) => {
    if (!commentText.trim() || !selectedStudent) return;
    setSendingComment(true);
    try {
      await trainerApi.commentWorkout(selectedStudent.id, {
        workoutId,
        comment: commentText.trim(),
      });
      setCommentText('');
      setCommentingWorkoutId(null);
    } catch {
      // silent
    } finally {
      setSendingComment(false);
    }
  };

  const handlePrescribe = async () => {
    if (!prescribeTitle.trim() || !selectedStudent) return;
    setSendingPrescription(true);
    setPrescriptionSuccess('');
    try {
      await trainerApi.prescribe(selectedStudent.id, {
        title: prescribeTitle.trim(),
        notes: prescribeNotes.trim() || undefined,
      });
      setPrescribeTitle('');
      setPrescribeNotes('');
      setPrescriptionSuccess('Prescrição enviada com sucesso.');
    } catch {
      setPrescriptionSuccess('Erro ao enviar prescrição.');
    } finally {
      setSendingPrescription(false);
    }
  };

  const initials = (name: string) =>
    name
      .split(' ')
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() ?? '')
      .join('');

  // ── Student detail view ──────────────────────────────────────
  if (selectedStudent) {
    return (
      <Layout title="Painel do Trainer">
        <button className="trainer-back-btn" onClick={closeStudent}>
          &larr; Voltar
        </button>

        <div className="trainer-student-row" style={{ cursor: 'default', marginBottom: 16 }}>
          <div className="trainer-avatar">
            {selectedStudent.avatarUrl ? (
              <img src={selectedStudent.avatarUrl} alt={selectedStudent.name} />
            ) : (
              initials(selectedStudent.name)
            )}
          </div>
          <div className="trainer-student-name">{selectedStudent.name}</div>
        </div>

        <div className="trainer-tabs">
          <button
            className={`trainer-tab ${activeTab === 'workouts' ? 'active' : ''}`}
            onClick={() => setActiveTab('workouts')}
          >
            Treinos
          </button>
          <button
            className={`trainer-tab ${activeTab === 'progress' ? 'active' : ''}`}
            onClick={() => setActiveTab('progress')}
          >
            Progresso
          </button>
          <button
            className={`trainer-tab ${activeTab === 'prescribe' ? 'active' : ''}`}
            onClick={() => setActiveTab('prescribe')}
          >
            Prescrever
          </button>
        </div>

        {loadingDetail && <p className="muted">Carregando...</p>}

        {/* ── Treinos tab ── */}
        {!loadingDetail && activeTab === 'workouts' && (
          <div>
            {workouts.length === 0 && <p className="muted">Nenhum treino registrado.</p>}
            {workouts.map((w) => (
              <div key={w.id}>
                <div className="trainer-workout-item">
                  <div className="trainer-workout-info">
                    <div className="trainer-workout-title">{w.title}</div>
                    <div className="trainer-workout-meta">
                      {w.type} &middot; {formatDuration(w.duration)} &middot;{' '}
                      {formatDateTimeBR(w.startedAt)}
                    </div>
                  </div>
                  <button
                    className="btn btn-sm"
                    style={{ fontSize: 12, padding: '4px 10px' }}
                    onClick={() =>
                      setCommentingWorkoutId(commentingWorkoutId === w.id ? null : w.id)
                    }
                  >
                    Comentar
                  </button>
                </div>
                {commentingWorkoutId === w.id && (
                  <div style={{ padding: '8px 0 12px' }}>
                    <textarea
                      className="input"
                      rows={2}
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Escreva um comentario..."
                      style={{ marginBottom: 8, width: '100%' }}
                    />
                    <button
                      className="btn btn-primary"
                      disabled={sendingComment || !commentText.trim()}
                      onClick={() => handleComment(w.id)}
                      style={{ fontSize: 13 }}
                    >
                      {sendingComment ? 'Enviando...' : 'Enviar'}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── Progresso tab ── */}
        {!loadingDetail && activeTab === 'progress' && progress && (
          <div>
            <div className="card" style={{ marginBottom: 16 }}>
              <p>
                <strong>Peso atual:</strong> {progress.currentWeight ? `${progress.currentWeight} kg` : '--'}
              </p>
              <p>
                <strong>Altura:</strong> {progress.currentHeight ? `${progress.currentHeight} cm` : '--'}
              </p>
              <p>
                <strong>Nivel:</strong> {progress.fitnessLevel ?? '--'}
              </p>
              <p>
                <strong>Objetivo:</strong> {progress.fitnessGoal ?? '--'}
              </p>
            </div>

            {progress.weightHistory.length > 0 && (
              <>
                <h4 style={{ color: '#334e68', marginBottom: 8 }}>Histórico de peso</h4>
                {progress.weightHistory.map((entry) => (
                  <div key={entry.id} className="trainer-workout-item">
                    <div className="trainer-workout-info">
                      <div className="trainer-workout-title">{entry.weight} kg</div>
                      <div className="trainer-workout-meta">
                        {formatBR(entry.date)}
                        {entry.waist != null && ` | Cintura: ${entry.waist} cm`}
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        )}

        {!loadingDetail && activeTab === 'progress' && !progress && (
          <p className="muted">Sem dados de progresso.</p>
        )}

        {/* ── Prescrever tab ── */}
        {!loadingDetail && activeTab === 'prescribe' && (
          <div>
            <label className="label">Titulo</label>
            <input
              className="input"
              value={prescribeTitle}
              onChange={(e) => setPrescribeTitle(e.target.value)}
              placeholder="Ex: Treino de forca - Semana 1"
              style={{ marginBottom: 12, width: '100%' }}
            />

            <label className="label">Notas</label>
            <textarea
              className="input"
              rows={4}
              value={prescribeNotes}
              onChange={(e) => setPrescribeNotes(e.target.value)}
              placeholder="Orientações para a aluna..."
              style={{ marginBottom: 12, width: '100%' }}
            />

            <button
              className="btn btn-primary"
              disabled={sendingPrescription || !prescribeTitle.trim()}
              onClick={handlePrescribe}
            >
              {sendingPrescription ? 'Enviando...' : 'Enviar'}
            </button>

            {prescriptionSuccess && (
              <p className="muted" style={{ marginTop: 8 }}>
                {prescriptionSuccess}
              </p>
            )}
          </div>
        )}
      </Layout>
    );
  }

  // ── Dashboard view ───────────────────────────────────────────
  return (
    <Layout title="Painel do Trainer">
      {loading && <p className="muted">Carregando...</p>}
      {error && <p className="error-box">{error}</p>}

      {dashboard && (
        <>
          <div className="trainer-summary">
            <div className="trainer-stat">
              <div className="trainer-stat-value">{dashboard.totalStudents}</div>
              <div className="trainer-stat-label">Total alunas</div>
            </div>
            <div className="trainer-stat">
              <div className="trainer-stat-value">{dashboard.prescriptionsThisWeek}</div>
              <div className="trainer-stat-label">Prescritos esta semana</div>
            </div>
            <div className="trainer-stat">
              <div className="trainer-stat-value">{dashboard.activeToday}</div>
              <div className="trainer-stat-label">Ativas hoje</div>
            </div>
          </div>

          {dashboard.students.length === 0 && (
            <p className="muted">Nenhuma aluna vinculada.</p>
          )}

          {dashboard.students.map((s) => (
            <div
              key={s.id}
              className="trainer-student-row"
              onClick={() => openStudent(s)}
            >
              <div className="trainer-avatar">
                {s.avatarUrl ? (
                  <img src={s.avatarUrl} alt={s.name} />
                ) : (
                  initials(s.name)
                )}
              </div>
              <div className="trainer-student-name">{s.name}</div>
              <span style={{ color: '#627d98', fontSize: 18 }}>&rsaquo;</span>
            </div>
          ))}
        </>
      )}
    </Layout>
  );
};

export default TrainerDashboard;
