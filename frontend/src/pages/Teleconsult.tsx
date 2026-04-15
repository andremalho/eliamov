import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { teleconsultApi, Teleconsult as TeleconsultItem, CreateTeleconsultInput } from '../services/teleconsult.api';
import { formatDateTimeBR } from '../utils/format';
import { Video, Calendar, Clock } from 'lucide-react';

type Tab = 'consultas' | 'agendar' | 'como';

const card: React.CSSProperties = { background: '#fff', borderRadius: 16, border: '1px solid #E5E7EB', padding: 18, marginBottom: 14 };
const tabBtn = (active: boolean): React.CSSProperties => ({
  flex: 1, padding: '10px 4px', borderRadius: 999, border: 'none', fontSize: 13, fontWeight: 600,
  cursor: 'pointer', background: active ? '#7C3AED' : '#F3F4F6', color: active ? '#fff' : '#6B7280',
  fontFamily: "'DM Sans', sans-serif", transition: 'all 0.15s',
});
const STATUS_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  scheduled: { bg: '#DBEAFE', color: '#1E40AF', label: 'Agendada' },
  completed: { bg: '#DCFCE7', color: '#166534', label: 'Realizada' },
  cancelled: { bg: '#FEE2E2', color: '#991B1B', label: 'Cancelada' },
};
const SPECIALTIES = [
  { value: 'ginecologia', label: 'Ginecologia' },
  { value: 'nutricao', label: 'Nutricao' },
  { value: 'psicologia', label: 'Psicologia' },
  { value: 'outro', label: 'Outro' },
];

export default function Teleconsult() {
  const [tab, setTab] = useState<Tab>('consultas');
  const [consultations, setConsultations] = useState<TeleconsultItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [specialty, setSpecialty] = useState('ginecologia');
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredTime, setPreferredTime] = useState('');
  const [healthPlan, setHealthPlan] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (tab === 'consultas') {
      setLoading(true);
      teleconsultApi.list().then(setConsultations).catch(() => {}).finally(() => setLoading(false));
    }
  }, [tab]);

  const handleSchedule = async () => {
    setSubmitting(true);
    try {
      await teleconsultApi.create({ specialty, preferredDate, preferredTime, healthPlan: healthPlan || undefined, notes: notes || undefined });
      setSuccess(true);
      setSpecialty('ginecologia'); setPreferredDate(''); setPreferredTime(''); setHealthPlan(''); setNotes('');
    } catch { alert('Erro ao solicitar agendamento.'); }
    finally { setSubmitting(false); }
  };

  const handleCancel = async (id: string) => {
    if (!confirm('Cancelar esta consulta?')) return;
    try { await teleconsultApi.cancel(id); setConsultations(prev => prev.map(c => c.id === id ? { ...c, status: 'cancelled' as const } : c)); }
    catch { alert('Erro ao cancelar.'); }
  };

  const canJoin = (scheduledAt: string) => {
    const diff = new Date(scheduledAt).getTime() - Date.now();
    return diff <= 10 * 60000 && diff >= -60 * 60000;
  };

  const inputStyle: React.CSSProperties = { width: '100%', padding: '10px 12px', border: '1.5px solid #E5E7EB', borderRadius: 10, fontSize: 14, outline: 'none', boxSizing: 'border-box', fontFamily: "'DM Sans', sans-serif" };

  return (
    <Layout title="Teleconsulta" subtitle="Consultas por video com profissionais de saude.">
      <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
        <button style={tabBtn(tab === 'consultas')} onClick={() => { setTab('consultas'); setSuccess(false); }}>Minhas Consultas</button>
        <button style={tabBtn(tab === 'agendar')} onClick={() => { setTab('agendar'); setSuccess(false); }}>Agendar</button>
        <button style={tabBtn(tab === 'como')} onClick={() => setTab('como')}>Como funciona</button>
      </div>

      {/* Tab 1 — Consultas */}
      {tab === 'consultas' && (
        loading ? <p style={{ color: '#9CA3AF', textAlign: 'center', padding: 20 }}>Carregando...</p> : (
          consultations.length === 0 ? (
            <div style={{ ...card, textAlign: 'center' }}>
              <Video size={32} color="#9CA3AF" style={{ marginBottom: 8 }} />
              <p style={{ color: '#6B7280', marginBottom: 12 }}>Nenhuma teleconsulta agendada.</p>
              <button onClick={() => setTab('agendar')} style={{ padding: '8px 18px', borderRadius: 10, border: 'none', background: '#7C3AED', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>Agendar consulta</button>
            </div>
          ) : (
            consultations.map(c => {
              const st = STATUS_STYLES[c.status] || STATUS_STYLES.scheduled;
              return (
                <div key={c.id} style={card}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <div>
                      <span style={{ fontSize: 15, fontWeight: 600, color: '#1F2937' }}>{c.professionalName || c.specialty}</span>
                      <span style={{ marginLeft: 8, padding: '2px 10px', borderRadius: 999, fontSize: 11, fontWeight: 600, background: st.bg, color: st.color }}>{st.label}</span>
                    </div>
                  </div>
                  <p style={{ fontSize: 13, color: '#6B7280', margin: '0 0 10px', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Calendar size={14} /> {formatDateTimeBR(c.scheduledAt)}
                  </p>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {c.status === 'scheduled' && canJoin(c.scheduledAt) && c.videoRoomUrl && (
                      <a href={c.videoRoomUrl} target="_blank" rel="noopener noreferrer" style={{
                        padding: '8px 16px', borderRadius: 10, border: 'none', background: '#22C55E', color: '#fff',
                        fontSize: 13, fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4,
                      }}><Video size={14} /> Entrar na chamada</a>
                    )}
                    {c.status === 'scheduled' && new Date(c.scheduledAt) > new Date() && (
                      <button onClick={() => handleCancel(c.id)} style={{ fontSize: 12, color: '#DC2626', background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>Cancelar</button>
                    )}
                  </div>
                </div>
              );
            })
          )
        )
      )}

      {/* Tab 2 — Agendar */}
      {tab === 'agendar' && (
        success ? (
          <div style={{ ...card, background: '#F0FDF4', borderColor: '#BBF7D0', textAlign: 'center' }}>
            <p style={{ fontSize: 16, fontWeight: 600, color: '#166534', marginBottom: 8 }}>Solicitacao enviada!</p>
            <p style={{ fontSize: 13, color: '#166534' }}>Em breve voce recebera a confirmacao com o link da chamada.</p>
            <button onClick={() => { setSuccess(false); setTab('consultas'); }} style={{ marginTop: 12, padding: '8px 18px', borderRadius: 10, border: 'none', background: '#7C3AED', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>Ver minhas consultas</button>
          </div>
        ) : (
          <div style={card}>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: '#1F2937', marginBottom: 16 }}>Solicitar agendamento</h3>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 6 }}>Tipo de consulta</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {SPECIALTIES.map(s => (
                  <button key={s.value} onClick={() => setSpecialty(s.value)} style={{
                    padding: '10px 12px', borderRadius: 10,
                    border: specialty === s.value ? '2px solid #7C3AED' : '1.5px solid #E5E7EB',
                    background: specialty === s.value ? '#F5F3FF' : '#fff',
                    color: specialty === s.value ? '#7C3AED' : '#374151',
                    fontWeight: specialty === s.value ? 600 : 400, fontSize: 13, cursor: 'pointer',
                    fontFamily: "'DM Sans', sans-serif",
                  }}>{s.label}</button>
                ))}
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 4 }}>Data preferida</label>
                <input type="date" value={preferredDate} onChange={e => setPreferredDate(e.target.value)} style={inputStyle} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 4 }}>Horario preferido</label>
                <input type="time" value={preferredTime} onChange={e => setPreferredTime(e.target.value)} style={inputStyle} />
              </div>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 4 }}>Plano de saude (opcional)</label>
              <input type="text" value={healthPlan} onChange={e => setHealthPlan(e.target.value)} placeholder="Nome do plano" style={inputStyle} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 4 }}>Observacoes (opcional)</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} placeholder="Motivo da consulta, sintomas, etc." style={{ ...inputStyle, resize: 'vertical' as const }} />
            </div>
            <button onClick={handleSchedule} disabled={submitting || !preferredDate || !preferredTime} style={{
              width: '100%', padding: 12, borderRadius: 12, border: 'none',
              background: '#7C3AED', color: '#fff', fontSize: 14, fontWeight: 600,
              cursor: 'pointer', opacity: submitting || !preferredDate || !preferredTime ? 0.5 : 1,
              fontFamily: "'DM Sans', sans-serif",
            }}>{submitting ? 'Enviando...' : 'Solicitar agendamento'}</button>
          </div>
        )
      )}

      {/* Tab 3 — Como funciona */}
      {tab === 'como' && (
        <div>
          {[
            { icon: '📅', title: 'Agende sua consulta', desc: 'Escolha a data, horario e especialidade desejada.' },
            { icon: '✉️', title: 'Receba a confirmacao', desc: 'Voce recebera um link de video e a confirmacao do profissional.' },
            { icon: '💻', title: 'Acesse pelo link', desc: 'No horario marcado, clique em "Entrar na chamada" para iniciar o video.' },
            { icon: '📋', title: 'Resumo disponivel', desc: 'Apos a consulta, o resumo fica disponivel aqui para voce consultar.' },
          ].map((step, i) => (
            <div key={i} style={{ ...card, display: 'flex', alignItems: 'flex-start', gap: 14 }}>
              <span style={{ fontSize: 28, flexShrink: 0 }}>{step.icon}</span>
              <div>
                <p style={{ fontSize: 14, fontWeight: 600, color: '#1F2937', margin: '0 0 4px' }}>{i + 1}. {step.title}</p>
                <p style={{ fontSize: 13, color: '#6B7280', margin: 0, lineHeight: 1.5 }}>{step.desc}</p>
              </div>
            </div>
          ))}
          <div style={{ ...card, background: '#F5F3FF', borderColor: '#C4B5FD' }}>
            <p style={{ fontSize: 13, color: '#5B21B6', margin: 0, lineHeight: 1.6 }}>
              As teleconsultas sao realizadas por video, com total privacidade e seguranca. Seus dados sao protegidos conforme a LGPD.
            </p>
          </div>
        </div>
      )}
    </Layout>
  );
}
