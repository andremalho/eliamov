import React, { useState } from 'react';
import { trainerApi } from '../../services/trainer.api';

interface WorkoutCommentProps {
  studentId: string;
  workoutId: string;
  onCommented: () => void;
}

const styles = {
  container: {
    padding: '12px 0 16px',
    fontFamily: "'Figtree', sans-serif",
  } as React.CSSProperties,
  textarea: {
    width: '100%',
    minHeight: 72,
    padding: '10px 12px',
    border: '1px solid #E5E7EB',
    borderRadius: 10,
    fontFamily: "'Figtree', sans-serif",
    fontSize: 14,
    color: '#111827',
    resize: 'vertical' as const,
    outline: 'none',
    marginBottom: 8,
  } as React.CSSProperties,
  button: {
    background: '#4C1D95',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: 8,
    padding: '8px 16px',
    fontSize: 13,
    fontFamily: "'Figtree', sans-serif",
    fontWeight: 600,
    cursor: 'pointer',
  } as React.CSSProperties,
  buttonDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  } as React.CSSProperties,
};

const WorkoutComment: React.FC<WorkoutCommentProps> = ({ studentId, workoutId, onCommented }) => {
  const [comment, setComment] = useState('');
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!comment.trim() || sending) return;
    setSending(true);
    try {
      await trainerApi.commentWorkout(studentId, { workoutId, comment: comment.trim() });
      setComment('');
      onCommented();
    } catch {
      // silent
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={styles.container}>
      <textarea
        style={styles.textarea}
        rows={2}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Escreva um feedback..."
      />
      <button
        style={{
          ...styles.button,
          ...(sending || !comment.trim() ? styles.buttonDisabled : {}),
        }}
        disabled={sending || !comment.trim()}
        onClick={handleSend}
      >
        {sending ? 'Enviando...' : 'Enviar comentario'}
      </button>
    </div>
  );
};

export default WorkoutComment;
