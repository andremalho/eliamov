import React from 'react';

interface Props {
  suggestedDays: number | null;
  lastAssessmentDate: string | null;
}

export function NextAssessmentBadge({ suggestedDays, lastAssessmentDate }: Props) {
  if (suggestedDays === null && !lastAssessmentDate) {
    return null;
  }

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

  let bg: string, color: string, text: string;

  if (suggestedDays === 0 || !lastAssessmentDate) {
    bg = '#F5F3FF'; color = '#7C3AED'; text = 'Faca sua primeira avaliacao';
  } else if (daysLeft !== null && daysLeft < 0) {
    bg = '#FEF2F2'; color = '#DC2626'; text = 'Avaliacao recomendada hoje';
  } else if (daysLeft !== null && daysLeft <= 7) {
    bg = '#FFFBEB'; color = '#D97706'; text = 'Avaliacao recomendada em breve';
  } else {
    bg = '#F0FDF4'; color = '#16A34A'; text = `Proxima avaliacao em ${daysLeft ?? suggestedDays} dias`;
  }

  return (
    <div style={{
      background: bg, borderRadius: 12, padding: '10px 16px',
      marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8,
    }}>
      <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
      <span style={{ fontSize: 13, fontWeight: 600, color }}>{text}</span>
    </div>
  );
}
