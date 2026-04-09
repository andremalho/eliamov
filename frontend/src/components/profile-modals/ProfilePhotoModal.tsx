import React, { useRef, useState } from 'react';
import Modal from '../Modal';
import { useAuth } from '../../contexts/AuthContext';
import { usersApi } from '../../services/users.api';
import { Icon } from '../icons';

interface Props {
  open: boolean;
  onClose: () => void;
}

const compressImage = (file: File, maxSize = 480, quality = 0.85): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const size = Math.min(img.width, img.height);
        const sx = (img.width - size) / 2;
        const sy = (img.height - size) / 2;
        const canvas = document.createElement('canvas');
        canvas.width = maxSize;
        canvas.height = maxSize;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('canvas'));
        ctx.drawImage(img, sx, sy, size, size, 0, 0, maxSize, maxSize);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = () => reject(new Error('img'));
      img.src = reader.result as string;
    };
    reader.onerror = () => reject(new Error('read'));
    reader.readAsDataURL(file);
  });

export const ProfilePhotoModal: React.FC<Props> = ({ open, onClose }) => {
  const { currentUser, setCurrentUser } = useAuth();
  const [preview, setPreview] = useState<string>(currentUser?.profile?.avatarUrl ?? '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const galleryRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setError(null);
    try {
      const dataUrl = await compressImage(file);
      setPreview(dataUrl);
    } catch {
      setError('Não foi possível processar a imagem.');
    }
  };

  const handleSave = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const updated = await usersApi.updateMe({ profile: { avatarUrl: preview || null } });
      setCurrentUser(updated);
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Falha ao salvar');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemove = async () => {
    setSubmitting(true);
    try {
      const updated = await usersApi.updateMe({ profile: { avatarUrl: null } });
      setCurrentUser(updated);
      setPreview('');
      onClose();
    } catch {
      setError('Falha ao remover');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Foto de perfil"
      subtitle="Tire uma foto ou escolha uma da galeria."
      size="sm"
      footer={
        <>
          <button
            type="button"
            className="link-button"
            onClick={handleRemove}
            disabled={submitting}
          >
            Remover
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={handleSave}
            disabled={submitting || !preview}
          >
            {submitting ? 'Salvando…' : 'Salvar'}
          </button>
        </>
      }
    >
      {error && <div className="error">{error}</div>}

      <div className="photo-preview">
        {preview ? (
          <img src={preview} alt="Pré-visualização" />
        ) : (
          <div className="photo-preview-empty">Sem foto</div>
        )}
      </div>

      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="user"
        hidden
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      <input
        ref={galleryRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      <div className="photo-actions">
        <button
          type="button"
          className="photo-action"
          onClick={() => cameraRef.current?.click()}
        >
          <span className="photo-action-icon">
            <Icon name="sparkles" size={22} />
          </span>
          Tirar foto
        </button>
        <button
          type="button"
          className="photo-action"
          onClick={() => galleryRef.current?.click()}
        >
          <span className="photo-action-icon">
            <Icon name="flower" size={22} />
          </span>
          Da galeria
        </button>
      </div>
    </Modal>
  );
};

export default ProfilePhotoModal;
