import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, getHomeRoute } from '../contexts/AuthContext';
import { ArrowRight, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import Logo from '../components/Logo';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
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
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(24px) } to { opacity:1; transform:translateY(0) } }
        @keyframes shimmer { 0% { background-position:-200% 0 } 100% { background-position:200% 0 } }
        .login-input { width:100%; padding:14px 16px 14px 44px; border:1.5px solid #E5E7EB; border-radius:14px; font-size:15px; font-family:'DM Sans',sans-serif; outline:none; box-sizing:border-box; background:#FAFAFE; transition:border-color 0.2s, box-shadow 0.2s; }
        .login-input:focus { border-color:#7C3AED; box-shadow:0 0 0 3px rgba(124,58,237,0.1); background:#fff; }
        .login-input::placeholder { color:#9CA3AF; }
        .login-btn { width:100%; padding:16px; border:none; border-radius:14px; background:linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%); color:#fff; font-size:16px; font-weight:700; font-family:'DM Sans',sans-serif; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px; box-shadow:0 4px 20px rgba(124,58,237,0.3); transition:transform 0.15s, box-shadow 0.15s; }
        .login-btn:hover:not(:disabled) { transform:translateY(-1px); box-shadow:0 6px 28px rgba(124,58,237,0.4); }
        .login-btn:active:not(:disabled) { transform:translateY(0); }
        .login-btn:disabled { opacity:0.7; cursor:default; }
      `}</style>

      {/* Left panel - brand */}
      <div style={{
        flex: 1, display: 'none',
        background: 'linear-gradient(135deg, #2D1B4E 0%, #4C1D95 40%, #7C3AED 100%)',
        position: 'relative', overflow: 'hidden',
        alignItems: 'center', justifyContent: 'center',
      }}>
        {/* Decorative circles */}
        <div style={{ position: 'absolute', top: '10%', left: '-5%', width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,0.03)' }} />
        <div style={{ position: 'absolute', bottom: '15%', right: '-10%', width: 400, height: 400, borderRadius: '50%', background: 'rgba(255,255,255,0.02)' }} />
        <div style={{ position: 'absolute', top: '50%', left: '30%', width: 150, height: 150, borderRadius: '50%', background: 'rgba(236,72,153,0.08)' }} />
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: 40 }}>
          <Logo size={48} variant="light" showSlogan />
          <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.7)', marginTop: 24, lineHeight: 1.6, maxWidth: 320 }}>
            Sua jornada de saude e bem-estar comeca aqui.
          </p>
        </div>
      </div>

      {/* Right panel - form */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24,
        background: 'linear-gradient(180deg, #F8F7FC 0%, #fff 50%)',
        position: 'relative',
      }}>
        {/* Mobile brand area */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 220, background: 'linear-gradient(135deg, #2D1B4E 0%, #4C1D95 40%, #7C3AED 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
          <div style={{ position: 'absolute', bottom: -30, left: -30, width: 140, height: 140, borderRadius: '50%', background: 'rgba(236,72,153,0.06)' }} />
          <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
            <Logo size={40} variant="light" showSlogan />
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{
          width: '100%', maxWidth: 400,
          background: '#fff', borderRadius: 24,
          padding: '36px 28px 32px',
          boxShadow: '0 8px 40px rgba(45,27,78,0.1)',
          border: '1px solid rgba(124,58,237,0.06)',
          position: 'relative', zIndex: 2,
          marginTop: 100,
          animation: 'fadeUp 0.5s ease-out',
        }}>
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 26, fontWeight: 600, color: '#2D1B4E', margin: '0 0 6px' }}>
              Bem-vinda de volta
            </h1>
            <p style={{ fontSize: 14, color: '#6B7280', margin: 0 }}>Entre na sua conta para continuar</p>
          </div>

          <div style={{ marginBottom: 18 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 8 }}>Email</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} color="#9CA3AF" style={{ position: 'absolute', left: 14, top: 14, pointerEvents: 'none' }} />
              <input
                type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                required autoComplete="email" placeholder="seu@email.com"
                className="login-input"
              />
            </div>
          </div>

          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>Senha</label>
              <button type="button" style={{ background: 'none', border: 'none', fontSize: 12, color: '#7C3AED', fontWeight: 600, cursor: 'pointer', padding: 0 }}>
                Esqueceu?
              </button>
            </div>
            <div style={{ position: 'relative' }}>
              <Lock size={18} color="#9CA3AF" style={{ position: 'absolute', left: 14, top: 14, pointerEvents: 'none' }} />
              <input
                type={showPw ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
                required minLength={6} autoComplete="current-password" placeholder="Min. 6 caracteres"
                className="login-input"
                style={{ paddingRight: 44 }}
              />
              <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: 14, top: 13, background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', padding: 0 }}>
                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && (
            <div style={{
              background: '#FEF2F2', color: '#DC2626', padding: '12px 16px',
              borderRadius: 12, fontSize: 13, marginBottom: 18, fontWeight: 500,
              border: '1px solid #FECACA',
            }}>{error}</div>
          )}

          <button type="submit" disabled={submitting} className="login-btn">
            {submitting ? (
              <>
                <div style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
                Entrando...
              </>
            ) : (
              <>Entrar <ArrowRight size={18} /></>
            )}
          </button>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '24px 0' }}>
            <div style={{ flex: 1, height: 1, background: '#E5E7EB' }} />
            <span style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 500 }}>ou</span>
            <div style={{ flex: 1, height: 1, background: '#E5E7EB' }} />
          </div>

          <p style={{ textAlign: 'center', fontSize: 14, color: '#6B7280', margin: 0 }}>
            Nao tem conta?{' '}
            <Link to="/register" style={{ color: '#7C3AED', fontWeight: 700, textDecoration: 'none' }}>Cadastre-se gratis</Link>
          </p>
        </form>

        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <style>{`@media(min-width:768px) {
          form { margin-top: 0 !important; }
          div[style*="position: absolute"][style*="height: 220px"] { display: none !important; }
          div[style*="display: none"][style*="flex: 1"] { display: flex !important; }
        }`}</style>
      </div>
    </div>
  );
}
