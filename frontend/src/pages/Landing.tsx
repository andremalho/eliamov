import React from 'react';
import { useNavigate, Link } from 'react-router-dom';

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=DM+Sans:wght@400;500;600;700&display=swap');`;

const colors = {
  deepPurple: '#2D1B4E',
  violet: '#7C3AED',
  violetLight: '#A78BFA',
  violetFaint: '#EDE9FE',
  white: '#FFFFFF',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray300: '#D1D5DB',
  gray500: '#6B7280',
  gray700: '#374151',
  gray900: '#111827',
};

export default function Landing() {
  const navigate = useNavigate();

  return (
    <>
      <style>{FONTS}</style>
      <div style={{ fontFamily: "'DM Sans', sans-serif", color: colors.gray900, overflowX: 'hidden' as const }}>

        {/* ─── HERO ─── */}
        <section style={{
          background: `linear-gradient(135deg, ${colors.deepPurple} 0%, ${colors.violet} 100%)`,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column' as const,
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center' as const,
          padding: '60px 24px',
          position: 'relative' as const,
        }}>
          <h1 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 'clamp(3rem, 8vw, 5.5rem)',
            fontWeight: 700,
            color: colors.white,
            margin: 0,
            lineHeight: 1.1,
          }}>
            eliaMov
          </h1>
          <p style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 'clamp(1.1rem, 3vw, 1.5rem)',
            color: colors.violetLight,
            marginTop: 12,
            fontWeight: 400,
            letterSpacing: '0.05em',
          }}>
            Movimento inteligente. Vida ativa.
          </p>
          <p style={{
            fontSize: 'clamp(1rem, 2.5vw, 1.25rem)',
            color: 'rgba(255,255,255,0.85)',
            maxWidth: 560,
            marginTop: 24,
            lineHeight: 1.7,
          }}>
            Treino, nutricao e bem-estar sincronizados com o seu ciclo menstrual.
            Potencializado por inteligencia artificial.
          </p>
          <button
            onClick={() => navigate('/register')}
            style={{
              marginTop: 40,
              padding: '16px 48px',
              fontSize: '1.1rem',
              fontWeight: 600,
              color: colors.deepPurple,
              background: colors.white,
              border: 'none',
              borderRadius: 50,
              cursor: 'pointer',
              boxShadow: '0 4px 24px rgba(124,58,237,0.3)',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
            onMouseEnter={e => { (e.target as HTMLElement).style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { (e.target as HTMLElement).style.transform = 'translateY(0)'; }}
          >
            Comece gratis
          </button>
          <Link to="/login" style={{
            color: 'rgba(255,255,255,0.7)',
            marginTop: 16,
            fontSize: '0.95rem',
            textDecoration: 'none',
          }}>
            Ja tem conta? <span style={{ textDecoration: 'underline' }}>Entrar</span>
          </Link>
        </section>

        {/* ─── FEATURES ─── */}
        <section style={{
          padding: '100px 24px',
          background: colors.white,
        }}>
          <h2 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
            fontWeight: 700,
            textAlign: 'center' as const,
            color: colors.deepPurple,
            marginBottom: 60,
          }}>
            Tudo que voce precisa, num so lugar
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 32,
            maxWidth: 1100,
            margin: '0 auto',
          }}>
            {[
              { icon: '\uD83D\uDCA7', title: 'Ciclo inteligente', desc: 'Registre e acompanhe seu ciclo com previsoes baseadas em IA.' },
              { icon: '\uD83C\uDFCB\uFE0F\u200D\u2640\uFE0F', title: 'Treino adaptativo', desc: 'Treinos personalizados que se ajustam a cada fase hormonal.' },
              { icon: '\uD83C\uDF4E', title: 'Nutricao personalizada', desc: 'Planos alimentares sincronizados com seu ciclo e objetivos.' },
              { icon: '\uD83E\uDDE0', title: 'IA Coach Elia', desc: 'Sua treinadora virtual que entende seu corpo e seus dados.' },
            ].map((f, i) => (
              <div key={i} style={{
                background: colors.violetFaint,
                borderRadius: 20,
                padding: '40px 28px',
                textAlign: 'center' as const,
                transition: 'transform 0.2s',
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; }}
              >
                <div style={{ fontSize: '2.5rem', marginBottom: 16 }}>{f.icon}</div>
                <h3 style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '1.15rem',
                  fontWeight: 700,
                  color: colors.deepPurple,
                  marginBottom: 8,
                }}>
                  {f.title}
                </h3>
                <p style={{ color: colors.gray500, fontSize: '0.95rem', lineHeight: 1.6, margin: 0 }}>
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ─── HOW IT WORKS ─── */}
        <section style={{
          padding: '100px 24px',
          background: colors.gray50,
        }}>
          <h2 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
            fontWeight: 700,
            textAlign: 'center' as const,
            color: colors.deepPurple,
            marginBottom: 60,
          }}>
            Como funciona
          </h2>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap' as const,
            justifyContent: 'center',
            gap: 48,
            maxWidth: 900,
            margin: '0 auto',
          }}>
            {[
              { step: '1', title: 'Registre seu ciclo', desc: 'Informe suas datas e sintomas. A IA aprende seu padrao.' },
              { step: '2', title: 'Receba treinos personalizados', desc: 'Treinos, nutricao e dicas adaptados a sua fase atual.' },
              { step: '3', title: 'Acompanhe sua evolucao', desc: 'Veja metricas, insights e celebre cada conquista.' },
            ].map((s, i) => (
              <div key={i} style={{ textAlign: 'center' as const, flex: '1 1 220px', maxWidth: 260 }}>
                <div style={{
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${colors.deepPurple}, ${colors.violet})`,
                  color: colors.white,
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px',
                }}>
                  {s.step}
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: colors.deepPurple, marginBottom: 8 }}>
                  {s.title}
                </h3>
                <p style={{ color: colors.gray500, fontSize: '0.9rem', lineHeight: 1.6, margin: 0 }}>
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ─── TESTIMONIALS ─── */}
        <section style={{
          padding: '100px 24px',
          background: colors.white,
        }}>
          <h2 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
            fontWeight: 700,
            textAlign: 'center' as const,
            color: colors.deepPurple,
            marginBottom: 60,
          }}>
            O que dizem nossas usuarias
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 32,
            maxWidth: 1000,
            margin: '0 auto',
          }}>
            {[
              { initials: 'CM', name: 'Camila M.', text: 'Finalmente entendi por que alguns dias meu treino rendia e outros nao. O eliaMov mudou minha relacao com o exercicio.' },
              { initials: 'FS', name: 'Fernanda S.', text: 'A nutricao por fase do ciclo foi um divisor de aguas. Menos inchaço, mais energia e zero culpa.' },
              { initials: 'AL', name: 'Ana Lucia R.', text: 'Na menopausa achei que ia ter que parar de treinar pesado. O app me mostrou que e exatamente o contrario.' },
            ].map((t, i) => (
              <div key={i} style={{
                background: colors.violetFaint,
                borderRadius: 20,
                padding: '32px 28px',
                position: 'relative' as const,
              }}>
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${colors.deepPurple}, ${colors.violet})`,
                  color: colors.white,
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 16,
                }}>
                  {t.initials}
                </div>
                <p style={{
                  fontStyle: 'italic',
                  color: colors.gray700,
                  fontSize: '0.95rem',
                  lineHeight: 1.7,
                  margin: '0 0 16px',
                }}>
                  "{t.text}"
                </p>
                <p style={{ fontWeight: 600, color: colors.deepPurple, fontSize: '0.9rem', margin: 0 }}>
                  {t.name}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ─── B2B / ACADEMIES ─── */}
        <section style={{
          padding: '100px 24px',
          background: `linear-gradient(135deg, ${colors.deepPurple} 0%, ${colors.violet} 100%)`,
          color: colors.white,
        }}>
          <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' as const }}>
            <h2 style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
              fontWeight: 700,
              marginBottom: 16,
            }}>
              White label para sua academia
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.05rem', marginBottom: 40, lineHeight: 1.7 }}>
              Ofereça treino inteligente baseado no ciclo menstrual com a marca da sua academia.
            </p>
            <div style={{ textAlign: 'left' as const, maxWidth: 480, margin: '0 auto' }}>
              {[
                'Painel administrativo completo para gestao de alunas',
                'Marca personalizada (logo, cores, dominio)',
                'Integracao com sistemas de gestao existentes',
                'Relatorios de engajamento e retencao',
                'Suporte prioritario e onboarding dedicado',
                'Conteudo exclusivo para seu publico',
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 16 }}>
                  <span style={{ color: colors.violetLight, fontSize: '1.2rem', lineHeight: 1 }}>&#10003;</span>
                  <span style={{ fontSize: '0.95rem', lineHeight: 1.5 }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── PRICING ─── */}
        <section style={{
          padding: '100px 24px',
          background: colors.gray50,
        }}>
          <h2 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
            fontWeight: 700,
            textAlign: 'center' as const,
            color: colors.deepPurple,
            marginBottom: 60,
          }}>
            Planos
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 28,
            maxWidth: 1000,
            margin: '0 auto',
          }}>
            {[
              {
                name: 'Free',
                price: 'R$0',
                period: 'para sempre',
                features: ['Registro de ciclo basico', '3 treinos por semana', 'Conteudo educativo', 'Comunidade'],
                highlighted: false,
              },
              {
                name: 'Premium',
                price: 'R$29,90',
                period: '/mes',
                features: ['Tudo do Free', 'IA Coach Elia ilimitada', 'Integracao com wearables', 'Nutricao personalizada', 'Treinos ilimitados', 'Insights avancados'],
                highlighted: true,
              },
              {
                name: 'Plus',
                price: 'R$49,90',
                period: '/mes',
                features: ['Tudo do Premium', 'Teleconsulta com profissionais', 'Integracao medica', 'Analise de exames laboratoriais', 'Suporte prioritario'],
                highlighted: false,
              },
            ].map((plan, i) => (
              <div key={i} style={{
                background: plan.highlighted ? `linear-gradient(135deg, ${colors.deepPurple}, ${colors.violet})` : colors.white,
                color: plan.highlighted ? colors.white : colors.gray900,
                borderRadius: 24,
                padding: '40px 32px',
                textAlign: 'center' as const,
                border: plan.highlighted ? 'none' : `1px solid ${colors.gray300}`,
                position: 'relative' as const,
                transform: plan.highlighted ? 'scale(1.05)' : 'none',
                boxShadow: plan.highlighted ? '0 20px 60px rgba(124,58,237,0.25)' : 'none',
              }}>
                {plan.highlighted && (
                  <div style={{
                    position: 'absolute' as const,
                    top: -14,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: colors.violetLight,
                    color: colors.white,
                    padding: '4px 20px',
                    borderRadius: 20,
                    fontSize: '0.8rem',
                    fontWeight: 600,
                  }}>
                    Mais popular
                  </div>
                )}
                <h3 style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '1.2rem',
                  fontWeight: 700,
                  marginBottom: 8,
                }}>
                  {plan.name}
                </h3>
                <div style={{ marginBottom: 24 }}>
                  <span style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: '2.5rem',
                    fontWeight: 700,
                  }}>
                    {plan.price}
                  </span>
                  <span style={{
                    fontSize: '0.9rem',
                    opacity: 0.7,
                    marginLeft: 4,
                  }}>
                    {plan.period}
                  </span>
                </div>
                <div style={{ textAlign: 'left' as const, marginBottom: 32 }}>
                  {plan.features.map((feat, fi) => (
                    <div key={fi} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                      <span style={{ color: plan.highlighted ? colors.violetLight : colors.violet, fontSize: '1rem' }}>&#10003;</span>
                      <span style={{ fontSize: '0.9rem' }}>{feat}</span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => navigate('/register')}
                  style={{
                    width: '100%',
                    padding: '14px 0',
                    borderRadius: 50,
                    border: plan.highlighted ? `2px solid ${colors.white}` : `2px solid ${colors.violet}`,
                    background: plan.highlighted ? 'rgba(255,255,255,0.15)' : 'transparent',
                    color: plan.highlighted ? colors.white : colors.violet,
                    fontWeight: 600,
                    fontSize: '0.95rem',
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                  }}
                  onMouseEnter={e => { (e.target as HTMLElement).style.background = plan.highlighted ? 'rgba(255,255,255,0.25)' : colors.violetFaint; }}
                  onMouseLeave={e => { (e.target as HTMLElement).style.background = plan.highlighted ? 'rgba(255,255,255,0.15)' : 'transparent'; }}
                >
                  Comecar agora
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* ─── FINAL CTA ─── */}
        <section style={{
          padding: '100px 24px',
          background: colors.white,
          textAlign: 'center' as const,
        }}>
          <h2 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
            fontWeight: 700,
            color: colors.deepPurple,
            marginBottom: 16,
          }}>
            Sua jornada comeca agora
          </h2>
          <p style={{
            color: colors.gray500,
            fontSize: '1.05rem',
            maxWidth: 500,
            margin: '0 auto 40px',
            lineHeight: 1.7,
          }}>
            Junte-se a milhares de mulheres que ja treinam de forma inteligente, respeitando seu corpo e seu ciclo.
          </p>
          <button
            onClick={() => navigate('/register')}
            style={{
              padding: '16px 48px',
              fontSize: '1.1rem',
              fontWeight: 600,
              color: colors.white,
              background: `linear-gradient(135deg, ${colors.deepPurple}, ${colors.violet})`,
              border: 'none',
              borderRadius: 50,
              cursor: 'pointer',
              boxShadow: '0 4px 24px rgba(124,58,237,0.3)',
              transition: 'transform 0.2s',
            }}
            onMouseEnter={e => { (e.target as HTMLElement).style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { (e.target as HTMLElement).style.transform = 'translateY(0)'; }}
          >
            Criar minha conta gratis
          </button>
        </section>

        {/* ─── FOOTER ─── */}
        <footer style={{
          padding: '48px 24px',
          background: colors.deepPurple,
          color: 'rgba(255,255,255,0.7)',
          textAlign: 'center' as const,
        }}>
          <h3 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: '1.5rem',
            fontWeight: 700,
            color: colors.white,
            margin: '0 0 8px',
          }}>
            eliaMov
          </h3>
          <p style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: '0.95rem',
            color: colors.violetLight,
            margin: '0 0 24px',
            letterSpacing: '0.04em',
          }}>
            Movimento inteligente. Vida ativa.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginBottom: 24 }}>
            <a href="/termos" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: '0.85rem' }}>Termos</a>
            <a href="/privacidade" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: '0.85rem' }}>Privacidade</a>
          </div>
          <p style={{ fontSize: '0.8rem', margin: 0, color: 'rgba(255,255,255,0.4)' }}>
            &copy; {new Date().getFullYear()} eliaMov. Todos os direitos reservados.
          </p>
        </footer>
      </div>
    </>
  );
}
