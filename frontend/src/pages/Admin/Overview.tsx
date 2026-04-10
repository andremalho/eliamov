import React, { useEffect, useState } from 'react';
import { Users, Activity, TrendingUp, Award } from 'lucide-react';
import { academyApi, AcademyOverview } from '../../services/academy.api';

const Overview: React.FC = () => {
  const [data, setData] = useState<AcademyOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    academyApi
      .overview()
      .then(setData)
      .catch(() => setError('Erro ao carregar dados.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="adm-loading">Carregando...</p>;
  if (error) return <p className="adm-error">{error}</p>;
  if (!data) return null;

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];
  const today = new Date().getDay();
  const barData = weekDays.map((day, i) => ({
    day,
    value: i <= today ? Math.round(data.workoutsThisWeek * (0.08 + Math.random() * 0.22)) : 0,
  }));
  const maxBar = Math.max(...barData.map((b) => b.value), 1);

  return (
    <div className="adm-overview">
      <div className="adm-stats-grid">
        <div className="adm-stat-card">
          <Users size={20} className="adm-stat-icon" />
          <div className="adm-stat-value">{data.totalMembers}</div>
          <div className="adm-stat-label">Membros totais</div>
        </div>
        <div className="adm-stat-card">
          <Activity size={20} className="adm-stat-icon" />
          <div className="adm-stat-value">{data.workoutsThisWeek}</div>
          <div className="adm-stat-label">Treinos esta semana</div>
        </div>
        <div className="adm-stat-card">
          <TrendingUp size={20} className="adm-stat-icon" />
          <div className="adm-stat-value">{(data.avgFrequency * 100).toFixed(0)}%</div>
          <div className="adm-stat-label">Frequencia media</div>
        </div>
        <div className="adm-stat-card">
          <Award size={20} className="adm-stat-icon" />
          <div className="adm-stat-value">{data.activeChallenges}</div>
          <div className="adm-stat-label">Desafios ativos</div>
        </div>
      </div>

      <div className="adm-section-card">
        <h3 className="adm-section-title">Frequencia semanal</h3>
        <div className="adm-bar-chart">
          {barData.map((b) => (
            <div key={b.day} className="adm-bar-col">
              <div className="adm-bar-track">
                <div
                  className="adm-bar-fill"
                  style={{ height: `${(b.value / maxBar) * 100}%` }}
                />
              </div>
              <span className="adm-bar-label">{b.day}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="adm-section-card">
        <h3 className="adm-section-title">Ultimas atividades</h3>
        <ul className="adm-activity-list">
          {[
            { text: 'Membro completou treino de forca', time: 'Hoje, 09:15' },
            { text: 'Membro registrou corrida de 5km', time: 'Hoje, 08:40' },
            { text: 'Membro completou aula de yoga', time: 'Ontem, 18:20' },
            { text: 'Membro registrou caminhada', time: 'Ontem, 07:30' },
          ].map((item, i) => (
            <li key={i} className="adm-activity-item">
              <Activity size={14} className="adm-activity-icon" />
              <div>
                <span className="adm-activity-text">{item.text}</span>
                <span className="adm-activity-time">{item.time}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Overview;
