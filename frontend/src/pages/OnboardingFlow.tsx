import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { onboardingApi, OnboardingStatus } from '../services/onboarding.api';
import Layout from '../components/Layout';

const GOAL_OPTIONS = [
  { value: 'weight_loss', label: 'Emagrecimento', icon: '⚖️' },
  { value: 'strength', label: 'Forca', icon: '💪' },
  { value: 'health', label: 'Saude', icon: '❤️' },
  { value: 'wellbeing', label: 'Bem-estar', icon: '🧘' },
];

const FITNESS_LEVELS = [
  { value: 'sedentary', label: 'Sedentaria' },
  { value: 'beginner', label: 'Iniciante' },
  { value: 'intermediate', label: 'Intermediaria' },
  { value: 'advanced', label: 'Avancada' },
];

const RELATIONSHIP_OPTIONS = [
  { value: 'marido', label: 'Marido' },
  { value: 'pai', label: 'Pai' },
  { value: 'mae', label: 'Mae' },
  { value: 'filho', label: 'Filho' },
  { value: 'filha', label: 'Filha' },
  { value: 'outro', label: 'Outro' },
];

export default function OnboardingFlow() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [status, setStatus] = useState<OnboardingStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form data for all possible fields
  const [formData, setFormData] = useState<Record<string, any>>({
    cycleActive: true,
    cycleDuration: 28,
    periodDuration: 5,
  });

  useEffect(() => {
    onboardingApi
      .getStatus()
      .then((s) => {
        if (s.isComplete) {
          navigate(s.redirectTo, { replace: true });
          return;
        }
        setStatus(s);
      })
      .catch(() => setError('Falha ao carregar onboarding'))
      .finally(() => setLoading(false));
  }, [navigate]);

  const setField = (key: string, value: any) =>
    setFormData((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!status) return;
    setSubmitting(true);
    setError(null);
    try {
      const updated = await onboardingApi.saveStep(status.currentStep, formData);
      if (updated.isComplete) {
        setSuccess(true);
        setTimeout(() => navigate(updated.redirectTo, { replace: true }), 2000);
      } else {
        setStatus(updated);
        setFormData({ cycleActive: true, cycleDuration: 28, periodDuration: 5 });
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Falha ao salvar';
      setError(Array.isArray(msg) ? msg.join(', ') : msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <p style={{ textAlign: 'center', padding: 40 }}>Carregando...</p>
      </Layout>
    );
  }

  if (success) {
    return (
      <Layout>
        <div className="onboarding-success">
          <div className="checkmark">✓</div>
          <h2>Tudo pronto!</h2>
          <p className="muted">Redirecionando...</p>
        </div>
      </Layout>
    );
  }

  if (!status) {
    return (
      <Layout>
        <p style={{ textAlign: 'center', padding: 40 }}>{error || 'Erro inesperado'}</p>
      </Layout>
    );
  }

  const { currentStep, totalSteps, profileType } = status;

  const renderStepContent = () => {
    switch (profileType) {
      case 'female_user':
        return renderFemaleUserStep(currentStep);
      case 'personal_trainer':
        return renderTrainerStep(currentStep);
      case 'family_companion':
        return renderCompanionStep(currentStep);
      case 'academy_admin':
        return renderAcademyStep(currentStep);
      default:
        return <p>Tipo de perfil desconhecido</p>;
    }
  };

  function renderFemaleUserStep(step: number) {
    switch (step) {
      case 0:
        return (
          <>
            <label>
              Nome
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => setField('name', e.target.value)}
                required
              />
            </label>
            <label>
              Data de nascimento
              <input
                type="date"
                value={formData.birthDate || ''}
                onChange={(e) => setField('birthDate', e.target.value)}
                required
              />
            </label>
            <label>
              URL do avatar
              <input
                type="text"
                value={formData.avatarUrl || ''}
                onChange={(e) => setField('avatarUrl', e.target.value)}
                placeholder="https://..."
              />
            </label>
          </>
        );
      case 1:
        return (
          <>
            <p style={{ fontWeight: 600, marginBottom: 8 }}>Qual seu objetivo?</p>
            <div className="onboarding-goal-grid">
              {GOAL_OPTIONS.map((opt) => (
                <div
                  key={opt.value}
                  className={`onboarding-goal-card${formData.fitnessGoal === opt.value ? ' selected' : ''}`}
                  onClick={() => setField('fitnessGoal', opt.value)}
                >
                  <div className="icon">{opt.icon}</div>
                  <div className="label">{opt.label}</div>
                </div>
              ))}
            </div>
            <label>
              Nivel de condicionamento
              <select
                value={formData.fitnessLevel || ''}
                onChange={(e) => setField('fitnessLevel', e.target.value)}
                required
              >
                <option value="" disabled>
                  Selecione
                </option>
                {FITNESS_LEVELS.map((l) => (
                  <option key={l.value} value={l.value}>
                    {l.label}
                  </option>
                ))}
              </select>
            </label>
          </>
        );
      case 2:
        return (
          <>
            <label>
              Data da ultima menstruacao
              <input
                type="date"
                value={formData.lastPeriodDate || ''}
                onChange={(e) => setField('lastPeriodDate', e.target.value)}
              />
            </label>
            <label>
              Duracao do ciclo (dias)
              <input
                type="number"
                value={formData.cycleDuration ?? 28}
                onChange={(e) => setField('cycleDuration', Number(e.target.value))}
                min={18}
                max={45}
              />
            </label>
            <label>
              Duracao da menstruacao (dias)
              <input
                type="number"
                value={formData.periodDuration ?? 5}
                onChange={(e) => setField('periodDuration', Number(e.target.value))}
                min={1}
                max={10}
              />
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input
                type="checkbox"
                checked={formData.cycleActive ?? true}
                onChange={(e) => setField('cycleActive', e.target.checked)}
              />
              Ciclo ativo
            </label>
          </>
        );
      case 3:
        return (
          <>
            <label>
              Codigo da academia (opcional)
              <input
                type="text"
                value={formData.academyCode || ''}
                onChange={(e) => setField('academyCode', e.target.value)}
                placeholder="Codigo da academia ou deixe vazio para uso individual"
              />
            </label>
          </>
        );
      default:
        return null;
    }
  }

  function renderTrainerStep(step: number) {
    switch (step) {
      case 0:
        return (
          <>
            <label>
              Registro CREF
              <input
                type="text"
                value={formData.cref || ''}
                onChange={(e) => setField('cref', e.target.value)}
                required
              />
            </label>
            <label>
              Especialidade
              <input
                type="text"
                value={formData.specialty || ''}
                onChange={(e) => setField('specialty', e.target.value)}
                required
              />
            </label>
          </>
        );
      case 1:
        return (
          <>
            <label>
              Codigo da academia
              <input
                type="text"
                value={formData.academyCode || ''}
                onChange={(e) => setField('academyCode', e.target.value)}
                required
              />
            </label>
            {error && <p style={{ color: 'var(--color-error-text)', fontSize: 13 }}>{error}</p>}
          </>
        );
      case 2:
        return (
          <>
            <label>
              URL do avatar
              <input
                type="text"
                value={formData.avatarUrl || ''}
                onChange={(e) => setField('avatarUrl', e.target.value)}
                placeholder="https://..."
              />
            </label>
            <label>
              Bio profissional
              <textarea
                value={formData.bio || ''}
                onChange={(e) => setField('bio', e.target.value)}
                rows={4}
                placeholder="Conte sobre sua experiencia..."
              />
            </label>
          </>
        );
      default:
        return null;
    }
  }

  function renderCompanionStep(step: number) {
    switch (step) {
      case 0:
        return (
          <>
            <label>
              Nome
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => setField('name', e.target.value)}
                required
              />
            </label>
            <label>
              Relacionamento
              <select
                value={formData.relationship || ''}
                onChange={(e) => setField('relationship', e.target.value)}
                required
              >
                <option value="" disabled>
                  Selecione
                </option>
                {RELATIONSHIP_OPTIONS.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </label>
          </>
        );
      case 1:
        return (
          <>
            <label>
              Codigo de convite
              <input
                type="text"
                value={formData.inviteToken || ''}
                onChange={(e) => setField('inviteToken', e.target.value)}
                required
                placeholder="Cole aqui o codigo de convite da usuaria"
              />
            </label>
          </>
        );
      default:
        return null;
    }
  }

  function renderAcademyStep(step: number) {
    switch (step) {
      case 0:
        return (
          <>
            <label>
              CNPJ
              <input
                type="text"
                value={formData.cnpj || ''}
                onChange={(e) => setField('cnpj', e.target.value)}
                required
              />
            </label>
            <label>
              Nome da academia
              <input
                type="text"
                value={formData.academyName || ''}
                onChange={(e) => setField('academyName', e.target.value)}
                required
              />
            </label>
            <label>
              Endereco
              <input
                type="text"
                value={formData.address || ''}
                onChange={(e) => setField('address', e.target.value)}
                required
              />
            </label>
          </>
        );
      case 1:
        return (
          <div className="onboarding-pending">
            <p style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Aguardando aprovacao</p>
            <p>Voce sera notificada quando sua academia for aprovada.</p>
          </div>
        );
      default:
        return null;
    }
  }

  const isInfoOnly = profileType === 'academy_admin' && currentStep === 1;

  return (
    <Layout>
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '24px 16px' }}>
        <h2 style={{ marginBottom: 4 }}>Configure seu perfil</h2>
        <p className="muted" style={{ marginBottom: 16 }}>
          Etapa {currentStep + 1} de {totalSteps}
        </p>

        <div className="onboarding-progress">
          {Array.from({ length: totalSteps }, (_, i) => (
            <div
              key={i}
              className={`onboarding-progress-dot ${i < currentStep ? 'done' : i === currentStep ? 'active' : ''}`}
            />
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          {renderStepContent()}

          {error && !isInfoOnly && <div className="error" style={{ marginTop: 12 }}>{error}</div>}

          {!isInfoOnly && (
            <button type="submit" disabled={submitting} style={{ marginTop: 16, width: '100%' }}>
              {submitting
                ? 'Salvando...'
                : currentStep === totalSteps - 1
                  ? 'Concluir'
                  : 'Proximo'}
            </button>
          )}

          {isInfoOnly && (
            <button
              type="button"
              style={{ marginTop: 16, width: '100%' }}
              onClick={() => navigate('/dashboard', { replace: true })}
            >
              Ir para o painel
            </button>
          )}
        </form>
      </div>
    </Layout>
  );
}
