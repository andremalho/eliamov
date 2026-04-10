import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

type ProfileType = 'female_user' | 'personal_trainer' | 'family_companion' | 'academy_admin';

const PROFILE_OPTIONS = [
  { value: 'female_user', label: 'Usuaria', desc: 'Acesso completo a saude feminina', icon: '♀' },
  { value: 'personal_trainer', label: 'Personal Trainer', desc: 'Acompanhe suas alunas', icon: '💪' },
  { value: 'family_companion', label: 'Acompanhante', desc: 'Acompanhe um familiar', icon: '👨‍👩‍👧' },
  { value: 'academy_admin', label: 'Academia', desc: 'Gerencie sua academia', icon: '🏢' },
] as const;

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
      await register(name, email, password, profileType, academyCode || undefined);
      navigate('/onboarding-flow', { replace: true });
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Falha ao cadastrar';
      setError(Array.isArray(msg) ? msg.join(', ') : msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-screen">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1 className="brand">EliaMov</h1>
        <p className="muted">Crie sua conta</p>

        <div className="profile-type-grid">
          {PROFILE_OPTIONS.map((opt) => (
            <div
              key={opt.value}
              className={`profile-type-card${profileType === opt.value ? ' selected' : ''}`}
              onClick={() => setProfileType(opt.value as ProfileType)}
            >
              <div className="icon">{opt.icon}</div>
              <div className="label">{opt.label}</div>
              <div className="desc">{opt.desc}</div>
            </div>
          ))}
        </div>

        <label>
          Nome
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoComplete="name"
          />
        </label>

        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </label>

        <label>
          Senha
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            autoComplete="new-password"
          />
        </label>

        {showAcademyCode && (
          <label>
            Codigo da academia
            <input
              type="text"
              value={academyCode}
              onChange={(e) => setAcademyCode(e.target.value)}
              placeholder="Informe o codigo da academia"
            />
          </label>
        )}

        {error && <div className="error">{error}</div>}

        <button type="submit" disabled={submitting}>
          {submitting ? 'Criando…' : 'Criar conta'}
        </button>

        <p className="muted small">
          Ja tem conta? <Link to="/login">Entrar</Link>
        </p>
      </form>
    </div>
  );
}
