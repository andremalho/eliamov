import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { trainerApi, TrainerDashboardData, TrainerStudent, Prescription } from '../../services/trainer.api';
import { Users, ClipboardCheck, Activity, MessageSquare, Plus, Bell } from 'lucide-react';
import StudentList from './StudentList';
import StudentDetail from './StudentDetail';
import PrescribeWorkout from './PrescribeWorkout';

const styles = {
  screen: {
    minHeight: '100vh',
    background: '#F3F4F6',
    fontFamily: "'DM Sans', sans-serif",
    paddingBottom: 80,
  } as React.CSSProperties,
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '24px 16px 0',
  } as React.CSSProperties,
  title: {
    fontSize: 22,
    fontWeight: 700,
    color: '#111827',
    margin: 0,
    fontFamily: "'DM Sans', sans-serif",
  } as React.CSSProperties,
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    margin: '2px 0 0',
    fontFamily: "'DM Sans', sans-serif",
  } as React.CSSProperties,
  bellBtn: {
    background: '#FFFFFF',
    border: '1px solid #E5E7EB',
    borderRadius: 10,
    width: 40,
    height: 40,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: '#111827',
  } as React.CSSProperties,
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 10,
    padding: '20px 16px 0',
  } as React.CSSProperties,
  statCard: {
    background: '#FFFFFF',
    border: '1px solid #E5E7EB',
    borderRadius: 14,
    padding: '16px 14px',
  } as React.CSSProperties,
  statIcon: {
    color: '#4C1D95',
    marginBottom: 8,
  } as React.CSSProperties,
  statValue: {
    fontSize: 26,
    fontWeight: 700,
    color: '#111827',
    fontFamily: "'DM Sans', sans-serif",
  } as React.CSSProperties,
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
    fontFamily: "'DM Sans', sans-serif",
  } as React.CSSProperties,
  listContainer: {
    padding: '0 16px',
  } as React.CSSProperties,
  fab: {
    position: 'fixed' as const,
    bottom: 24,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: '50%',
    background: '#4C1D95',
    color: '#FFFFFF',
    border: 'none',
    boxShadow: '0 4px 20px rgba(76, 29, 149, 0.35)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    zIndex: 100,
  } as React.CSSProperties,
  loading: {
    textAlign: 'center' as const,
    padding: '48px 0',
    fontSize: 14,
    color: '#9CA3AF',
    fontFamily: "'DM Sans', sans-serif",
  } as React.CSSProperties,
  error: {
    textAlign: 'center' as const,
    padding: '48px 0',
    fontSize: 14,
    color: '#991B1B',
    fontFamily: "'DM Sans', sans-serif",
  } as React.CSSProperties,
};

const TrainerPanel: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [dashboard, setDashboard] = useState<TrainerDashboardData | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<TrainerStudent | null>(null);
  const [showPrescribe, setShowPrescribe] = useState(false);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (currentUser && currentUser.role !== 'personal_trainer') {
      navigate('/home');
      return;
    }
  }, [currentUser, navigate]);

  useEffect(() => {
    trainerApi
      .dashboard()
      .then((data) => {
        setDashboard(data);
        return trainerApi.prescriptions();
      })
      .then(setPrescriptions)
      .catch(() => setError('Erro ao carregar painel.'))
      .finally(() => setLoading(false));
  }, []);

  // Pending feedback: prescriptions that are done but could use trainer follow-up
  const pendingFeedback = prescriptions.filter((p) => p.status === 'done').length;

  if (selectedStudent) {
    return (
      <StudentDetail
        student={selectedStudent}
        onBack={() => setSelectedStudent(null)}
      />
    );
  }

  return (
    <div style={styles.screen}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Painel do Personal</h1>
          <p style={styles.subtitle}>{currentUser?.name}</p>
        </div>
        <button style={styles.bellBtn}>
          <Bell size={20} />
        </button>
      </div>

      {loading && <p style={styles.loading}>Carregando...</p>}
      {error && <p style={styles.error}>{error}</p>}

      {dashboard && (
        <>
          <div style={styles.statsGrid}>
            <div style={styles.statCard}>
              <Users size={20} style={styles.statIcon} />
              <div style={styles.statValue}>{dashboard.totalStudents}</div>
              <div style={styles.statLabel}>Alunas ativas</div>
            </div>
            <div style={styles.statCard}>
              <ClipboardCheck size={20} style={styles.statIcon} />
              <div style={styles.statValue}>{dashboard.prescriptionsThisWeek}</div>
              <div style={styles.statLabel}>Prescritos esta semana</div>
            </div>
            <div style={styles.statCard}>
              <Activity size={20} style={styles.statIcon} />
              <div style={styles.statValue}>{dashboard.activeToday}</div>
              <div style={styles.statLabel}>Ativas hoje</div>
            </div>
            <div style={styles.statCard}>
              <MessageSquare size={20} style={styles.statIcon} />
              <div style={styles.statValue}>{pendingFeedback}</div>
              <div style={styles.statLabel}>Aguardando feedback</div>
            </div>
          </div>

          <div style={styles.listContainer}>
            <StudentList students={dashboard.students} onSelect={setSelectedStudent} />
          </div>

          <button style={styles.fab} onClick={() => setShowPrescribe(true)}>
            <Plus size={24} />
          </button>

          {showPrescribe && (
            <PrescribeWorkout
              students={dashboard.students}
              onClose={() => setShowPrescribe(false)}
            />
          )}
        </>
      )}
    </div>
  );
};

export default TrainerPanel;
