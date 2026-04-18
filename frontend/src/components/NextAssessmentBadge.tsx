import React from 'react';

interface Props {
  suggestedDays: number | null;
  lastAssessmentDate: string | null;
}

export function NextAssessmentBadge({ suggestedDays, lastAssessmentDate }: Props) {
  if (suggestedDays === null && !lastAssessmentDate) return null;

  let daysLeft: number | null = null;
  if (suggestedDays !== null && suggestedDays > 0 && lastAssessmentDate) {
    const last = new Date(lastAssessmentDate);
    const target = new Date(last);
    target.setDate(target.getDate() + suggestedDays);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    target.setHours(0, 0, 0, 0);
    daysLeft = Math.ceil((target.getTime() - today.getTime()) / 86400000);
  }

  let accent: string;
  let tone: string;
  let text: string;

  if (suggestedDays === 0 || !lastAssessmentDate) {
    accent = '#D97757'; tone = 'rgba(217,119,87,0.08)'; text = 'Faça sua primeira avaliação';
  } else if (daysLeft !== null && daysLeft < 0) {
    accent = '#8B3A2F'; tone = 'rgba(139,58,47,0.06)'; text = 'Avaliação recomendada hoje';
  } else if (daysLeft !== null && daysLeft <= 7) {
    accent = '#C9A977'; tone = 'rgba(201,169,119,0.1)'; text = 'Avaliação recomendada em breve';
  } else {
    accent = '#9CA89A'; tone = 'rgba(156,168,154,0.1)'; text = `Próxima avaliação em ${daysLeft ?? suggestedDays} dias`;
  }

  return (
    <div
      style={{
        background: tone,
        borderLeft: `2px solid ${accent}`,
        padding: '12px 18px',
        marginBottom: 16,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        fontFamily: "'Figtree', sans-serif",
      }}
    >
      <span
        aria-hidden
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: accent,
          flexShrink: 0,
        }}
      />
      <span
        style={{
          fontSize: 13,
          fontWeight: 500,
          color: '#14161F',
          letterSpacing: '0.005em',
        }}
      >
        {text}
      </span>
    </div>
  );
}
