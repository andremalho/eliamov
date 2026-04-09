import React, { useState } from 'react';
import Modal from '../Modal';
import { useAuth } from '../../contexts/AuthContext';
import { usersApi } from '../../services/users.api';
import { Icon } from '../icons';

interface Props {
  open: boolean;
  onClose: () => void;
}

const LIFE_MOMENTS = [
  { value: 'regular', label: 'Tudo certo', desc: 'Sem mudança hormonal recente', icon: 'sparkles' },
  { value: 'trying', label: 'Tentando engravidar', desc: 'Em pré-concepção', icon: 'sprout' },
  { value: 'pregnant', label: 'Estou grávida', desc: 'Adapta os planos para gestação', icon: 'baby' },
  { value: 'postpartum', label: 'Pós-parto', desc: 'Foco em recuperação', icon: 'heart' },
  { value: 'breastfeeding', label: 'Amamentando', desc: 'Com cuidados específicos', icon: 'flower' },
  { value: 'perimenopause', label: 'Perimenopausa', desc: 'Transição hormonal', icon: 'moon' },
  { value: 'menopause', label: 'Menopausa', desc: 'Sintomas e adaptações', icon: 'moon' },
];

export const LifeMomentModal: React.FC<Props> = ({ open, onClose }) => {
  const { currentUser, setCurrentUser } = useAuth();
  const [selected, setSelected] = useState<string>(
    currentUser?.profile?.lifeMoment ?? 'regular',
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const updated = await usersApi.updateMe({
        profile: { lifeMoment: selected, lifeMomentUpdatedAt: new Date().toISOString() },
      });
      setCurrentUser(updated);
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Falha ao salvar');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Momento de vida"
      subtitle="Conte como você está agora — vamos ajustar tudo pra esse momento."
      footer={
        <>
          <button type="button" className="link-button" onClick={onClose}>
            Cancelar
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={handleSave}
            disabled={submitting}
          >
            {submitting ? 'Salvando…' : 'Salvar'}
          </button>
        </>
      }
    >
      {error && <div className="error">{error}</div>}
      <div className="menu-list">
        {LIFE_MOMENTS.map((m) => {
          const active = selected === m.value;
          return (
            <button
              key={m.value}
              type="button"
              className={`menu-item ${active ? 'active' : ''}`}
              onClick={() => setSelected(m.value)}
              aria-pressed={active}
            >
              <span className="menu-item-icon">
                <Icon name={m.icon} size={20} />
              </span>
              <span className="menu-item-text">
                <strong>{m.label}</strong>
                <span>{m.desc}</span>
              </span>
              {active && (
                <span className="menu-item-check">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </span>
              )}
            </button>
          );
        })}
      </div>
    </Modal>
  );
};

export default LifeMomentModal;
