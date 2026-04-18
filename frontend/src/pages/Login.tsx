import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, getHomeRoute } from '../contexts/AuthContext';
import { ArrowRight, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import Logo from '../components/Logo';

const GRAIN =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='200' height='200' filter='url(%23n)' opacity='0.9'/></svg>";

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
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: "'Figtree', sans-serif", background: '#F5EFE6' }}>
      <style>{`
        @keyframes elia-fadeup { from { opacity:0; transform:translateY(16px) } to { opacity:1; transform:translateY(0) } }
        @keyframes elia-spin { to { transform: rotate(360deg); } }
        .elia-input {
          width: 100%;
          padding: 16px 16px 16px 46px;
          border: 1px solid rgba(20,22,31,0.12);
          border-radius: 2px;
          font-size: 15px;
          font-family: 'Figtree', sans-serif;
          outline: none;
          box-sizing: border-box;
          background: #FDFAF3;
          color: #14161F;
          transition: border-color 0.3s ease, background 0.3s ease;
        }
        .elia-input:focus {
          border-color: #14161F;
          background: #FFFCF5;
        }
        .elia-input::placeholder { color: rgba(20,22,31,0.38); }

        .elia-primary-cta {
          width: 100%;
          padding: 18px;
          border: none;
          border-radius: 2px;
          background: #14161F;
          color: #F5EFE6;
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          font-family: 'Figtree', sans-serif;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          transition: background 0.3s ease;
        }
        .elia-primary-cta:hover:not(:disabled) { background: #D97757; }
        .elia-primary-cta:disabled { opacity: 0.6; cursor: default; }

        .elia-brand-panel { display: none; }

        @media (min-width: 900px) {
          .elia-brand-panel { display: flex; }
          .elia-mobile-brand { display: none !important; }
          .elia-form-wrap { margin-top: 0 !important; }
        }
      `}</style>

      {/* ══════════ LEFT — brand panel (desktop) ══════════ */}
      <div
        className="elia-brand-panel"
        style={{
          flex: 1.05,
          position: 'relative',
          background: '#14161F',
          color: '#F5EFE6',
          alignItems: 'flex-end',
          justifyContent: 'flex-start',
          padding: 'clamp(40px, 5vw, 64px)',
          overflow: 'hidden',
        }}
      >
        {/* Grain */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            opacity: 0.05,
            mixBlendMode: 'overlay',
            backgroundImage: `url("${GRAIN}")`,
          }}
        />
        {/* Aurora glow */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            top: '-30%',
            right: '-20%',
            width: '80%',
            height: '90%',
            background: 'radial-gradient(closest-side, rgba(217,119,87,0.22), transparent 70%)',
            filter: 'blur(60px)',
            pointerEvents: 'none',
          }}
        />
        <div
          aria-hidden
          style={{
            position: 'absolute',
            bottom: '-30%',
            left: '-30%',
            width: '80%',
            height: '90%',
            background: 'radial-gradient(closest-side, rgba(201,169,119,0.16), transparent 70%)',
            filter: 'blur(80px)',
            pointerEvents: 'none',
          }}
        />

        {/* Top brand */}
        <div
          style={{
            position: 'absolute',
            top: 'clamp(32px, 4vw, 48px)',
            left: 'clamp(40px, 5vw, 64px)',
          }}
        >
          <Logo size={28} variant="light" />
        </div>

        {/* Editorial quote block */}
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 560 }}>
          <div
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11,
              letterSpacing: '0.3em',
              textTransform: 'uppercase',
              color: 'rgba(245,239,230,0.6)',
              marginBottom: 24,
            }}
          >
            <span style={{ color: '#D97757' }}>●</span>&nbsp;&nbsp;elia · mov
          </div>
          <h2
            style={{
              fontFamily: "'Fraunces', serif",
              fontSize: 'clamp(2.2rem, 3.6vw, 3.6rem)',
              fontWeight: 300,
              fontVariationSettings: "'opsz' 144, 'SOFT' 60",
              letterSpacing: '-0.03em',
              lineHeight: 1.0,
              color: '#F5EFE6',
              margin: '0 0 28px',
            }}
          >
            Bem-vinda de volta ao seu{' '}
            <span style={{ fontStyle: 'italic', color: '#E89A80' }}>ritmo</span>
            <span aria-hidden style={{ color: '#D97757' }}>.</span>
          </h2>
          <p
            style={{
              fontFamily: "'Figtree', sans-serif",
              fontSize: 16,
              lineHeight: 1.65,
              color: 'rgba(245,239,230,0.72)',
              margin: 0,
              maxWidth: 480,
            }}
          >
            A plataforma aprendeu com seu ciclo desde o primeiro dia. Continue de onde parou.
          </p>
        </div>
      </div>

      {/* ══════════ RIGHT — form ══════════ */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
          background: '#F5EFE6',
          position: 'relative',
        }}
      >
        {/* Mobile brand header */}
        <div
          className="elia-mobile-brand"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 200,
            background: '#14161F',
            color: '#F5EFE6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          <div
            aria-hidden
            style={{
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
              opacity: 0.05,
              mixBlendMode: 'overlay',
              backgroundImage: `url("${GRAIN}")`,
            }}
          />
          <div
            aria-hidden
            style={{
              position: 'absolute',
              top: '-40%',
              right: '-20%',
              width: '80%',
              height: '100%',
              background: 'radial-gradient(closest-side, rgba(217,119,87,0.28), transparent 70%)',
              filter: 'blur(40px)',
            }}
          />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <Logo size={32} variant="light" showSlogan />
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="elia-form-wrap"
          style={{
            width: '100%',
            maxWidth: 440,
            background: '#FDFAF3',
            padding: 'clamp(32px, 4vw, 44px) clamp(28px, 3.5vw, 40px)',
            border: '1px solid rgba(20,22,31,0.08)',
            position: 'relative',
            zIndex: 2,
            marginTop: 160,
            animation: 'elia-fadeup 0.6s cubic-bezier(0.16,1,0.3,1) both',
          }}
        >
          <div style={{ marginBottom: 32 }}>
            <div
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 11,
                letterSpacing: '0.3em',
                textTransform: 'uppercase',
                color: '#D97757',
                marginBottom: 16,
              }}
            >
              Entrar
            </div>
            <h1
              style={{
                fontFamily: "'Fraunces', serif",
                fontSize: 32,
                fontWeight: 400,
                letterSpacing: '-0.025em',
                color: '#14161F',
                margin: '0 0 8px',
                lineHeight: 1.1,
              }}
            >
              Bem-vinda de volta.
            </h1>
            <p
              style={{
                fontFamily: "'Figtree', sans-serif",
                fontSize: 14,
                color: 'rgba(20,22,31,0.62)',
                margin: 0,
                lineHeight: 1.5,
              }}
            >
              Continue sua jornada de onde parou.
            </p>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label
              style={{
                fontFamily: "'Figtree', sans-serif",
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: 'rgba(20,22,31,0.6)',
                display: 'block',
                marginBottom: 10,
              }}
            >
              Email
            </label>
            <div style={{ position: 'relative' }}>
              <Mail
                size={18}
                color="rgba(20,22,31,0.4)"
                style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="você@email.com"
                className="elia-input"
              />
            </div>
          </div>

          <div style={{ marginBottom: 28 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <label
                style={{
                  fontFamily: "'Figtree', sans-serif",
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: 'rgba(20,22,31,0.6)',
                }}
              >
                Senha
              </label>
              <button
                type="button"
                style={{
                  background: 'none',
                  border: 'none',
                  fontFamily: "'Figtree', sans-serif",
                  fontSize: 12,
                  color: '#14161F',
                  fontWeight: 500,
                  cursor: 'pointer',
                  padding: 0,
                  textDecoration: 'underline',
                  textUnderlineOffset: 3,
                }}
              >
                Esqueceu?
              </button>
            </div>
            <div style={{ position: 'relative' }}>
              <Lock
                size={18}
                color="rgba(20,22,31,0.4)"
                style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
              />
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                autoComplete="current-password"
                placeholder="Mínimo 6 caracteres"
                className="elia-input"
                style={{ paddingRight: 48 }}
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                style={{
                  position: 'absolute',
                  right: 14,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'rgba(20,22,31,0.5)',
                  padding: 6,
                }}
              >
                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && (
            <div
              style={{
                background: 'rgba(139,58,47,0.06)',
                color: '#8B3A2F',
                padding: '12px 16px',
                borderLeft: '2px solid #8B3A2F',
                fontSize: 13,
                marginBottom: 20,
                fontFamily: "'Figtree', sans-serif",
                fontWeight: 500,
                lineHeight: 1.5,
              }}
            >
              {error}
            </div>
          )}

          <button type="submit" disabled={submitting} className="elia-primary-cta">
            {submitting ? (
              <>
                <div
                  style={{
                    width: 16,
                    height: 16,
                    border: '2px solid rgba(245,239,230,0.3)',
                    borderTopColor: '#F5EFE6',
                    borderRadius: '50%',
                    animation: 'elia-spin 0.6s linear infinite',
                  }}
                />
                Entrando…
              </>
            ) : (
              <>
                Entrar <ArrowRight size={16} />
              </>
            )}
          </button>

          <div
            style={{
              marginTop: 28,
              paddingTop: 24,
              borderTop: '1px solid rgba(20,22,31,0.1)',
              textAlign: 'center',
              fontFamily: "'Figtree', sans-serif",
              fontSize: 14,
              color: 'rgba(20,22,31,0.62)',
            }}
          >
            Não tem conta?{' '}
            <Link
              to="/register"
              style={{
                color: '#14161F',
                fontWeight: 600,
                textDecoration: 'underline',
                textUnderlineOffset: 3,
                textDecorationColor: '#D97757',
              }}
            >
              Comece em um minuto
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
