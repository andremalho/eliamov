import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Users,
  CalendarDays,
  CheckCheck,
  MessageSquare,
  UserPlus,
  Shield,
  Zap,
  User,
} from 'lucide-react';

/* ── mock data ───────────────────────────────────────────────── */
const mockStudents = [
  {
    initials: 'AM', name: 'Ana Martins',
    lastWorkout: 'Forca membros inferiores - ontem',
    avatarBg: '#FBEAE1', avatarText: '#5B21B6',
    status: 'today' as const,
    freq: [1, 1, 0, 1, 1, 0, 1],
    history: [
      { name: 'Forca - membros inferiores', date: 'hoje, 08:30', duration: '52 min' },
      { name: 'HIIT cardio - 30 min', date: 'ter, 07:15', duration: '31 min' },
      { name: 'Forca - membros superiores', date: 'dom, 09:00', duration: '45 min' },
    ],
  },
  {
    initials: 'CM', name: 'Camila Moura',
    lastWorkout: 'HIIT cardio - ha 2 dias',
    avatarBg: '#FEF3C7', avatarText: '#92400E',
    status: 'days2' as const,
    freq: [1, 0, 1, 0, 1, 1, 0],
    history: [
      { name: 'HIIT cardio - 30 min', date: 'seg, 06:45', duration: '30 min' },
    ],
  },
  {
    initials: 'JS', name: 'Julia Souza',
    lastWorkout: 'Mobilidade - ha 8 dias',
    avatarBg: '#FEE2E2', avatarText: '#991B1B',
    status: 'days8' as const,
    freq: [0, 1, 0, 0, 0, 0, 0],
    history: [
      { name: 'Mobilidade e alongamento', date: 'ha 8 dias', duration: '25 min' },
    ],
  },
];

type Student = (typeof mockStudents)[number];

const STATUS_BADGE: Record<string, { bg: string; text: string; label: string }> = {
  today: { bg: '#DCFCE7', text: '#166534', label: 'treinou hoje' },
  days2: { bg: '#FEF3C7', text: '#92400E', label: 'ha 2 dias' },
  days8: { bg: '#FEE2E2', text: '#991B1B', label: 'sem treino ha 8d' },
};

/* ── component ───────────────────────────────────────────────── */
export default function TrainerDashboard() {
  const [openStudent, setOpenStudent] = useState<string | null>(null);

  const toggle = (name: string) =>
    setOpenStudent((prev) => (prev === name ? null : name));

  return (
    <div style={{ maxWidth: 430, margin: '0 auto', background: '#F9FAFB', minHeight: '100vh', position: 'relative', fontFamily: "'Figtree', sans-serif" }}>

      {/* ── 1. STATUS BAR ──────────────────────────────────────── */}
      <div style={{ background: '#111827', padding: '8px 20px', display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#6B7280' }}>
        <span>{new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
        <div style={{ display: 'flex', gap: 6 }}>
          <Zap size={12} />
          <span>100%</span>
        </div>
      </div>

      {/* ── 2. HEADER ──────────────────────────────────────────── */}
      <div style={{ background: '#111827', padding: '0 20px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 500, color: '#F9FAFB' }}>
            Painel do personal
          </div>
          <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>
            Carlos M. - Academia FitZone
          </div>
        </div>
        <div style={{
          width: 38, height: 38, borderRadius: '50%', background: '#4C1D95',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#EEE7DB', fontWeight: 700, fontSize: 14,
        }}>
          CM
        </div>
      </div>

      {/* ── SCROLLABLE ─────────────────────────────────────────── */}
      <div style={{ paddingBottom: 80 }}>

        {/* ── 3. METRICS GRID ────────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, padding: '16px 20px' }}>
          {[
            { Icon: Users, color: '#14161F', value: 12, label: 'alunas ativas' },
            { Icon: CalendarDays, color: '#14161F', value: 8, label: 'treinos prescritos hoje' },
            { Icon: CheckCheck, color: '#16A34A', value: 5, label: 'completados hoje', valueColor: '#16A34A' },
            { Icon: MessageSquare, color: '#D97706', value: 3, label: 'aguardando feedback', valueColor: '#D97706' },
          ].map(({ Icon, color, value, label, valueColor }, i) => (
            <div key={i} style={{
              background: '#fff', borderRadius: 14, border: '0.5px solid #E5E7EB',
              padding: '14px 16px', boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
            }}>
              <Icon size={18} color={color} style={{ marginBottom: 8 }} />
              <div style={{ fontSize: 26, fontWeight: 700, color: valueColor ?? '#111827' }}>{value}</div>
              <div style={{ fontSize: 11, color: '#6B7280', marginTop: 2 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* ── 4. STUDENT LIST ────────────────────────────────────── */}
        <div style={{ padding: '0 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '8px 0 12px' }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>Minhas alunas</span>
            <button style={{
              display: 'flex', alignItems: 'center', gap: 4, background: 'none',
              border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: '#14161F',
            }}>
              <UserPlus size={14} />
              convidar
            </button>
          </div>
        </div>

        {mockStudents.map((student) => {
          const badge = STATUS_BADGE[student.status] ?? STATUS_BADGE.today;
          const isOpen = openStudent === student.name;

          return (
            <React.Fragment key={student.name}>
              {/* Student card */}
              <button
                onClick={() => toggle(student.name)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12, width: 'calc(100% - 40px)',
                  margin: '0 20px 10px', padding: '14px 16px', background: '#fff',
                  borderRadius: 16, border: `0.5px solid ${isOpen ? '#14161F' : '#E5E7EB'}`,
                  cursor: 'pointer', textAlign: 'left',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.03)', transition: 'border-color 0.15s',
                }}
              >
                {/* Avatar */}
                <div style={{
                  width: 42, height: 42, borderRadius: '50%', background: student.avatarBg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: student.avatarText, fontWeight: 700, fontSize: 14, flexShrink: 0,
                }}>
                  {student.initials}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: '#111827' }}>{student.name}</div>
                  <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>{student.lastWorkout}</div>
                  {/* Frequency dots */}
                  <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
                    {student.freq.map((f, j) => (
                      <span key={j} style={{
                        width: 8, height: 8, borderRadius: '50%',
                        background: f ? '#14161F' : '#E5E7EB',
                      }} />
                    ))}
                  </div>
                </div>

                {/* Status badge */}
                <span style={{
                  fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 999,
                  background: badge.bg, color: badge.text, flexShrink: 0, whiteSpace: 'nowrap',
                }}>
                  {badge.label}
                </span>
              </button>

              {/* ── 5. DETAIL PANEL ────────────────────────────────── */}
              {isOpen && (
                <div style={{
                  margin: '-4px 20px 14px', border: '1.5px solid #14161F',
                  borderRadius: 16, padding: 16, background: '#fff',
                }}>
                  {/* Privacy notice */}
                  <div style={{
                    display: 'flex', alignItems: 'flex-start', gap: 8,
                    background: '#F9FAFB', borderRadius: 10, padding: '10px 12px', marginBottom: 14,
                  }}>
                    <Shield size={14} color="#9CA3AF" style={{ flexShrink: 0, marginTop: 1 }} />
                    <span style={{ fontSize: 11, color: '#9CA3AF', lineHeight: 1.4 }}>
                      Dados de ciclo menstrual, mood e feed social não estao disponiveis para personal trainers.
                    </span>
                  </div>

                  {/* Workout history */}
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#111827', marginBottom: 8 }}>
                    Histórico de treinos
                  </div>
                  {student.history.map((h, hi) => (
                    <div key={hi} style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '8px 10px', background: '#F9FAFB', borderRadius: 10, marginBottom: 6,
                    }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: 8, background: '#FBEAE1',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      }}>
                        <Zap size={14} color="#14161F" />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 12, fontWeight: 500, color: '#111827' }}>{h.name}</div>
                        <div style={{ fontSize: 10, color: '#9CA3AF' }}>{h.date}</div>
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 600, color: '#14161F' }}>{h.duration}</span>
                    </div>
                  ))}

                  {/* Prescribe button */}
                  <button style={{
                    width: '100%', padding: 12, border: 'none', borderRadius: 12,
                    background: student.status === 'days8' ? '#991B1B' : '#111827',
                    color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer',
                    marginTop: 10, transition: 'background 0.15s',
                  }}>
                    {student.status === 'days8'
                      ? `Entrar em contato com ${student.name.split(' ')[0]}`
                      : 'Prescrever novo treino'}
                  </button>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* ── 6. TAB BAR ───────────────────────────────────────────── */}
      <div style={{
        position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
        width: '100%', maxWidth: 430, background: '#fff',
        borderTop: '0.5px solid #E5E7EB',
        display: 'flex', padding: '8px 0 env(safe-area-inset-bottom, 8px)',
        zIndex: 50,
      }}>
        {[
          { to: '/trainer', label: 'Alunas', Icon: Users },
          { to: '/training', label: 'Treinos', Icon: Zap },
          { to: '/challenges', label: 'Agenda', Icon: CalendarDays },
          { to: '/profile', label: 'Perfil', Icon: User },
        ].map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            style={({ isActive }) => ({
              flex: 1, display: 'flex', flexDirection: 'column' as const, alignItems: 'center',
              gap: 2, textDecoration: 'none', padding: '4px 0',
              color: isActive ? '#4C1D95' : '#9CA3AF',
              fontSize: 9, fontWeight: 500,
            })}
          >
            <Icon size={22} />
            <span>{label}</span>
          </NavLink>
        ))}
      </div>
    </div>
  );
}
