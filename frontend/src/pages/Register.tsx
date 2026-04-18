import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, getHomeRoute } from '../contexts/AuthContext';
import {
  ArrowRight, UserCircle, ClipboardList, Building2,
  Mail, Lock, User,
} from 'lucide-react';
import Logo from '../components/Logo';

type ProfileType = 'female_user' | 'personal_trainer' | 'family_companion' | 'academy_admin';

const PROFILES = [
  { value: 'female_user' as const, label: 'Aluna', hint: 'Treino e saúde feminina', Icon: UserCircle },
  { value: 'personal_trainer' as const, label: 'Personal trainer', hint: 'Acompanhe alunas', Icon: ClipboardList },
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

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#F5EFE6',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        fontFamily: "'Figtree', sans-serif",
      }}
    >
      <style>{`
        @keyframes elia-rise { from { opacity:0; transform:translateY(16px) } to { opacity:1; transform:translateY(0) } }
        .elia-reg-input {
          width: 100%;
          padding: 14px 14px 14px 42px;
          border: 1px solid rgba(20,22,31,0.12);
          border-radius: 2px;
          font-size: 14px;
          font-family: 'Figtree', sans-serif;
          outline: none;
          box-sizing: border-box;
          background: #FDFAF3;
          color: #14161F;
          transition: border-color 0.3s ease;
        }
        .elia-reg-input:focus { border-color: #14161F; background: #FFFCF5; }
        .elia-reg-input::placeholder { color: rgba(20,22,31,0.38); }
      `}</style>

      <form
        onSubmit={handleSubmit}
        style={{
          width: '100%',
          maxWidth: 460,
          background: '#FDFAF3',
          padding: 'clamp(32px, 4vw, 44px) clamp(28px, 3.5vw, 40px)',
          border: '1px solid rgba(20,22,31,0.08)',
          animation: 'elia-rise 0.6s cubic-bezier(0.16,1,0.3,1) both',
        }}
      >
        <div style={{ marginBottom: 32, textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
            <Logo size={32} variant="dark" />
          </div>
          <div
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 10,
              letterSpacing: '0.3em',
              textTransform: 'uppercase',
              color: '#D97757',
              marginBottom: 14,
            }}
          >
            ● &nbsp;Nova conta
          </div>
          <h1
            style={{
              fontFamily: "'Fraunces', serif",
              fontSize: 30,
              fontWeight: 400,
              letterSpacing: '-0.025em',
              color: '#14161F',
              margin: '0 0 8px',
              lineHeight: 1.1,
            }}
          >
            Seu ritmo começa aqui.
          </h1>
          <p
            style={{
              fontSize: 13.5,
              color: 'rgba(20,22,31,0.62)',
              margin: 0,
              lineHeight: 1.5,
            }}
          >
            Em minutos, a plataforma adapta treino, nutrição e bem-estar a você.
          </p>
        </div>

        {/* Profile type */}
        <div style={{ marginBottom: 24 }}>
          <div
            style={{
              fontFamily: "'Figtree', sans-serif",
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'rgba(20,22,31,0.6)',
              marginBottom: 12,
            }}
          >
            Qual é seu perfil?
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {PROFILES.map((p) => {
              const sel = profileType === p.value;
              return (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setProfileType(p.value)}
                  style={{
                    background: sel ? '#14161F' : 'transparent',
                    color: sel ? '#F5EFE6' : '#14161F',
                    border: `1px solid ${sel ? '#14161F' : 'rgba(20,22,31,0.14)'}`,
                    borderRadius: 2,
                    padding: '16px 14px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.25s cubic-bezier(0.16,1,0.3,1)',
                    fontFamily: "'Figtree', sans-serif",
                  }}
                >
                  <p.Icon size={18} color={sel ? '#D97757' : 'rgba(20,22,31,0.55)'} />
                  <div
                    style={{
                      fontSize: 13.5,
                      fontWeight: 600,
                      marginTop: 10,
                      letterSpacing: '-0.005em',
                    }}
                  >
                    {p.label}
                  </div>
                  <div
                    style={{
                      fontSize: 11.5,
                      color: sel ? 'rgba(245,239,230,0.65)' : 'rgba(20,22,31,0.5)',
                      marginTop: 3,
                    }}
                  >
                    {p.hint}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {[
          { label: 'Nome', icon: User, value: name, setter: setName, type: 'text', placeholder: 'Como você quer ser chamada', autoComplete: 'name', min: undefined },
          { label: 'Email', icon: Mail, value: email, setter: setEmail, type: 'email', placeholder: 'você@email.com', autoComplete: 'email', min: undefined },
          { label: 'Senha', icon: Lock, value: password, setter: setPassword, type: 'password', placeholder: 'Mínimo 6 caracteres', autoComplete: 'new-password', min: 6 },
        ].map((f) => (
          <div key={f.label} style={{ marginBottom: 16 }}>
            <label
              style={{
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: 'rgba(20,22,31,0.6)',
                display: 'block',
                marginBottom: 8,
              }}
            >
              {f.label}
            </label>
            <div style={{ position: 'relative' }}>
              <f.icon
                size={16}
                color="rgba(20,22,31,0.42)"
                style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
              />
              <input
                type={f.type}
                value={f.value}
                onChange={(e) => f.setter(e.target.value)}
                required
                autoComplete={f.autoComplete}
                placeholder={f.placeholder}
                minLength={f.min}
                className="elia-reg-input"
              />
            </div>
          </div>
        ))}

        {showAcademyCode && (
          <div style={{ marginBottom: 16 }}>
            <label
              style={{
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: 'rgba(20,22,31,0.6)',
                display: 'block',
                marginBottom: 8,
              }}
            >
              Código da academia
            </label>
            <div style={{ position: 'relative' }}>
              <Building2
                size={16}
                color="rgba(20,22,31,0.42)"
                style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
              />
              <input
                type="text"
                value={academyCode}
                onChange={(e) => setAcademyCode(e.target.value)}
                placeholder="Informe o código"
                className="elia-reg-input"
              />
            </div>
          </div>
        )}

        {error && (
          <div
            style={{
              background: 'rgba(139,58,47,0.06)',
              color: '#8B3A2F',
              padding: '12px 16px',
              borderLeft: '2px solid #8B3A2F',
              fontSize: 13,
              marginBottom: 16,
              fontWeight: 500,
              lineHeight: 1.5,
            }}
          >
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          style={{
            width: '100%',
            padding: 18,
            border: 'none',
            borderRadius: 2,
            background: submitting ? 'rgba(20,22,31,0.5)' : '#14161F',
            color: '#F5EFE6',
            fontSize: 13,
            fontWeight: 600,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            cursor: submitting ? 'default' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            fontFamily: "'Figtree', sans-serif",
            transition: 'background 0.3s ease',
          }}
          onMouseEnter={(e) => {
            if (!submitting) (e.currentTarget as HTMLElement).style.background = '#D97757';
          }}
          onMouseLeave={(e) => {
            if (!submitting) (e.currentTarget as HTMLElement).style.background = '#14161F';
          }}
        >
          {submitting ? 'Criando…' : <>Criar conta <ArrowRight size={16} /></>}
        </button>

        <div
          style={{
            marginTop: 24,
            paddingTop: 20,
            borderTop: '1px solid rgba(20,22,31,0.1)',
            textAlign: 'center',
            fontSize: 13.5,
            color: 'rgba(20,22,31,0.62)',
          }}
        >
          Já tem conta?{' '}
          <Link
            to="/login"
            style={{
              color: '#14161F',
              fontWeight: 600,
              textDecoration: 'underline',
              textUnderlineOffset: 3,
              textDecorationColor: '#D97757',
            }}
          >
            Entrar
          </Link>
        </div>
      </form>
    </div>
  );
}
