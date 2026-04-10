import React, { useState } from 'react';
import { useAuth, User } from '../contexts/AuthContext';
import { usersApi, UpdateProfileInput } from '../services/users.api';
import Layout from '../components/Layout';
import { formatBR } from '../utils/format';

function getInitials(name: string): string {
  const p = name.trim().split(/\s+/);
  return p.length === 1 ? (p[0][0]?.toUpperCase() ?? '?') : (p[0][0] + p[p.length - 1][0]).toUpperCase();
}

const FITNESS_LEVELS = [
  { value: 'sedentary', label: 'Sedentário' },
  { value: 'beginner', label: 'Iniciante' },
  { value: 'intermediate', label: 'Intermediário' },
  { value: 'advanced', label: 'Avançado' },
];

const FITNESS_GOALS = [
  { value: 'weight_loss', label: 'Perda de peso' },
  { value: 'health', label: 'Saúde' },
  { value: 'strength', label: 'Força' },
  { value: 'wellbeing', label: 'Bem-estar' },
  { value: 'pregnancy', label: 'Gestação' },
  { value: 'bone_health', label: 'Saúde óssea' },
];

export default function Profile() {
  const { currentUser, setCurrentUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [weight, setWeight] = useState<number | ''>(currentUser?.weight ?? '');
  const [height, setHeight] = useState<number | ''>(currentUser?.height ?? '');
  const [fitnessLevel, setFitnessLevel] = useState(currentUser?.fitnessLevel ?? '');
  const [fitnessGoal, setFitnessGoal] = useState(currentUser?.fitnessGoal ?? '');
  const [avatarUrl, setAvatarUrl] = useState(currentUser?.profile?.avatarUrl ?? '');

  const levelLabel = (v: string | null | undefined) =>
    FITNESS_LEVELS.find((x) => x.value === v)?.label ?? '—';

  const goalLabel = (v: string | null | undefined) =>
    FITNESS_GOALS.find((x) => x.value === v)?.label ?? '—';

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setSubmitting(true);
    try {
      const dto: UpdateProfileInput = {};
      if (weight !== '') dto.weight = Number(weight);
      if (height !== '') dto.height = Number(height);
      if (fitnessLevel) dto.fitnessLevel = fitnessLevel as UpdateProfileInput['fitnessLevel'];
      if (fitnessGoal) dto.fitnessGoal = fitnessGoal as UpdateProfileInput['fitnessGoal'];
      if (avatarUrl) dto.profile = { ...(dto.profile ?? {}), avatarUrl } as any;

      const updated = await usersApi.updateMe(dto);
      setCurrentUser(updated);
      setSuccess(true);
      setEditing(false);
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Falha ao atualizar perfil';
      setError(Array.isArray(msg) ? msg.join(', ') : msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (!currentUser) {
    return (
      <Layout title="Perfil">
        <p className="muted">Carregando…</p>
      </Layout>
    );
  }

  return (
    <Layout title="Perfil" subtitle="Visualize e edite suas informações pessoais.">
      <section className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#7C3AED', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#EDE9FE', fontWeight: 700, fontSize: 22, overflow: 'hidden', flexShrink: 0 }}>
            {currentUser.profile?.avatarUrl
              ? <img src={currentUser.profile.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : getInitials(currentUser.name)}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: 16 }}>{currentUser.name}</div>
            <div style={{ fontSize: 12, color: '#6B7280' }}>{currentUser.email}</div>
          </div>
        </div>
        <h3>Informações pessoais</h3>
        <div className="metric-row">
          <div>
            <span className="muted small">Nome</span>
            <strong>{currentUser.name}</strong>
          </div>
          <div>
            <span className="muted small">Email</span>
            <strong>{currentUser.email}</strong>
          </div>
          <div>
            <span className="muted small">Data de nascimento</span>
            <strong>{formatBR(currentUser.birthDate)}</strong>
          </div>
        </div>
        <div className="metric-row" style={{ marginTop: 12 }}>
          <div>
            <span className="muted small">Peso</span>
            <strong>{currentUser.weight != null ? `${currentUser.weight} kg` : '—'}</strong>
          </div>
          <div>
            <span className="muted small">Altura</span>
            <strong>{currentUser.height != null ? `${currentUser.height} cm` : '—'}</strong>
          </div>
          <div>
            <span className="muted small">Nível</span>
            <strong>{levelLabel(currentUser.fitnessLevel)}</strong>
          </div>
          <div>
            <span className="muted small">Objetivo</span>
            <strong>{goalLabel(currentUser.fitnessGoal)}</strong>
          </div>
        </div>
        {currentUser.healthConditions && currentUser.healthConditions.length > 0 && (
          <div style={{ marginTop: 12 }}>
            <span className="muted small">Condições de saúde</span>
            <p>{currentUser.healthConditions.join(', ')}</p>
          </div>
        )}
        {!editing && (
          <button style={{ marginTop: 12 }} onClick={() => setEditing(true)}>
            Editar
          </button>
        )}
      </section>

      {editing && (
        <section className="card">
          <h3>Editar perfil</h3>
          <form className="form-grid" onSubmit={handleSave}>
            <div className="row-2">
              <label>
                Peso (kg)
                <input
                  type="number"
                  min={20}
                  max={300}
                  step={0.1}
                  value={weight}
                  onChange={(e) =>
                    setWeight(e.target.value === '' ? '' : Number(e.target.value))
                  }
                />
              </label>
              <label>
                Altura (cm)
                <input
                  type="number"
                  min={50}
                  max={250}
                  value={height}
                  onChange={(e) =>
                    setHeight(e.target.value === '' ? '' : Number(e.target.value))
                  }
                />
              </label>
            </div>

            <label>
              Nível de condicionamento
              <select
                value={fitnessLevel}
                onChange={(e) => setFitnessLevel(e.target.value)}
              >
                <option value="">Selecione</option>
                {FITNESS_LEVELS.map((l) => (
                  <option key={l.value} value={l.value}>
                    {l.label}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Objetivo
              <select
                value={fitnessGoal}
                onChange={(e) => setFitnessGoal(e.target.value)}
              >
                <option value="">Selecione</option>
                {FITNESS_GOALS.map((g) => (
                  <option key={g.value} value={g.value}>
                    {g.label}
                  </option>
                ))}
              </select>
            </label>

            <label>
              URL da foto de perfil
              <input
                type="text"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://..."
              />
            </label>

            {error && <div className="error">{error}</div>}
            {success && <div className="muted small">Perfil atualizado com sucesso.</div>}

            <button type="submit" disabled={submitting}>
              {submitting ? 'Salvando…' : 'Salvar'}
            </button>
          </form>
        </section>
      )}

      <section className="card" style={{ textAlign: 'center' }}>
        <button onClick={() => { localStorage.removeItem('eliamov_token'); window.location.href = '/login'; }} style={{ background: 'none', border: '1px solid #DC2626', color: '#DC2626', padding: '10px 24px', borderRadius: 12, fontWeight: 600, cursor: 'pointer' }}>
          Sair da conta
        </button>
      </section>
    </Layout>
  );
}
