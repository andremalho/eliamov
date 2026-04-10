import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { useAuth, getHomeRoute } from '../contexts/AuthContext';

interface FemaleZoneModalProps {
  open: boolean;
  onClose: () => void;
}

export default function FemaleZoneModal({ open, onClose }: FemaleZoneModalProps) {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  if (!open) return null;

  const handleBack = () => {
    onClose();
    navigate(getHomeRoute(currentUser));
  };

  return (
    <div className="fz-modal-backdrop" onClick={onClose}>
      <div className="fz-modal-panel" onClick={e => e.stopPropagation()}>
        <div className="fz-modal-icon">
          <Shield size={40} />
        </div>
        <h2 className="fz-modal-title">Area exclusiva</h2>
        <p className="fz-modal-text">
          Esta area e exclusiva para usuarias do EliaMov.
          Perfis de personal trainer e administradores nao tem acesso
          a dados de saude feminina, ciclo menstrual ou comunidades privadas.
        </p>
        <button className="fz-modal-btn" onClick={handleBack}>
          Voltar ao meu painel
        </button>
      </div>
    </div>
  );
}
