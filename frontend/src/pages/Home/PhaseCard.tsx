import React from 'react';
import { motion } from 'framer-motion';
import { Droplets, Sprout, Sun, Moon, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CurrentPhase } from '../../services/cycle.api';

const PHASE_CONFIG: Record<
  string,
  { color: string; label: string; icon: string; message: string }
> = {
  menstrual: {
    color: '#B85A3D',
    label: 'Menstrual',
    icon: 'Droplets',
    message: 'Cuide-se com carinho. Exercícios leves hoje.',
  },
  follicular: {
    color: '#9CA89A',
    label: 'Folicular',
    icon: 'Sprout',
    message: 'Energia em alta — ótimo momento para desafios.',
  },
  ovulatory: {
    color: '#C9A977',
    label: 'Ovulatória',
    icon: 'Sun',
    message: 'Pico de disposição. Aproveite.',
  },
  luteal: {
    color: '#D97757',
    label: 'Lútea',
    icon: 'Moon',
    message: 'Fase de recolhimento. Intensidade moderada.',
  },
};

const ICONS: Record<string, React.ElementType> = { Droplets, Sprout, Sun, Moon };

interface PhaseCardProps {
  phase: CurrentPhase | null;
}

export default function PhaseCard({ phase }: PhaseCardProps) {
  if (!phase || !phase.phase) {
    return (
      <div
        className="phase-card phase-card--empty"
        style={{
          background: '#FDFAF3',
          border: '1px solid rgba(20,22,31,0.08)',
          padding: 24,
          marginBottom: 16,
          textAlign: 'center',
          fontFamily: "'Figtree', sans-serif",
        }}
      >
        <p
          style={{
            color: 'rgba(20,22,31,0.62)',
            fontSize: 13.5,
            margin: 0,
            lineHeight: 1.5,
          }}
        >
          Registre seu ciclo para receber recomendações personalizadas.
        </p>
      </div>
    );
  }

  const config = PHASE_CONFIG[phase.phase];
  if (!config) return null;

  const IconComp = ICONS[config.icon];

  return (
    <motion.div
      className="phase-card"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      style={{
        position: 'relative',
        background: '#FDFAF3',
        border: '1px solid rgba(20,22,31,0.08)',
        borderLeft: `2px solid ${config.color}`,
        padding: 24,
        marginBottom: 16,
        fontFamily: "'Figtree', sans-serif",
        color: '#14161F',
        overflow: 'hidden',
      }}
    >
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: '-50%',
          right: '-20%',
          width: '60%',
          height: '180%',
          background: `radial-gradient(closest-side, ${config.color}22, transparent 70%)`,
          filter: 'blur(40px)',
          pointerEvents: 'none',
        }}
      />
      <div style={{ position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 14 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              background: 'transparent',
              border: `1px solid ${config.color}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {IconComp && <IconComp size={20} color={config.color} strokeWidth={1.5} />}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 10,
                letterSpacing: '0.28em',
                textTransform: 'uppercase',
                color: 'rgba(20,22,31,0.55)',
                marginBottom: 4,
              }}
            >
              Fase atual
            </div>
            <h3
              style={{
                fontFamily: "'Fraunces', serif",
                fontSize: 24,
                color: '#14161F',
                margin: 0,
                fontWeight: 450,
                letterSpacing: '-0.02em',
                lineHeight: 1.1,
              }}
            >
              {config.label}
            </h3>
            {phase.dayOfCycle != null && (
              <span
                style={{
                  fontSize: 12,
                  color: 'rgba(20,22,31,0.55)',
                  marginTop: 2,
                  display: 'inline-block',
                  fontFamily: "'JetBrains Mono', monospace",
                  letterSpacing: '0.1em',
                }}
              >
                DIA {phase.dayOfCycle}
              </span>
            )}
          </div>
        </div>

        <p
          style={{
            fontFamily: "'Fraunces', serif",
            fontStyle: 'italic',
            fontSize: 15,
            color: 'rgba(20,22,31,0.78)',
            margin: '0 0 16px',
            lineHeight: 1.5,
          }}
        >
          {config.message}
        </p>

        {phase.phase === 'ovulatory' && (
          <span
            style={{
              display: 'inline-block',
              background: '#C9A977',
              color: '#14161F',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              padding: '5px 12px',
              marginBottom: 16,
            }}
          >
            ● Janela de pico
          </span>
        )}

        <Link
          to="/training"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            color: '#14161F',
            fontFamily: "'Figtree', sans-serif",
            fontWeight: 600,
            fontSize: 12,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            textDecoration: 'none',
            paddingBottom: 4,
            borderBottom: `1px solid ${config.color}`,
          }}
        >
          Ver plano de hoje <ArrowRight size={13} />
        </Link>
      </div>
    </motion.div>
  );
}
