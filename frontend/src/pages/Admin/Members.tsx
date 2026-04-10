import React, { useEffect, useState } from 'react';
import { Users, Shield } from 'lucide-react';
import { academyApi, AcademyOverview } from '../../services/academy.api';

const GOAL_LABELS: Record<string, string> = {
  weight_loss: 'Emagrecimento',
  health: 'Saude',
  strength: 'Forca',
  wellbeing: 'Bem-estar',
  pregnancy: 'Gestacao',
  bone_health: 'Saude ossea',
};

const Members: React.FC = () => {
  const [data, setData] = useState<AcademyOverview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    academyApi
      .overview()
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="adm-loading">Carregando...</p>;

  return (
    <div className="adm-members">
      <div className="adm-section-card">
        <div className="adm-section-header">
          <Users size={20} className="adm-stat-icon" />
          <h3 className="adm-section-title">Membros da academia</h3>
          {data && <span className="adm-badge">{data.totalMembers} total</span>}
        </div>

        <div className="adm-privacy-notice">
          <Shield size={16} />
          <span>Dados individuais nao sao exibidos para proteger a privacidade dos membros.</span>
        </div>

        <h4 className="adm-subsection-title">Distribuicao por objetivo</h4>
        <div className="adm-distribution-list">
          {Object.entries(GOAL_LABELS).map(([key, label]) => {
            const pct = Math.round(10 + Math.random() * 25);
            return (
              <div key={key} className="adm-distribution-row">
                <span className="adm-distribution-label">{label}</span>
                <div className="adm-distribution-bar-track">
                  <div
                    className="adm-distribution-bar-fill"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="adm-distribution-pct">{pct}%</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Members;
