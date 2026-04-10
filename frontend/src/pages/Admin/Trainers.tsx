import React from 'react';
import { UserCheck } from 'lucide-react';

interface Trainer {
  name: string;
  specialty: string;
  students: number;
}

// Placeholder data - in production this would come from an API
const MOCK_TRAINERS: Trainer[] = [
  { name: 'Ana Silva', specialty: 'Musculacao e forca', students: 12 },
  { name: 'Carlos Mendes', specialty: 'Corrida e cardio', students: 8 },
  { name: 'Lucia Fernandes', specialty: 'Yoga e pilates', students: 15 },
];

const Trainers: React.FC = () => {
  return (
    <div className="adm-trainers">
      <div className="adm-section-card">
        <div className="adm-section-header">
          <UserCheck size={20} className="adm-stat-icon" />
          <h3 className="adm-section-title">Profissionais da academia</h3>
          <span className="adm-badge">{MOCK_TRAINERS.length} ativos</span>
        </div>

        <div className="adm-trainer-list">
          {MOCK_TRAINERS.map((t, i) => (
            <div key={i} className="adm-trainer-row">
              <div className="adm-trainer-avatar">
                {t.name
                  .split(' ')
                  .map((w) => w[0])
                  .join('')
                  .slice(0, 2)}
              </div>
              <div className="adm-trainer-info">
                <span className="adm-trainer-name">{t.name}</span>
                <span className="adm-trainer-specialty">{t.specialty}</span>
              </div>
              <div className="adm-trainer-students">
                <span className="adm-trainer-students-count">{t.students}</span>
                <span className="adm-trainer-students-label">alunos</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Trainers;
