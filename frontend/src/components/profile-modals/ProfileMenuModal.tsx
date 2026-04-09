import React from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from '../Modal';
import { Icon } from '../icons';

interface Props {
  open: boolean;
  onClose: () => void;
  onOpenLifeMoment: () => void;
  onOpenPhoto: () => void;
}

const ChevronRight = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

export const ProfileMenuModal: React.FC<Props> = ({
  open,
  onClose,
  onOpenLifeMoment,
  onOpenPhoto,
}) => {
  const navigate = useNavigate();

  const handleEditFull = () => {
    onClose();
    navigate('/onboarding');
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Sua conta"
      subtitle="Atualize seu perfil ou momento de vida quando precisar."
      size="sm"
    >
      <div className="menu-list">
        <button type="button" className="menu-item" onClick={() => { onOpenPhoto(); }}>
          <span className="menu-item-icon">
            <Icon name="sparkles" size={20} />
          </span>
          <span className="menu-item-text">
            <strong>Foto de perfil</strong>
            <span>Atualize sua imagem</span>
          </span>
          <span className="menu-item-chevron"><ChevronRight /></span>
        </button>

        <button type="button" className="menu-item" onClick={() => { onOpenLifeMoment(); }}>
          <span className="menu-item-icon">
            <Icon name="flower" size={20} />
          </span>
          <span className="menu-item-text">
            <strong>Momento de vida</strong>
            <span>Estou grávida, em menopausa, etc.</span>
          </span>
          <span className="menu-item-chevron"><ChevronRight /></span>
        </button>

        <button type="button" className="menu-item" onClick={handleEditFull}>
          <span className="menu-item-icon">
            <Icon name="brain" size={20} />
          </span>
          <span className="menu-item-text">
            <strong>Editar perfil completo</strong>
            <span>Refazer o onboarding com mais detalhes</span>
          </span>
          <span className="menu-item-chevron"><ChevronRight /></span>
        </button>
      </div>
    </Modal>
  );
};

export default ProfileMenuModal;
