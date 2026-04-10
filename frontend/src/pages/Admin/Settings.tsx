import React from 'react';
import { Settings as SettingsIcon } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Settings: React.FC = () => {
  const { currentUser } = useAuth();

  return (
    <div className="adm-settings">
      <div className="adm-section-card">
        <div className="adm-section-header">
          <SettingsIcon size={20} className="adm-stat-icon" />
          <h3 className="adm-section-title">Configuracoes</h3>
        </div>

        <div className="adm-settings-group">
          <div className="adm-settings-item">
            <label className="adm-settings-label">Nome da academia</label>
            <div className="adm-settings-value">
              {currentUser?.profile?.academyName || 'Academia EliaMov'}
            </div>
          </div>

          <div className="adm-settings-item">
            <label className="adm-settings-label">Codigo da academia (tenant)</label>
            <div className="adm-settings-value adm-settings-code">
              {currentUser?.tenantId || '-'}
            </div>
          </div>

          <div className="adm-settings-item">
            <label className="adm-settings-label">Sua funcao</label>
            <div className="adm-settings-value">{currentUser?.role || '-'}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
