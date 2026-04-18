import React from 'react';
import { Shield } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function FemaleZoneBadge() {
  const { currentUser } = useAuth();

  // Only show for logged-in female users
  if (!currentUser) return null;
  if (currentUser.role !== 'female_user' && currentUser.role !== 'user') return null;

  return (
    <div className="fz-badge">
      <Shield size={14} />
      <span>Zona exclusiva — seus dados são privados</span>
    </div>
  );
}
