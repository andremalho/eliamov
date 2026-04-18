import React from 'react';
import { useNavigate, Link } from 'react-router-dom';

/**
 * elia·mov — Landing
 * Lunar Bloom brand system. Editorial layout. Serif display, sans UI.
 * No gradients-as-crutch. No purple. Ink + Cream + Terracotta signature.
 */

const palette = {
  ink: '#14161F',
  ink2: '#20232F',
  cream: '#F5EFE6',
  parchment: '#FDFAF3',
  creamWarm: '#EEE7DB',
  terracotta: '#D97757',
  terracottaSoft: '#E89A80',
  terracottaDeep: '#B85A3D',
  terracottaPale: '#FBEAE1',
  sage: '#9CA89A',
  brass: '#C9A977',
  brassSoft: '#E3CFA5',
  mutedInk: 'rgba(20,22,31,0.62)',
  hairline: 'rgba(20,22,31,0.12)',
  hairlineDark: 'rgba(245,239,230,0.14)',
};

const GRAIN_DATA_URI =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='200' height='200' filter='url(%23n)' opacity='0.9'/></svg>";

const KEYFRAMES = `
  @keyframes elia-rise {
    0%   { opacity: 0; transform: translateY(18px); }
    100% { opacity: 1; transform: translateY(0); }
  }
  @keyframes elia-draw {
    0%   { stroke-dashoffset: 300; }
    100% { stroke-dashoffset: 0; }
  }
  @keyframes elia-pulse {
    0%, 100% { transform: scale(1); opacity: 1; }
    50%      { transform: scale(1.25); opacity: 0.85; }
  }
  .elia-anim { opacity: 0; animation: elia-rise 1.1s cubic-bezier(0.16,1,0.3,1) forwards; }
  .elia-delay-1 { animation-delay: 0.05s; }
  .elia-delay-2 { animation-delay: 0.2s; }
  .elia-delay-3 { animation-delay: 0.35s; }
  .elia-delay-4 { animation-delay: 0.55s; }
  .elia-delay-5 { animation-delay: 0.75s; }
  .elia-cta { transition: transform 0.4s cubic-bezier(0.16,1,0.3,1), background 0.3s ease, color 0.3s ease, box-shadow 0.3s ease; }
  .elia-cta:hover { transform: translateY(-2px); }
  .elia-card { transition: transform 0.4s cubic-bezier(0.16,1,0.3,1), border-color 0.3s ease; }
  .elia-card:hover { border-color: ${palette.terracotta}; }
  .elia-plan-highlight { transition: transform 0.4s cubic-bezier(0.16,1,0.3,1); }
  .elia-plan-highlight:hover { transform: translateY(-6px); }
  .elia-underline-link:hover { color: ${palette.terracotta}; }
  @media (prefers-reduced-motion: reduce) {
    .elia-anim { opacity: 1; transform: none; animation: none; }
  }
`;

function BrandLockup({ tone = 'dark', size = 32 }: { tone?: 'dark' | 'light'; size?: number }) {
  const fg = tone === 'dark' ? palette.ink : palette.cream;
  const dot = palette.terracotta;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'baseline', color: fg, lineHeight: 1 }}>
      <span
        style={{
          fontFamily: "'Fraunces', serif",
          fontWeight: 450,
          fontVariationSettings: "'opsz' 96, 'SOFT' 40",
          fontSize: size,
          letterSpacing: '-0.035em',
        }}
      >
        elia
      </span>
      <span
        aria-hidden
        style={{
          display: 'inline-block',
          width: Math.round(size * 0.14),
          height: Math.round(size * 0.14),
          margin: `0 ${Math.round(size * 0.22)}px`,
          borderRadius: '50%',
          background: dot,
          transform: `translateY(-${Math.round(size * 0.11)}px)`,
        }}
      />
      <span
        style={{
          fontFamily: "'Figtree', sans-serif",
          fontWeight: 500,
          fontSize: Math.round(size * 0.42),
          letterSpacing: '0.16em',
          textTransform: 'lowercase',
          color: fg,
        }}
      >
        mov
      </span>
    </span>
  );
}

function SectionLabel({ number, children, tone = 'dark' }: { number: string; children: React.ReactNode; tone?: 'dark' | 'light' }) {
  const fg = tone === 'dark' ? palette.mutedInk : 'rgba(245,239,230,0.72)';
  return (
    <div
      className="elia-anim elia-delay-1"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 14,
        fontFamily: "'Figtree', sans-serif",
        fontSize: 11,
        fontWeight: 500,
        letterSpacing: '0.32em',
        textTransform: 'uppercase',
        color: fg,
        marginBottom: 28,
      }}
    >
      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.1em' }}>{number}</span>
      <span
        style={{
          width: 42,
          height: 1,
          background: tone === 'dark' ? palette.hairline : palette.hairlineDark,
        }}
      />
      <span>{children}</span>
    </div>
  );
}

export default function Landing() {
  const navigate = useNavigate();

  return (
    <>
      <style>{KEYFRAMES}</style>
      <div
        style={{
          fontFamily: "'Figtree', sans-serif",
          color: palette.ink,
          background: palette.cream,
          overflowX: 'hidden',
        }}
      >
        {/* ══════════ HERO ══════════ */}
        <section
          style={{
            position: 'relative',
            background: palette.ink,
            color: palette.cream,
            minHeight: '100vh',
            padding: 'clamp(40px, 6vw, 72px) clamp(24px, 5vw, 72px)',
            display: 'flex',
            flexDirection: 'column',
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
              opacity: 0.06,
              mixBlendMode: 'overlay',
              backgroundImage: `url("${GRAIN_DATA_URI}")`,
            }}
          />
          {/* Aurora mesh */}
          <div
            aria-hidden
            style={{
              position: 'absolute',
              top: '-20%',
              right: '-10%',
              width: '60%',
              height: '80%',
              background: `radial-gradient(closest-side, ${palette.terracotta}33, transparent 70%)`,
              filter: 'blur(40px)',
              pointerEvents: 'none',
            }}
          />
          <div
            aria-hidden
            style={{
              position: 'absolute',
              bottom: '-30%',
              left: '-10%',
              width: '55%',
              height: '80%',
              background: `radial-gradient(closest-side, ${palette.brass}1f, transparent 70%)`,
              filter: 'blur(50px)',
              pointerEvents: 'none',
            }}
          />

          {/* Top bar */}
          <header
            style={{
              position: 'relative',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              zIndex: 2,
            }}
            className="elia-anim"
          >
            <BrandLockup tone="light" size={30} />
            <nav style={{ display: 'flex', gap: 28, alignItems: 'center' }}>
              <a
                href="#sobre"
                className="elia-underline-link"
                style={{
                  color: 'rgba(245,239,230,0.75)',
                  fontSize: 13,
                  fontWeight: 500,
                  letterSpacing: '0.08em',
                  textDecoration: 'none',
                  textTransform: 'uppercase',
                }}
              >
                Sobre
              </a>
              <a
                href="#parcerias"
                className="elia-underline-link"
                style={{
                  color: 'rgba(245,239,230,0.75)',
                  fontSize: 13,
                  fontWeight: 500,
                  letterSpacing: '0.08em',
                  textDecoration: 'none',
                  textTransform: 'uppercase',
                }}
              >
                Parcerias
              </a>
              <Link
                to="/login"
                className="elia-underline-link"
                style={{
                  color: palette.cream,
                  fontSize: 13,
                  fontWeight: 500,
                  letterSpacing: '0.08em',
                  textDecoration: 'none',
                  textTransform: 'uppercase',
                  paddingBottom: 2,
                  borderBottom: `1px solid ${palette.hairlineDark}`,
                }}
              >
                Entrar
              </Link>
            </nav>
          </header>

          {/* Hero body */}
          <div
            style={{
              position: 'relative',
              zIndex: 2,
              flex: 1,
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1fr)',
              alignContent: 'center',
              maxWidth: 1280,
              width: '100%',
              margin: '0 auto',
              paddingTop: 'clamp(40px, 8vw, 80px)',
            }}
          >
            <div style={{ maxWidth: 940 }}>
              <SectionLabel number="01" tone="light">
                A ciência do feminino
              </SectionLabel>

              <h1
                className="elia-anim elia-delay-2"
                style={{
                  fontFamily: "'Fraunces', serif",
                  fontSize: 'clamp(3.2rem, 10vw, 8.5rem)',
                  fontWeight: 300,
                  fontVariationSettings: "'opsz' 144, 'SOFT' 60",
                  letterSpacing: '-0.04em',
                  lineHeight: 0.92,
                  color: palette.cream,
                  margin: '0 0 32px',
                }}
              >
                Movimento <br />
                em{' '}
                <span
                  style={{
                    fontStyle: 'italic',
                    fontVariationSettings: "'opsz' 144, 'SOFT' 100",
                    color: palette.terracottaSoft,
                    fontWeight: 300,
                  }}
                >
                  ritmo
                </span>
                <span aria-hidden style={{ color: palette.terracotta }}>.</span>
              </h1>

              <p
                className="elia-anim elia-delay-3"
                style={{
                  fontFamily: "'Figtree', sans-serif",
                  fontSize: 'clamp(1.1rem, 1.8vw, 1.35rem)',
                  lineHeight: 1.55,
                  color: 'rgba(245,239,230,0.82)',
                  maxWidth: 620,
                  margin: '0 0 48px',
                  fontWeight: 400,
                }}
              >
                Treino, nutrição e bem-estar que reconhecem as quatro fases do seu ciclo.
                Baseado em evidência clínica. Guiado por inteligência artificial.
              </p>

              <div
                className="elia-anim elia-delay-4"
                style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center' }}
              >
                <button
                  onClick={() => navigate('/register')}
                  className="elia-cta"
                  style={{
                    padding: '18px 36px',
                    fontFamily: "'Figtree', sans-serif",
                    fontSize: 14,
                    fontWeight: 600,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: palette.ink,
                    background: palette.cream,
                    border: 'none',
                    borderRadius: 2,
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = palette.terracotta)}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = palette.cream)}
                >
                  Começar gratuitamente
                </button>
                <button
                  onClick={() => {
                    const el = document.getElementById('parcerias');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="elia-cta"
                  style={{
                    padding: '18px 32px',
                    fontFamily: "'Figtree', sans-serif",
                    fontSize: 14,
                    fontWeight: 500,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: palette.cream,
                    background: 'transparent',
                    border: `1px solid ${palette.hairlineDark}`,
                    borderRadius: 2,
                    cursor: 'pointer',
                  }}
                >
                  Para parcerias
                </button>
              </div>
            </div>

            {/* Editorial sidebar — stats & signature */}
            <div
              className="elia-anim elia-delay-5"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: 32,
                marginTop: 'clamp(60px, 10vh, 120px)',
                paddingTop: 40,
                borderTop: `1px solid ${palette.hairlineDark}`,
                maxWidth: 940,
              }}
            >
              {[
                { value: '4', label: 'Fases hormonais\nmonitoradas em tempo real' },
                { value: '48+', label: 'Protocolos de treino\nadaptados por ciclo' },
                { value: '94%', label: 'Das usuárias relatam\nmelhora de energia' },
                { value: 'LGPD', label: 'Compliance nativa\npor desenho' },
              ].map((stat, i) => (
                <div key={i}>
                  <div
                    style={{
                      fontFamily: "'Fraunces', serif",
                      fontSize: 36,
                      fontWeight: 400,
                      letterSpacing: '-0.02em',
                      color: palette.cream,
                      lineHeight: 1,
                      marginBottom: 10,
                    }}
                  >
                    {stat.value}
                  </div>
                  <div
                    style={{
                      fontFamily: "'Figtree', sans-serif",
                      fontSize: 12,
                      fontWeight: 400,
                      letterSpacing: '0.02em',
                      color: 'rgba(245,239,230,0.6)',
                      whiteSpace: 'pre-line',
                      lineHeight: 1.5,
                    }}
                  >
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════ FEATURES ══════════ */}
        <section
          id="sobre"
          style={{
            background: palette.cream,
            padding: 'clamp(80px, 12vw, 140px) clamp(24px, 5vw, 72px)',
          }}
        >
          <div style={{ maxWidth: 1280, margin: '0 auto' }}>
            <SectionLabel number="02" tone="dark">
              Pilares da plataforma
            </SectionLabel>
            <h2
              style={{
                fontFamily: "'Fraunces', serif",
                fontSize: 'clamp(2.2rem, 5vw, 3.6rem)',
                fontWeight: 400,
                letterSpacing: '-0.025em',
                color: palette.ink,
                maxWidth: 780,
                margin: '0 0 72px',
                lineHeight: 1.08,
              }}
            >
              Seu corpo opera em ciclo.{' '}
              <span style={{ fontStyle: 'italic', color: palette.terracottaDeep }}>
                O cuidado também deveria.
              </span>
            </h2>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: 0,
                borderTop: `1px solid ${palette.hairline}`,
                borderLeft: `1px solid ${palette.hairline}`,
              }}
            >
              {[
                {
                  k: 'Ciclo inteligente',
                  d: 'Rastreamento preditivo das quatro fases com ajuste contínuo baseado em seus próprios dados.',
                },
                {
                  k: 'Treino adaptativo',
                  d: 'Força, HIIT, yoga e mobilidade prescritos em intensidade coerente com o seu momento hormonal.',
                },
                {
                  k: 'Nutrição sincronizada',
                  d: 'Macronutrientes, micronutrientes e timing de refeições ajustados às exigências de cada fase.',
                },
                {
                  k: 'Saúde mental',
                  d: 'PHQ-9, GAD-7 e detecção de TDPM. Acolhimento com contexto e linha direta com profissionais.',
                },
                {
                  k: 'Integração com wearables',
                  d: 'Oura, Garmin, Apple Health, WHOOP, Polar. Seus dados brutos transformados em direção clara.',
                },
                {
                  k: 'IA Elia',
                  d: 'Coaching conversacional que conhece seu ciclo, medicações, sintomas e trajetória.',
                },
              ].map((f, i) => (
                <article
                  key={i}
                  className="elia-card"
                  style={{
                    padding: 'clamp(28px, 3vw, 40px)',
                    borderRight: `1px solid ${palette.hairline}`,
                    borderBottom: `1px solid ${palette.hairline}`,
                    background: palette.parchment,
                    position: 'relative',
                  }}
                >
                  <div
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 11,
                      letterSpacing: '0.14em',
                      color: palette.terracotta,
                      marginBottom: 28,
                    }}
                  >
                    / {String(i + 1).padStart(2, '0')}
                  </div>
                  <h3
                    style={{
                      fontFamily: "'Fraunces', serif",
                      fontSize: 22,
                      fontWeight: 500,
                      letterSpacing: '-0.015em',
                      color: palette.ink,
                      margin: '0 0 12px',
                      lineHeight: 1.2,
                    }}
                  >
                    {f.k}
                  </h3>
                  <p
                    style={{
                      fontFamily: "'Figtree', sans-serif",
                      fontSize: 14.5,
                      lineHeight: 1.65,
                      color: palette.mutedInk,
                      margin: 0,
                    }}
                  >
                    {f.d}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════ HOW IT WORKS ══════════ */}
        <section
          style={{
            background: palette.creamWarm,
            padding: 'clamp(80px, 12vw, 140px) clamp(24px, 5vw, 72px)',
          }}
        >
          <div style={{ maxWidth: 1120, margin: '0 auto' }}>
            <SectionLabel number="03" tone="dark">
              Como funciona
            </SectionLabel>
            <h2
              style={{
                fontFamily: "'Fraunces', serif",
                fontSize: 'clamp(2rem, 4.5vw, 3.2rem)',
                fontWeight: 400,
                letterSpacing: '-0.025em',
                color: palette.ink,
                margin: '0 0 80px',
                maxWidth: 720,
                lineHeight: 1.1,
              }}
            >
              Em três passos, a plataforma se torna{' '}
              <span style={{ fontStyle: 'italic', color: palette.terracottaDeep }}>sua</span>.
            </h2>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: 48,
                position: 'relative',
              }}
            >
              {[
                {
                  n: '01',
                  t: 'Registre seu ciclo',
                  d: 'Datas, sintomas, medicações, objetivos. A IA aprende seu padrão nos primeiros dias.',
                },
                {
                  n: '02',
                  t: 'Receba seu plano',
                  d: 'Treinos, nutrição e orientações ajustadas à fase em que você está — agora.',
                },
                {
                  n: '03',
                  t: 'Acompanhe a evolução',
                  d: 'Insights longitudinais, detecção de padrões e celebração de cada conquista.',
                },
              ].map((step, i) => (
                <div key={i} style={{ position: 'relative' }}>
                  <div
                    style={{
                      fontFamily: "'Fraunces', serif",
                      fontSize: 72,
                      fontWeight: 300,
                      fontVariationSettings: "'opsz' 144, 'SOFT' 20",
                      letterSpacing: '-0.04em',
                      color: palette.terracotta,
                      lineHeight: 1,
                      marginBottom: 20,
                    }}
                  >
                    {step.n}
                  </div>
                  <h3
                    style={{
                      fontFamily: "'Figtree', sans-serif",
                      fontSize: 18,
                      fontWeight: 600,
                      letterSpacing: '-0.01em',
                      color: palette.ink,
                      margin: '0 0 10px',
                    }}
                  >
                    {step.t}
                  </h3>
                  <p
                    style={{
                      fontFamily: "'Figtree', sans-serif",
                      fontSize: 14.5,
                      lineHeight: 1.65,
                      color: palette.mutedInk,
                      margin: 0,
                      maxWidth: 300,
                    }}
                  >
                    {step.d}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════ TESTIMONIALS ══════════ */}
        <section
          style={{
            background: palette.cream,
            padding: 'clamp(80px, 12vw, 140px) clamp(24px, 5vw, 72px)',
          }}
        >
          <div style={{ maxWidth: 1160, margin: '0 auto' }}>
            <SectionLabel number="04" tone="dark">
              Da comunidade
            </SectionLabel>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: 'clamp(40px, 5vw, 72px)',
                marginTop: 20,
              }}
            >
              {[
                {
                  quote:
                    'Finalmente entendi por que em alguns dias meu treino rendia e em outros não. Elia mudou minha relação com o exercício.',
                  name: 'Camila Mendes',
                  role: 'Triatleta amadora · 32 anos',
                },
                {
                  quote:
                    'A nutrição por fase do ciclo foi um divisor de águas. Menos inchaço, mais energia, zero culpa.',
                  name: 'Fernanda Stein',
                  role: 'Gestora de marketing · 29 anos',
                },
                {
                  quote:
                    'Na menopausa, achei que precisaria parar de treinar pesado. O app me mostrou exatamente o contrário — com rigor científico.',
                  name: 'Ana Lúcia Rocha',
                  role: 'Médica · 51 anos',
                },
              ].map((t, i) => (
                <figure key={i} style={{ margin: 0 }}>
                  <span
                    aria-hidden
                    style={{
                      fontFamily: "'Fraunces', serif",
                      fontSize: 96,
                      fontWeight: 400,
                      fontStyle: 'italic',
                      color: palette.terracotta,
                      lineHeight: 0.6,
                      display: 'block',
                      marginBottom: 16,
                    }}
                  >
                    "
                  </span>
                  <blockquote
                    style={{
                      fontFamily: "'Fraunces', serif",
                      fontSize: 20,
                      fontWeight: 400,
                      lineHeight: 1.45,
                      color: palette.ink,
                      margin: 0,
                      letterSpacing: '-0.008em',
                    }}
                  >
                    {t.quote}
                  </blockquote>
                  <figcaption
                    style={{
                      marginTop: 24,
                      paddingTop: 16,
                      borderTop: `1px solid ${palette.hairline}`,
                    }}
                  >
                    <div
                      style={{
                        fontFamily: "'Figtree', sans-serif",
                        fontSize: 13,
                        fontWeight: 600,
                        color: palette.ink,
                        letterSpacing: '0.02em',
                      }}
                    >
                      {t.name}
                    </div>
                    <div
                      style={{
                        fontFamily: "'Figtree', sans-serif",
                        fontSize: 12,
                        fontWeight: 400,
                        color: palette.mutedInk,
                        marginTop: 2,
                      }}
                    >
                      {t.role}
                    </div>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════ B2B / PARCERIAS ══════════ */}
        <section
          id="parcerias"
          style={{
            position: 'relative',
            background: palette.ink,
            color: palette.cream,
            padding: 'clamp(100px, 14vw, 180px) clamp(24px, 5vw, 72px)',
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
              backgroundImage: `url("${GRAIN_DATA_URI}")`,
            }}
          />
          <div
            aria-hidden
            style={{
              position: 'absolute',
              top: '10%',
              right: '-20%',
              width: '50%',
              height: '80%',
              background: `radial-gradient(closest-side, ${palette.brass}1f, transparent 70%)`,
              filter: 'blur(60px)',
              pointerEvents: 'none',
            }}
          />

          <div
            style={{
              position: 'relative',
              zIndex: 2,
              maxWidth: 1200,
              margin: '0 auto',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: 'clamp(48px, 8vw, 96px)',
              alignItems: 'start',
            }}
          >
            <div>
              <SectionLabel number="05" tone="light">
                Parcerias estratégicas
              </SectionLabel>
              <h2
                style={{
                  fontFamily: "'Fraunces', serif",
                  fontSize: 'clamp(2.4rem, 5vw, 4rem)',
                  fontWeight: 400,
                  letterSpacing: '-0.03em',
                  color: palette.cream,
                  margin: '0 0 32px',
                  lineHeight: 1.05,
                }}
              >
                White-label para academias, clínicas e redes{' '}
                <span style={{ fontStyle: 'italic', color: palette.brass }}>wellness</span>.
              </h2>
              <p
                style={{
                  fontFamily: "'Figtree', sans-serif",
                  fontSize: 17,
                  lineHeight: 1.6,
                  color: 'rgba(245,239,230,0.72)',
                  margin: '0 0 40px',
                  maxWidth: 520,
                }}
              >
                Ofereça inteligência cíclica com a sua marca. Mesma infraestrutura, mesma
                ciência, sua identidade visual e sua base de alunas.
              </p>
              <a
                href="mailto:parcerias@elia.health?subject=Parceria%20elia%C2%B7mov"
                className="elia-cta"
                style={{
                  display: 'inline-block',
                  padding: '18px 36px',
                  fontFamily: "'Figtree', sans-serif",
                  fontSize: 13,
                  fontWeight: 600,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: palette.ink,
                  background: palette.cream,
                  textDecoration: 'none',
                  borderRadius: 2,
                }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = palette.terracotta)}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = palette.cream)}
              >
                Falar com parcerias
              </a>
            </div>

            <ul
              style={{
                listStyle: 'none',
                margin: 0,
                padding: 0,
                borderTop: `1px solid ${palette.hairlineDark}`,
              }}
            >
              {[
                'Painel administrativo com gestão completa de alunas',
                'Marca personalizada: logo, paleta, domínio dedicado',
                'Integração com sistemas de gestão existentes',
                'Relatórios de engajamento, retenção e saúde coletiva',
                'Onboarding dedicado e suporte prioritário',
                'Compliance LGPD por desenho, auditoria granular',
              ].map((item, i) => (
                <li
                  key={i}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '40px 1fr',
                    gap: 16,
                    padding: '20px 0',
                    borderBottom: `1px solid ${palette.hairlineDark}`,
                    alignItems: 'baseline',
                  }}
                >
                  <span
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 11,
                      color: palette.terracotta,
                      letterSpacing: '0.1em',
                    }}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span
                    style={{
                      fontFamily: "'Figtree', sans-serif",
                      fontSize: 15,
                      lineHeight: 1.55,
                      color: 'rgba(245,239,230,0.88)',
                    }}
                  >
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ══════════ PRICING ══════════ */}
        <section
          style={{
            background: palette.cream,
            padding: 'clamp(80px, 12vw, 140px) clamp(24px, 5vw, 72px)',
          }}
        >
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <SectionLabel number="06" tone="dark">
              Planos
            </SectionLabel>
            <h2
              style={{
                fontFamily: "'Fraunces', serif",
                fontSize: 'clamp(2.2rem, 5vw, 3.6rem)',
                fontWeight: 400,
                letterSpacing: '-0.025em',
                color: palette.ink,
                margin: '0 0 60px',
                maxWidth: 700,
                lineHeight: 1.08,
              }}
            >
              Comece grátis. Expanda quando o ritmo pedir.
            </h2>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: 24,
              }}
            >
              {[
                {
                  name: 'Início',
                  price: 'R$ 0',
                  period: 'para sempre',
                  features: [
                    'Registro de ciclo',
                    '3 treinos semanais',
                    'Conteúdo educacional',
                    'Acesso à comunidade',
                  ],
                  cta: 'Começar grátis',
                  highlighted: false,
                },
                {
                  name: 'Ritmo',
                  price: 'R$ 29,90',
                  period: '/mês',
                  features: [
                    'Tudo do plano Início',
                    'IA Elia ilimitada',
                    'Integração com wearables',
                    'Nutrição personalizada',
                    'Treinos ilimitados',
                    'Insights avançados',
                  ],
                  cta: 'Assinar Ritmo',
                  highlighted: true,
                },
                {
                  name: 'Clínica',
                  price: 'R$ 49,90',
                  period: '/mês',
                  features: [
                    'Tudo do plano Ritmo',
                    'Teleconsulta com especialistas',
                    'Integração com elia·health',
                    'Análise de exames por IA',
                    'Suporte prioritário',
                  ],
                  cta: 'Assinar Clínica',
                  highlighted: false,
                },
              ].map((plan, i) => (
                <div
                  key={i}
                  className={plan.highlighted ? 'elia-plan-highlight' : 'elia-card'}
                  style={{
                    background: plan.highlighted ? palette.ink : palette.parchment,
                    color: plan.highlighted ? palette.cream : palette.ink,
                    border: plan.highlighted ? `1px solid ${palette.brass}` : `1px solid ${palette.hairline}`,
                    padding: 'clamp(28px, 3vw, 40px)',
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  {plan.highlighted && (
                    <div
                      style={{
                        position: 'absolute',
                        top: -12,
                        left: 'clamp(28px, 3vw, 40px)',
                        background: palette.brass,
                        color: palette.ink,
                        padding: '6px 14px',
                        fontFamily: "'Figtree', sans-serif",
                        fontSize: 10,
                        fontWeight: 600,
                        letterSpacing: '0.2em',
                        textTransform: 'uppercase',
                      }}
                    >
                      Recomendado
                    </div>
                  )}

                  <div
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 11,
                      letterSpacing: '0.2em',
                      textTransform: 'uppercase',
                      color: plan.highlighted ? palette.brass : palette.terracotta,
                      marginBottom: 28,
                    }}
                  >
                    Plano {String(i + 1).padStart(2, '0')}
                  </div>

                  <h3
                    style={{
                      fontFamily: "'Fraunces', serif",
                      fontSize: 32,
                      fontWeight: 450,
                      letterSpacing: '-0.02em',
                      margin: '0 0 24px',
                      color: 'inherit',
                    }}
                  >
                    {plan.name}
                  </h3>

                  <div style={{ marginBottom: 32, display: 'flex', alignItems: 'baseline', gap: 6 }}>
                    <span
                      style={{
                        fontFamily: "'Fraunces', serif",
                        fontSize: 44,
                        fontWeight: 400,
                        letterSpacing: '-0.025em',
                      }}
                    >
                      {plan.price}
                    </span>
                    <span
                      style={{
                        fontFamily: "'Figtree', sans-serif",
                        fontSize: 14,
                        opacity: 0.6,
                      }}
                    >
                      {plan.period}
                    </span>
                  </div>

                  <ul
                    style={{
                      listStyle: 'none',
                      padding: 0,
                      margin: '0 0 36px',
                      borderTop: `1px solid ${plan.highlighted ? palette.hairlineDark : palette.hairline}`,
                      flex: 1,
                    }}
                  >
                    {plan.features.map((f, fi) => (
                      <li
                        key={fi}
                        style={{
                          display: 'flex',
                          alignItems: 'baseline',
                          gap: 12,
                          padding: '14px 0',
                          borderBottom: `1px solid ${plan.highlighted ? palette.hairlineDark : palette.hairline}`,
                          fontFamily: "'Figtree', sans-serif",
                          fontSize: 14,
                          lineHeight: 1.5,
                        }}
                      >
                        <span
                          aria-hidden
                          style={{
                            width: 5,
                            height: 5,
                            borderRadius: '50%',
                            background: plan.highlighted ? palette.brass : palette.terracotta,
                            flexShrink: 0,
                            transform: 'translateY(-1px)',
                          }}
                        />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => navigate('/register')}
                    className="elia-cta"
                    style={{
                      padding: '16px 24px',
                      fontFamily: "'Figtree', sans-serif",
                      fontSize: 13,
                      fontWeight: 600,
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      background: plan.highlighted ? palette.cream : palette.ink,
                      color: plan.highlighted ? palette.ink : palette.cream,
                      border: 'none',
                      borderRadius: 2,
                      cursor: 'pointer',
                      width: '100%',
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.background = plan.highlighted
                        ? palette.brass
                        : palette.terracotta;
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.background = plan.highlighted
                        ? palette.cream
                        : palette.ink;
                    }}
                  >
                    {plan.cta}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════ FINAL CTA ══════════ */}
        <section
          style={{
            background: palette.creamWarm,
            padding: 'clamp(100px, 16vw, 180px) clamp(24px, 5vw, 72px)',
            textAlign: 'center',
          }}
        >
          <h2
            style={{
              fontFamily: "'Fraunces', serif",
              fontSize: 'clamp(2.6rem, 6vw, 5rem)',
              fontWeight: 300,
              fontVariationSettings: "'opsz' 144, 'SOFT' 60",
              letterSpacing: '-0.035em',
              color: palette.ink,
              maxWidth: 820,
              margin: '0 auto 32px',
              lineHeight: 0.98,
            }}
          >
            Sua jornada começa{' '}
            <span style={{ fontStyle: 'italic', color: palette.terracottaDeep }}>agora</span>
            <span aria-hidden style={{ color: palette.terracotta }}>.</span>
          </h2>
          <p
            style={{
              fontFamily: "'Figtree', sans-serif",
              fontSize: 17,
              lineHeight: 1.6,
              color: palette.mutedInk,
              maxWidth: 540,
              margin: '0 auto 48px',
            }}
          >
            Junte-se a milhares de mulheres que treinam em ritmo com o próprio corpo.
          </p>
          <button
            onClick={() => navigate('/register')}
            className="elia-cta"
            style={{
              padding: '20px 44px',
              fontFamily: "'Figtree', sans-serif",
              fontSize: 14,
              fontWeight: 600,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: palette.cream,
              background: palette.ink,
              border: 'none',
              borderRadius: 2,
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = palette.terracotta)}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = palette.ink)}
          >
            Criar minha conta
          </button>
        </section>

        {/* ══════════ FOOTER ══════════ */}
        <footer
          style={{
            background: palette.ink,
            color: 'rgba(245,239,230,0.7)',
            padding: 'clamp(60px, 8vw, 96px) clamp(24px, 5vw, 72px) 48px',
          }}
        >
          <div
            style={{
              maxWidth: 1280,
              margin: '0 auto',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: 48,
            }}
          >
            <div>
              <BrandLockup tone="light" size={32} />
              <p
                style={{
                  fontFamily: "'Fraunces', serif",
                  fontStyle: 'italic',
                  fontSize: 16,
                  color: 'rgba(245,239,230,0.55)',
                  margin: '24px 0 0',
                  maxWidth: 280,
                  lineHeight: 1.4,
                }}
              >
                A ciência do feminino, em movimento.
              </p>
            </div>

            <div>
              <div
                style={{
                  fontFamily: "'Figtree', sans-serif",
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  color: 'rgba(245,239,230,0.5)',
                  marginBottom: 18,
                }}
              >
                Produto
              </div>
              {[
                { label: 'Entrar', href: '/login' },
                { label: 'Criar conta', href: '/register' },
                { label: 'Parcerias', href: '#parcerias' },
              ].map((l) => (
                <a
                  key={l.label}
                  href={l.href}
                  className="elia-underline-link"
                  style={{
                    display: 'block',
                    fontFamily: "'Figtree', sans-serif",
                    fontSize: 14,
                    color: 'rgba(245,239,230,0.85)',
                    textDecoration: 'none',
                    padding: '6px 0',
                  }}
                >
                  {l.label}
                </a>
              ))}
            </div>

            <div>
              <div
                style={{
                  fontFamily: "'Figtree', sans-serif",
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  color: 'rgba(245,239,230,0.5)',
                  marginBottom: 18,
                }}
              >
                Legal
              </div>
              {[
                { label: 'Termos', href: '/termos' },
                { label: 'Privacidade', href: '/privacidade' },
                { label: 'LGPD', href: '/lgpd' },
              ].map((l) => (
                <a
                  key={l.label}
                  href={l.href}
                  className="elia-underline-link"
                  style={{
                    display: 'block',
                    fontFamily: "'Figtree', sans-serif",
                    fontSize: 14,
                    color: 'rgba(245,239,230,0.85)',
                    textDecoration: 'none',
                    padding: '6px 0',
                  }}
                >
                  {l.label}
                </a>
              ))}
            </div>

            <div>
              <div
                style={{
                  fontFamily: "'Figtree', sans-serif",
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  color: 'rgba(245,239,230,0.5)',
                  marginBottom: 18,
                }}
              >
                Ecossistema
              </div>
              <p
                style={{
                  fontFamily: "'Figtree', sans-serif",
                  fontSize: 13,
                  color: 'rgba(245,239,230,0.65)',
                  lineHeight: 1.6,
                  margin: 0,
                }}
              >
                Parte da suíte <span style={{ color: palette.cream, fontWeight: 500 }}>elia</span>,
                ao lado de <span style={{ color: palette.cream, fontWeight: 500 }}>elia·health</span> — o prontuário
                clínico exclusivo da mulher.
              </p>
            </div>
          </div>

          <div
            style={{
              maxWidth: 1280,
              margin: '72px auto 0',
              paddingTop: 32,
              borderTop: `1px solid ${palette.hairlineDark}`,
              display: 'flex',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 16,
              fontFamily: "'Figtree', sans-serif",
              fontSize: 12,
              color: 'rgba(245,239,230,0.45)',
            }}
          >
            <span>© {new Date().getFullYear()} elia. Todos os direitos reservados.</span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.14em' }}>
              FEITO NO BRASIL
            </span>
          </div>
        </footer>
      </div>
    </>
  );
}
