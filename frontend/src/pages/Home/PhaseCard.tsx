import React from 'react';
import { motion } from 'framer-motion';
import { Droplets, Sprout, Sun, Moon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CurrentPhase } from '../../services/cycle.api';

const PHASE_CONFIG: Record<
  string,
  { color: string; label: string; icon: string; message: string }
> = {
  menstrual: {
    color: '#F472B6',
    label: 'Menstrual',
    icon: 'Droplets',
    message: 'Cuide-se com carinho. Prefira exercicios leves hoje.',
  },
  follicular: {
    color: '#22C55E',
    label: 'Folicular',
    icon: 'Sprout',
    message: 'Energia em alta! Otimo momento para desafios.',
  },
  ovulatory: {
    color: '#F59E0B',
    label: 'Ovulatoria',
    icon: 'Sun',
    message: 'Pico de energia e disposicao. Aproveite!',
  },
  luteal: {
    color: '#F97316',
    label: 'Lutea',
    icon: 'Moon',
    message: 'Fase de recolhimento. Exercicios moderados sao ideais.',
  },
};

const ICONS: Record<string, React.ElementType> = {
  Droplets,
  Sprout,
  Sun,
  Moon,
};

interface PhaseCardProps {
  phase: CurrentPhase | null;
}

export default function PhaseCard({ phase }: PhaseCardProps) {
  if (!phase || !phase.phase) {
    return (
      <div className="phase-card phase-card--empty">
        <p style={{ color: '#6b7280', fontSize: 14, textAlign: 'center' }}>
          Registre seu ciclo para receber recomendacoes personalizadas.
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{
        background: `linear-gradient(135deg, ${config.color}26, ${config.color}0D)`,
        borderRadius: 16,
        padding: '20px',
        marginBottom: 16,
      }}
    >
      <div className="phase-card-header">
        <div
          className="phase-card-icon"
          style={{
            width: 44,
            height: 44,
            borderRadius: '50%',
            background: `${config.color}33`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {IconComp && <IconComp size={22} color={config.color} />}
        </div>

        <div style={{ marginLeft: 12, flex: 1 }}>
          <h3
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 20,
              color: '#2D1B4E',
              margin: 0,
              fontWeight: 600,
            }}
          >
            Fase {config.label}
          </h3>
          {phase.dayOfCycle != null && (
            <span style={{ fontSize: 13, color: '#6b7280' }}>
              Dia {phase.dayOfCycle} do ciclo
            </span>
          )}
        </div>
      </div>

      <p style={{ fontSize: 14, color: '#374151', margin: '12px 0' }}>
        {config.message}
      </p>

      {phase.phase === 'ovulatory' && (
        <span
          style={{
            display: 'inline-block',
            background: '#F59E0B',
            color: '#fff',
            fontSize: 11,
            fontWeight: 600,
            padding: '3px 10px',
            borderRadius: 20,
            marginBottom: 12,
          }}
        >
          Janela de pico
        </span>
      )}

      <Link
        to="/training"
        style={{
          display: 'block',
          textAlign: 'center',
          color: config.color,
          fontWeight: 600,
          fontSize: 14,
          textDecoration: 'none',
          marginTop: 4,
        }}
      >
        Ver plano de hoje →
      </Link>
    </motion.div>
  );
}
