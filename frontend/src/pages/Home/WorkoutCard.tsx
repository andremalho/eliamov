import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function WorkoutCard() {
  return (
    <motion.div
      className="workout-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      style={{
        background: '#fff',
        borderRadius: 16,
        padding: '20px',
        marginBottom: 16,
        borderLeft: '4px solid #14161F',
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
      }}
    >
      <h3
        style={{
          fontSize: 14,
          color: '#6b7280',
          margin: '0 0 8px',
          fontWeight: 500,
        }}
      >
        Treino recomendado para hoje
      </h3>

      <p
        style={{
          fontSize: 16,
          color: '#1f2937',
          margin: '0 0 12px',
          fontWeight: 600,
        }}
      >
        Treino funcional - 30min
      </p>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <span
          style={{
            fontSize: 12,
            background: '#f3f4f6',
            padding: '4px 10px',
            borderRadius: 20,
            color: '#374151',
          }}
        >
          30 min
        </span>
        <span
          style={{
            fontSize: 12,
            background: '#f3f4f6',
            padding: '4px 10px',
            borderRadius: 20,
            color: '#374151',
          }}
        >
          Moderado
        </span>
      </div>

      <Link
        to="/activities"
        style={{
          display: 'inline-block',
          background: '#22C55E',
          color: '#fff',
          padding: '10px 24px',
          borderRadius: 12,
          fontSize: 14,
          fontWeight: 600,
          textDecoration: 'none',
          textAlign: 'center',
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        Iniciar treino
      </Link>
    </motion.div>
  );
}
