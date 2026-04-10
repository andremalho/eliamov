import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cycleGroupApi, CycleGroupPeersResponse } from '../services/cycle-group.api';

const phaseLabels: Record<string, string> = {
  menstrual: 'menstrual',
  follicular: 'folicular',
  ovulatory: 'ovulatoria',
  luteal: 'lutea',
};

const phaseColors: Record<string, string> = {
  menstrual: '#dc2626',
  follicular: '#16a34a',
  ovulatory: '#f59e0b',
  luteal: '#7c3aed',
};

export default function CycleGroupBanner() {
  const navigate = useNavigate();
  const [data, setData] = useState<CycleGroupPeersResponse | null>(null);

  useEffect(() => {
    cycleGroupApi.getPeers().then(setData).catch(() => {});
  }, []);

  if (!data || !data.phase || data.count === 0) return null;

  const { phase, peers, count } = data;
  const phaseLabel = phaseLabels[phase] ?? phase;
  const phaseColor = phaseColors[phase] ?? '#6d4ac4';

  const handleTrainTogether = async () => {
    try {
      await cycleGroupApi.createWorkout({
        title: `Treino em grupo - Fase ${phaseLabel}`,
        participantIds: peers.map(p => p.id),
      });
    } catch {
      // ignore – navigate anyway
    }
    navigate('/feed');
  };

  return (
    <div
      className="cycle-group-banner"
      style={{
        background: `linear-gradient(135deg, ${phaseColor}14, ${phaseColor}0a)`,
        borderColor: `${phaseColor}26`,
      }}
    >
      <div className="cycle-group-content">
        <div className="cycle-group-text">
          <strong>Hoje com voce: {count + 1} mulheres na fase {phaseLabel}</strong>
          <span className="muted small">Treinem juntas para melhores resultados!</span>
        </div>
        <div className="cycle-group-avatars">
          {peers.slice(0, 5).map(peer => (
            <div key={peer.id} className="cycle-group-avatar" title={peer.name}>
              {peer.avatarUrl
                ? <img src={peer.avatarUrl} alt={peer.name} />
                : peer.name.charAt(0).toUpperCase()
              }
            </div>
          ))}
          {peers.length > 5 && (
            <div className="cycle-group-avatar cycle-group-more">+{peers.length - 5}</div>
          )}
        </div>
        <button type="button" className="cycle-group-cta" onClick={handleTrainTogether}>
          Treinar juntas
        </button>
      </div>
    </div>
  );
}
