import React, { useEffect, useRef, useState } from 'react';
import { useAuth, User } from '../contexts/AuthContext';
import { usersApi, UpdateProfileInput } from '../services/users.api';
import { calendarApi, CalendarConnection } from '../services/calendar.api';
import api from '../services/api';
import { formatBR } from '../utils/format';
import {
  Camera, Upload, Edit3, Save, LogOut, Calendar, ExternalLink,
  Trash2, Copy, Check, ChevronRight,
} from 'lucide-react';
import Layout from '../components/Layout';
import { InstagramIcon, FacebookIcon, XIcon, SnapchatIcon, WhatsAppIcon } from '../components/SocialIcons';
import { useTranslation } from '../i18n/useTranslation';

function getInitials(n: string): string {
  const p = n.trim().split(/\s+/);
  return p.length === 1 ? (p[0][0]?.toUpperCase() ?? '?') : (p[0][0] + p[p.length - 1][0]).toUpperCase();
}

const LEVELS = [
  { value: 'sedentary', label: 'Sedentario' },
  { value: 'beginner', label: 'Iniciante' },
  { value: 'intermediate', label: 'Intermediario' },
  { value: 'advanced', label: 'Avancado' },
];
const GOALS = [
  { value: 'weight_loss', label: 'Perda de peso' },
  { value: 'health', label: 'Saude' },
  { value: 'strength', label: 'Forca' },
  { value: 'wellbeing', label: 'Bem-estar' },
  { value: 'pregnancy', label: 'Gestacao' },
  { value: 'bone_health', label: 'Saude ossea' },
];

const S: Record<string, React.CSSProperties> = {
  screen: { maxWidth: 600, margin: '0 auto', padding: '0 16px 40px', fontFamily: "'DM Sans', sans-serif", background: '#F9FAFB', minHeight: '100vh' },
  header: { textAlign: 'center', padding: '32px 0 20px' },
  avatarWrap: { position: 'relative', display: 'inline-block', marginBottom: 12 },
  avatar: { width: 80, height: 80, borderRadius: '50%', background: '#7C3AED', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#EDE9FE', fontWeight: 700, fontSize: 28, overflow: 'hidden' },
  cameraBadge: { position: 'absolute', bottom: 0, right: 0, width: 28, height: 28, borderRadius: '50%', background: '#111827', border: '2px solid #F9FAFB', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' },
  name: { fontSize: 20, fontWeight: 600, color: '#111827' },
  email: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  card: { background: '#fff', borderRadius: 16, border: '0.5px solid #E5E7EB', padding: '16px 18px', marginBottom: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.03)' },
  cardTitle: { fontSize: 14, fontWeight: 600, color: '#111827', marginBottom: 12 },
  row: { display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #F3F4F6' },
  label: { fontSize: 13, color: '#6B7280' },
  value: { fontSize: 13, fontWeight: 500, color: '#111827' },
  input: { width: '100%', padding: '10px 12px', border: '1.5px solid #E5E7EB', borderRadius: 10, fontSize: 14, fontFamily: "'DM Sans', sans-serif", outline: 'none', boxSizing: 'border-box' as const },
  btn: { width: '100%', padding: 12, border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: 'pointer' },
};

export default function Profile() {
  const { currentUser, setCurrentUser } = useAuth();
  const { t, lang, changeLang, languages } = useTranslation();
  const [editing, setEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState('');
  const [calConns, setCalConns] = useState<CalendarConnection[]>([]);
  const [icalCopied, setIcalCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [weight, setWeight] = useState<number | ''>(currentUser?.weight ?? '');
  const [height, setHeight] = useState<number | ''>(currentUser?.height ?? '');
  const [fitnessLevel, setFitnessLevel] = useState(currentUser?.fitnessLevel ?? '');
  const [fitnessGoal, setFitnessGoal] = useState(currentUser?.fitnessGoal ?? '');

  useEffect(() => { calendarApi.connections().then(setCalConns).catch(() => {}); }, []);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Get presigned URL
    try {
      const { uploadUrl, publicUrl } = await api.post('/media/presigned-url?type=image&folder=avatars').then(r => r.data);
      // Upload file
      await fetch(uploadUrl, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } });
      // Save to profile
      const updated = await usersApi.updateMe({ profile: { avatarUrl: publicUrl } } as any);
      setCurrentUser(updated);
      setToast('Foto atualizada!');
      setTimeout(() => setToast(''), 2000);
    } catch {
      // Fallback: use object URL locally
      const localUrl = URL.createObjectURL(file);
      try {
        const updated = await usersApi.updateMe({ profile: { avatarUrl: localUrl } } as any);
        setCurrentUser(updated);
        setToast('Foto atualizada!');
        setTimeout(() => setToast(''), 2000);
      } catch { setError('Falha ao atualizar foto'); }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const dto: UpdateProfileInput = {};
      if (weight !== '') dto.weight = Number(weight);
      if (height !== '') dto.height = Number(height);
      if (fitnessLevel) dto.fitnessLevel = fitnessLevel as any;
      if (fitnessGoal) dto.fitnessGoal = fitnessGoal as any;
      const updated = await usersApi.updateMe(dto);
      setCurrentUser(updated);
      setToast('Perfil salvo!');
      setTimeout(() => setToast(''), 2000);
      setEditing(false);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Falha ao salvar');
    } finally { setSubmitting(false); }
  };

  if (!currentUser) return <Layout title="Perfil"><p style={{ color: '#6B7280', textAlign: 'center', paddingTop: 40 }}>Carregando...</p></Layout>;

  const avatarUrl = currentUser.profile?.avatarUrl as string | undefined;
  const lv = LEVELS.find(x => x.value === currentUser.fitnessLevel)?.label ?? '--';
  const gl = GOALS.find(x => x.value === currentUser.fitnessGoal)?.label ?? '--';

  return (
    <Layout>
      {/* Hidden file input */}
      <input ref={fileInputRef} type="file" accept="image/*" capture="environment" style={{ display: 'none' }} onChange={handlePhotoUpload} />

      {/* Header */}
      <div style={S.header as any}>
        <div style={S.avatarWrap as any}>
          <div style={S.avatar as any}>
            {avatarUrl ? <img src={avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : getInitials(currentUser.name)}
          </div>
          <button onClick={() => fileInputRef.current?.click()} style={S.cameraBadge as any}>
            <Camera size={14} color="#fff" />
          </button>
        </div>
        <div style={S.name}>{currentUser.name}</div>
        <div style={S.email as any}>{currentUser.email}</div>
      </div>

      {/* Info card */}
      <div style={S.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <span style={S.cardTitle}>Informacoes</span>
          {!editing && <button onClick={() => setEditing(true)} style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer', color: '#7C3AED', fontSize: 13, fontWeight: 600 }}><Edit3 size={14} /> Editar</button>}
        </div>
        {!editing ? (
          <>
            {[
              ['Nascimento', formatBR(currentUser.birthDate)],
              ['Peso', currentUser.weight ? `${currentUser.weight} kg` : '--'],
              ['Altura', currentUser.height ? `${currentUser.height} cm` : '--'],
              ['Nivel', lv],
              ['Objetivo', gl],
            ].map(([label, value], i) => (
              <div key={i} style={S.row as any}>
                <span style={S.label}>{label}</span>
                <span style={S.value}>{value}</span>
              </div>
            ))}
          </>
        ) : (
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 4 }}>Peso (kg)</label>
                <input type="number" min={20} max={300} step={0.1} value={weight} onChange={e => setWeight(e.target.value === '' ? '' : Number(e.target.value))} style={S.input} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 4 }}>Altura (cm)</label>
                <input type="number" min={50} max={250} value={height} onChange={e => setHeight(e.target.value === '' ? '' : Number(e.target.value))} style={S.input} />
              </div>
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 4 }}>Nivel</label>
              <select value={fitnessLevel} onChange={e => setFitnessLevel(e.target.value)} style={S.input}>
                <option value="">Selecione</option>
                {LEVELS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 4 }}>Objetivo</label>
              <select value={fitnessGoal} onChange={e => setFitnessGoal(e.target.value)} style={S.input}>
                <option value="">Selecione</option>
                {GOALS.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
              </select>
            </div>
            {error && <div style={{ background: '#FEE2E2', color: '#991B1B', padding: '8px 12px', borderRadius: 8, fontSize: 13 }}>{error}</div>}
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="button" onClick={() => setEditing(false)} style={{ ...S.btn, background: '#F3F4F6', color: '#374151', flex: 1 }}>Cancelar</button>
              <button type="submit" disabled={submitting} style={{ ...S.btn, background: '#7C3AED', color: '#fff', flex: 1, opacity: submitting ? 0.6 : 1 }}>
                {submitting ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Photo upload card */}
      <div style={S.card}>
        <span style={S.cardTitle}>Foto de perfil</span>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => fileInputRef.current?.click()} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: 10, borderRadius: 10, border: '1px solid #E5E7EB', background: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 500, color: '#111827' }}>
            <Upload size={16} /> Fototeca
          </button>
          <button onClick={() => { const input = fileInputRef.current; if (input) { input.setAttribute('capture', 'environment'); input.click(); } }} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: 10, borderRadius: 10, border: '1px solid #E5E7EB', background: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 500, color: '#111827' }}>
            <Camera size={16} /> Camera
          </button>
        </div>
      </div>

      {/* Share removed - moved to Feed */}

      {/* Calendar */}
      <div style={S.card}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
          <Calendar size={16} color="#7C3AED" />
          <span style={S.cardTitle}>Calendarios</span>
        </div>
        {calConns.map(c => (
          <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #F3F4F6' }}>
            <span style={{ fontSize: 13, fontWeight: 500 }}>{c.provider === 'google' ? 'Google Calendar' : 'Microsoft'}</span>
            <button onClick={async () => { await calendarApi.disconnect(c.id); setCalConns(p => p.filter(x => x.id !== c.id)); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#DC2626', padding: 2 }}><Trash2 size={14} /></button>
          </div>
        ))}
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <a href={calendarApi.connectUrl('google')} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, padding: '8px', borderRadius: 8, border: '1px solid #E5E7EB', textDecoration: 'none', color: '#111827', fontSize: 12, fontWeight: 500 }}>
            <ExternalLink size={12} /> Google
          </a>
          <a href={calendarApi.connectUrl('microsoft')} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, padding: '8px', borderRadius: 8, border: '1px solid #E5E7EB', textDecoration: 'none', color: '#111827', fontSize: 12, fontWeight: 500 }}>
            <ExternalLink size={12} /> Microsoft
          </a>
        </div>
        <div style={{ background: '#F9FAFB', borderRadius: 8, padding: '8px 10px', marginTop: 10 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#374151', marginBottom: 4 }}>iCal (Apple/Outlook)</div>
          <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
            <input readOnly value={currentUser ? calendarApi.icalFeedUrl(currentUser.id) : ''} onClick={e => (e.target as HTMLInputElement).select()} style={{ flex: 1, padding: '4px 6px', border: '1px solid #E5E7EB', borderRadius: 6, fontSize: 10, background: '#fff' }} />
            <button onClick={() => { navigator.clipboard.writeText(calendarApi.icalFeedUrl(currentUser!.id)); setIcalCopied(true); setTimeout(() => setIcalCopied(false), 2000); }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: icalCopied ? '#16A34A' : '#6B7280' }}>
              {icalCopied ? <Check size={14} /> : <Copy size={14} />}
            </button>
          </div>
        </div>
      </div>

      {/* Language */}
      <div style={S.card}>
        <span style={S.cardTitle}>Idioma / Language</span>
        <div style={{ display: 'flex', gap: 8 }}>
          {languages.map(l => (
            <button key={l.code} onClick={() => changeLang(l.code)}
              style={{ flex: 1, padding: '8px', borderRadius: 10, border: `1.5px solid ${lang === l.code ? '#7C3AED' : '#E5E7EB'}`, background: lang === l.code ? '#FAF5FF' : '#fff', cursor: 'pointer', fontSize: 13, fontWeight: lang === l.code ? 600 : 400, color: lang === l.code ? '#7C3AED' : '#374151' }}>
              {l.label}
            </button>
          ))}
        </div>
      </div>

      {/* Logout */}
      <div style={{ textAlign: 'center', padding: '16px 0' }}>
        <button onClick={() => { localStorage.removeItem('eliamov_token'); window.location.href = '/login'; }} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'none', border: '1.5px solid #DC2626', color: '#DC2626', padding: '10px 24px', borderRadius: 12, fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
          <LogOut size={16} /> Sair da conta
        </button>
      </div>

      {/* Toast */}
      {toast && <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', background: '#111827', color: '#fff', padding: '10px 20px', borderRadius: 12, fontSize: 13, fontWeight: 500, zIndex: 100 }}>{toast}</div>}
    </Layout>
  );
}
