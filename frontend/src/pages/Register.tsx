import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, getHomeRoute } from '../contexts/AuthContext';
import {
  ArrowRight, UserCircle, ClipboardList, Heart, Building2,
  Mail, Lock, User,
} from 'lucide-react';
import Logo from '../components/Logo';

type ProfileType = 'female_user' | 'personal_trainer' | 'family_companion' | 'academy_admin';

const PROFILES = [
  { value: 'female_user' as const, label: 'Sou aluna', hint: 'Treino, ciclo e saude feminina', Icon: UserCircle, iconColor: '#7C3AED', iconBg: '#EDE9FE' },
  { value: 'personal_trainer' as const, label: 'Personal trainer', hint: 'Acompanhe suas alunas', Icon: ClipboardList, iconColor: '#16A34A', iconBg: '#F0FDF4' },
  { value: 'family_companion' as const, label: 'Familiar', hint: 'Acompanhe quem voce ama', Icon: Heart, iconColor: '#DB2777', iconBg: '#FDF2F8' },
  { value: 'academy_admin' as const, label: 'Gestor de academia', hint: 'Gerencie sua academia', Icon: Building2, iconColor: '#1D4ED8', iconBg: '#EFF6FF' },
];

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [profileType, setProfileType] = useState<ProfileType>('female_user');
  const [academyCode, setAcademyCode] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const showAcademyCode = profileType === 'personal_trainer' || profileType === 'academy_admin';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const user = await register(name, email, password, profileType, academyCode || undefined);
      navigate(getHomeRoute(user), { replace: true });
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Falha ao cadastrar';
      setError(Array.isArray(msg) ? msg.join(', ') : msg);
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 12px 10px 36px', border: '1.5px solid #E5E7EB',
    borderRadius: 12, fontSize: 14, fontFamily: "'DM Sans', sans-serif",
    outline: 'none', boxSizing: 'border-box',
  };

  return (
    <div style={{
      minHeight: '100vh', background: '#F9FAFB', display: 'flex',
      alignItems: 'center', justifyContent: 'center', padding: 20,
      fontFamily: "'DM Sans', sans-serif",
    }}>
      <form onSubmit={handleSubmit} style={{
        width: '100%', maxWidth: 420, background: '#fff', borderRadius: 20,
        padding: '32px 24px', boxShadow: '0 4px 24px rgba(124,58,237,0.08)',
        border: '0.5px solid #E5E7EB',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ marginBottom: 6 }}><Logo size={36} variant="dark" /></div>
          <p style={{ fontSize: 14, color: '#6B7280' }}>Crie sua conta</p>
        </div>

        {/* Profile type selector */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 20 }}>
          {PROFILES.map((p) => {
            const sel = profileType === p.value;
            return (
              <button key={p.value} type="button" onClick={() => setProfileType(p.value)} style={{
                background: sel ? '#FAF5FF' : '#fff',
                border: `1.5px solid ${sel ? '#7C3AED' : '#E5E7EB'}`,
                borderRadius: 14, padding: '12px 10px', cursor: 'pointer', textAlign: 'left',
                transform: sel ? 'scale(1.02)' : 'scale(1)', transition: 'all 0.15s',
              }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 10, background: p.iconBg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8,
                }}>
                  <p.Icon size={16} color={p.iconColor} />
                </div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#111827' }}>{p.label}</div>
                <div style={{ fontSize: 10, color: '#9CA3AF', marginTop: 1 }}>{p.hint}</div>
              </button>
            );
          })}
        </div>

        {/* Name */}
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 13, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 6 }}>Nome</label>
          <div style={{ position: 'relative' }}>
            <User size={16} color="#9CA3AF" style={{ position: 'absolute', left: 12, top: 13 }} />
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required autoComplete="name"
              style={inputStyle}
              onFocus={(e) => { e.target.style.borderColor = '#7C3AED'; }}
              onBlur={(e) => { e.target.style.borderColor = '#E5E7EB'; }}
            />
          </div>
        </div>

        {/* Email */}
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 13, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 6 }}>Email</label>
          <div style={{ position: 'relative' }}>
            <Mail size={16} color="#9CA3AF" style={{ position: 'absolute', left: 12, top: 13 }} />
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email"
              style={inputStyle}
              onFocus={(e) => { e.target.style.borderColor = '#7C3AED'; }}
              onBlur={(e) => { e.target.style.borderColor = '#E5E7EB'; }}
            />
          </div>
        </div>

        {/* Password */}
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 13, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 6 }}>Senha</label>
          <div style={{ position: 'relative' }}>
            <Lock size={16} color="#9CA3AF" style={{ position: 'absolute', left: 12, top: 13 }} />
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} autoComplete="new-password"
              style={inputStyle}
              onFocus={(e) => { e.target.style.borderColor = '#7C3AED'; }}
              onBlur={(e) => { e.target.style.borderColor = '#E5E7EB'; }}
            />
          </div>
        </div>

        {/* Academy code */}
        {showAcademyCode && (
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 13, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 6 }}>Codigo da academia</label>
            <div style={{ position: 'relative' }}>
              <Building2 size={16} color="#9CA3AF" style={{ position: 'absolute', left: 12, top: 13 }} />
              <input type="text" value={academyCode} onChange={(e) => setAcademyCode(e.target.value)}
                placeholder="Informe o codigo" style={inputStyle}
                onFocus={(e) => { e.target.style.borderColor = '#7C3AED'; }}
                onBlur={(e) => { e.target.style.borderColor = '#E5E7EB'; }}
              />
            </div>
          </div>
        )}

        {error && (
          <div style={{
            background: '#FEE2E2', color: '#991B1B', padding: '10px 14px',
            borderRadius: 10, fontSize: 13, marginBottom: 14,
          }}>{error}</div>
        )}

        <button type="submit" disabled={submitting} style={{
          width: '100%', padding: 14, border: 'none', borderRadius: 14,
          background: '#7C3AED', color: '#fff', fontSize: 15, fontWeight: 600,
          cursor: submitting ? 'default' : 'pointer', opacity: submitting ? 0.6 : 1,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          boxShadow: '0 4px 20px rgba(124,58,237,0.2)', transition: 'opacity 0.15s',
        }}>
          {submitting ? 'Criando...' : 'Criar conta'}
          {!submitting && <ArrowRight size={16} />}
        </button>

        <p style={{ textAlign: 'center', fontSize: 13, color: '#6B7280', marginTop: 20 }}>
          Ja tem conta?{' '}
          <Link to="/login" style={{ color: '#7C3AED', fontWeight: 600, textDecoration: 'none' }}>Entrar</Link>
        </p>
      </form>
    </div>
  );
}
