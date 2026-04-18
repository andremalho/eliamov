import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

interface WelcomeStepProps {
  profileType: string;
  onFinish: () => void;
}

const particleStyles = `
  @keyframes ob-float {
    0% { transform: translateY(0) scale(1); opacity: 0; }
    20% { opacity: 0.6; }
    80% { opacity: 0.4; }
    100% { transform: translateY(-120px) scale(0.5); opacity: 0; }
  }
  .ob-welcome-screen {
    min-height: 100vh;
    background: #F9FAFB;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
  }
  .ob-particle {
    position: absolute;
    border-radius: 50%;
    animation: ob-float infinite;
    pointer-events: none;
  }
`;

const CONTENT: Record<string, { title: string; subtitle: string; button: string; particles: boolean }> = {
  female_user: {
    title: 'Bem-vinda ao eliaMov',
    subtitle: 'Seu corpo. Seu ritmo. Sua comunidade.',
    button: 'Começar minha jornada \u2192',
    particles: true,
  },
  personal_trainer: {
    title: 'Bem-vindo, Personal',
    subtitle: 'Gerencie suas alunas com precisão.',
    button: 'Ir para meu painel \u2192',
    particles: false,
  },
  family_companion: {
    title: 'Bem-vindo(a)',
    subtitle: 'Acompanhe quem você ama.',
    button: 'Começar \u2192',
    particles: false,
  },
  academy_admin: {
    title: 'Bem-vindo(a)',
    subtitle: 'Sua academia no eliaMov.',
    button: 'Ir para o painel \u2192',
    particles: false,
  },
};

const PARTICLE_COLORS = ['#B85A3D', '#A855F7', '#C084FC', '#D97757', '#818CF8', '#E879F9', '#F9A8D4', '#EEE7DB'];

const WelcomeStep: React.FC<WelcomeStepProps> = ({ profileType, onFinish }) => {
  const content = CONTENT[profileType] || CONTENT.female_user;

  const particles = useMemo(() => {
    if (!content.particles) return [];
    return Array.from({ length: 8 }, (_, i) => ({
      id: i,
      size: 8 + Math.random() * 8,
      left: 10 + Math.random() * 80,
      bottom: 10 + Math.random() * 30,
      duration: 4 + Math.random() * 4,
      delay: Math.random() * 5,
      color: PARTICLE_COLORS[i % PARTICLE_COLORS.length],
    }));
  }, [content.particles]);

  return (
    <>
      <style>{particleStyles}</style>
      <div className="ob-welcome-screen">
        {particles.map((p) => (
          <div
            key={p.id}
            className="ob-particle"
            style={{
              width: p.size,
              height: p.size,
              left: `${p.left}%`,
              bottom: `${p.bottom}%`,
              background: p.color,
              animationDuration: `${p.duration}s`,
              animationDelay: `${p.delay}s`,
            }}
          />
        ))}

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          style={{ textAlign: 'center', zIndex: 1, padding: 24 }}
        >
          <h1
            style={{
              fontFamily: "'Fraunces', serif",
              fontSize: 32,
              color: '#14161F',
              marginBottom: 8,
              fontWeight: 600,
            }}
          >
            {content.title}
          </h1>
          <p style={{ color: '#6B7280', fontSize: 16, marginBottom: 40 }}>{content.subtitle}</p>
          <button
            onClick={onFinish}
            style={{
              padding: '16px 40px',
              border: 'none',
              borderRadius: 999,
              background: '#14161F',
              color: '#fff',
              fontSize: 16,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background 0.2s',
            }}
            onMouseEnter={(e) => ((e.target as HTMLButtonElement).style.background = '#14161F')}
            onMouseLeave={(e) => ((e.target as HTMLButtonElement).style.background = '#14161F')}
          >
            {content.button}
          </button>
        </motion.div>
      </div>
    </>
  );
};

export default WelcomeStep;
