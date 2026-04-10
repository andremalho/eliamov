import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, getHomeRoute } from '../contexts/AuthContext';
import { ArrowRight, Mail, Lock } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const user = await login(email, password);
      navigate(getHomeRoute(user), { replace: true });
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Falha ao entrar';
      setError(Array.isArray(msg) ? msg.join(', ') : msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', background: '#F9FAFB', display: 'flex',
      alignItems: 'center', justifyContent: 'center', padding: 20,
      fontFamily: "'DM Sans', sans-serif",
    }}>
      <form onSubmit={handleSubmit} style={{
        width: '100%', maxWidth: 380, background: '#fff', borderRadius: 20,
        padding: '36px 28px', boxShadow: '0 4px 24px rgba(124,58,237,0.08)',
        border: '0.5px solid #E5E7EB',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <h1 style={{
            fontFamily: "'Cormorant Garamond', serif", fontSize: 32,
            fontWeight: 700, color: '#2D1B4E', margin: '0 0 6px',
          }}>EliaMov</h1>
          <p style={{ fontSize: 14, color: '#6B7280' }}>Entre na sua conta</p>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 13, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 6 }}>Email</label>
          <div style={{ position: 'relative' }}>
            <Mail size={16} color="#9CA3AF" style={{ position: 'absolute', left: 12, top: 13 }} />
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email"
              style={{
                width: '100%', padding: '10px 12px 10px 36px', border: '1.5px solid #E5E7EB',
                borderRadius: 12, fontSize: 14, fontFamily: "'DM Sans', sans-serif", outline: 'none',
                boxSizing: 'border-box',
              }}
              onFocus={(e) => { e.target.style.borderColor = '#7C3AED'; }}
              onBlur={(e) => { e.target.style.borderColor = '#E5E7EB'; }}
            />
          </div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 13, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 6 }}>Senha</label>
          <div style={{ position: 'relative' }}>
            <Lock size={16} color="#9CA3AF" style={{ position: 'absolute', left: 12, top: 13 }} />
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} autoComplete="current-password"
              style={{
                width: '100%', padding: '10px 12px 10px 36px', border: '1.5px solid #E5E7EB',
                borderRadius: 12, fontSize: 14, fontFamily: "'DM Sans', sans-serif", outline: 'none',
                boxSizing: 'border-box',
              }}
              onFocus={(e) => { e.target.style.borderColor = '#7C3AED'; }}
              onBlur={(e) => { e.target.style.borderColor = '#E5E7EB'; }}
            />
          </div>
        </div>

        {error && (
          <div style={{
            background: '#FEE2E2', color: '#991B1B', padding: '10px 14px',
            borderRadius: 10, fontSize: 13, marginBottom: 16,
          }}>{error}</div>
        )}

        <button type="submit" disabled={submitting} style={{
          width: '100%', padding: 14, border: 'none', borderRadius: 14,
          background: '#7C3AED', color: '#fff', fontSize: 15, fontWeight: 600,
          cursor: submitting ? 'default' : 'pointer', opacity: submitting ? 0.6 : 1,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          boxShadow: '0 4px 20px rgba(124,58,237,0.2)', transition: 'opacity 0.15s',
        }}>
          {submitting ? 'Entrando...' : 'Entrar'}
          {!submitting && <ArrowRight size={16} />}
        </button>

        <p style={{ textAlign: 'center', fontSize: 13, color: '#6B7280', marginTop: 20 }}>
          Nao tem conta?{' '}
          <Link to="/register" style={{ color: '#7C3AED', fontWeight: 600, textDecoration: 'none' }}>Cadastre-se</Link>
        </p>
      </form>
    </div>
  );
}
