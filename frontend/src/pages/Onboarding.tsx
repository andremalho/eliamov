import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { usersApi } from '../services/users.api';
import Layout from '../components/Layout';
import {
  ChipMulti,
  ChipSingle,
  Checklist,
  ChecklistGrouped,
  OptionList,
  IconGrid,
  Field,
  FieldGroup,
} from './onboarding/widgets';
import {
  GENDER_OPTIONS,
  HEALTH_CONDITIONS_GROUPED,
  FAMILY_HISTORY_GROUPED,
  CONTRACEPTION,
  MENOPAUSE_STATUS,
  ACTIVITY_FREQ,
  EXERCISE_PREF,
  DIET_PATTERN_GROUPED,
  SMOKING,
  ALCOHOL,
  OBJECTIVES,
  BARRIERS_GROUPED,
  TRAINING_PLACE,
  CHECKIN_FREQ,
} from './onboarding/options';

interface FormState {
  // Identidade
  birthDate: string;
  gender: string;
  city: string;
  phone: string;

  // Antropometria
  weight: number | '';
  height: number | '';
  desiredWeight: number | '';
  waist: number | '';

  // Histórico ginecológico
  menarcheAge: number | '';
  cycleRegular: '' | 'yes' | 'no' | 'unknown';
  cycleLength: number | '';
  periodLength: number | '';
  lastPeriod: string;
  pregnancies: number | '';
  births: number | '';
  contraception: string;
  menopauseStatus: string;

  // Histórico clínico
  healthConditions: string[];
  familyHistory: string[];
  surgeries: string;
  medications: string;
  allergies: string;

  // Estilo de vida
  activityFreq: string;
  exercisePref: string[];
  sleepQuality: number;
  stressLevel: number;
  dietPattern: string[];
  smoking: string;
  alcohol: string;
  waterIntake: number | '';

  // Objetivos
  objectives: string[];
  motivation: string;
  barriers: string[];

  // Preferências
  trainingPlace: string[];
  hoursPerWeek: number | '';
  checkinFreq: string;
}

const initialState = (existing: any): FormState => ({
  birthDate: existing?.birthDate?.slice(0, 10) ?? '',
  gender: existing?.profile?.gender ?? '',
  city: existing?.profile?.city ?? '',
  phone: existing?.profile?.phone ?? '',
  weight: existing?.weight ?? '',
  height: existing?.height ?? '',
  desiredWeight: existing?.profile?.desiredWeight ?? '',
  waist: existing?.profile?.waist ?? '',
  menarcheAge: existing?.profile?.menarcheAge ?? '',
  cycleRegular: existing?.profile?.cycleRegular ?? '',
  cycleLength: existing?.profile?.cycleLength ?? '',
  periodLength: existing?.profile?.periodLength ?? '',
  lastPeriod: existing?.profile?.lastPeriod ?? '',
  pregnancies: existing?.profile?.pregnancies ?? '',
  births: existing?.profile?.births ?? '',
  contraception: existing?.profile?.contraception ?? '',
  menopauseStatus: existing?.profile?.menopauseStatus ?? '',
  healthConditions: existing?.healthConditions ?? [],
  familyHistory: existing?.profile?.familyHistory ?? [],
  surgeries: existing?.profile?.surgeries ?? '',
  medications: existing?.profile?.medications ?? '',
  allergies: existing?.profile?.allergies ?? '',
  activityFreq: existing?.fitnessLevel ?? '',
  exercisePref: existing?.profile?.exercisePref ?? [],
  sleepQuality: existing?.profile?.sleepQuality ?? 3,
  stressLevel: existing?.profile?.stressLevel ?? 3,
  dietPattern: existing?.profile?.dietPattern ?? [],
  smoking: existing?.profile?.smoking ?? '',
  alcohol: existing?.profile?.alcohol ?? '',
  waterIntake: existing?.profile?.waterIntake ?? '',
  objectives: existing?.profile?.objectives ?? [],
  motivation: existing?.profile?.motivation ?? '',
  barriers: existing?.profile?.barriers ?? [],
  trainingPlace: existing?.profile?.trainingPlace ?? [],
  hoursPerWeek: existing?.profile?.hoursPerWeek ?? '',
  checkinFreq: existing?.profile?.checkinFreq ?? 'weekly',
});

const STEPS = [
  { id: 'identidade', label: 'Identidade' },
  { id: 'corpo', label: 'Corpo' },
  { id: 'gine', label: 'Ginecológico' },
  { id: 'clinico', label: 'Clínico' },
  { id: 'estilo', label: 'Estilo de vida' },
  { id: 'objetivos', label: 'Objetivos' },
  { id: 'motivacao', label: 'Motivação' },
  { id: 'jornada', label: 'Jornada' },
];

const SCALE_5 = [1, 2, 3, 4, 5];

const FITNESS_LEVEL_MAP: Record<string, 'sedentary' | 'beginner' | 'intermediate' | 'advanced'> = {
  sedentary: 'sedentary',
  light: 'beginner',
  moderate: 'intermediate',
  active: 'advanced',
};

export default function Onboarding() {
  const navigate = useNavigate();
  const { currentUser, setCurrentUser } = useAuth();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(() => initialState(currentUser));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const bmi = useMemo(() => {
    if (!form.weight || !form.height) return null;
    return (Number(form.weight) / Math.pow(Number(form.height) / 100, 2)).toFixed(1);
  }, [form.weight, form.height]);

  const goNext = () => setStep((s) => Math.min(STEPS.length - 1, s + 1));
  const goBack = () => setStep((s) => Math.max(0, s - 1));

  const handleSubmit = async () => {
    setError(null);
    setSubmitting(true);
    try {
      const profile = {
        gender: form.gender || undefined,
        city: form.city || undefined,
        phone: form.phone || undefined,
        desiredWeight: form.desiredWeight === '' ? undefined : Number(form.desiredWeight),
        waist: form.waist === '' ? undefined : Number(form.waist),
        menarcheAge: form.menarcheAge === '' ? undefined : Number(form.menarcheAge),
        cycleRegular: form.cycleRegular || undefined,
        cycleLength: form.cycleLength === '' ? undefined : Number(form.cycleLength),
        periodLength: form.periodLength === '' ? undefined : Number(form.periodLength),
        lastPeriod: form.lastPeriod || undefined,
        pregnancies: form.pregnancies === '' ? undefined : Number(form.pregnancies),
        births: form.births === '' ? undefined : Number(form.births),
        contraception: form.contraception || undefined,
        menopauseStatus: form.menopauseStatus || undefined,
        familyHistory: form.familyHistory.length > 0 ? form.familyHistory : undefined,
        surgeries: form.surgeries || undefined,
        medications: form.medications || undefined,
        allergies: form.allergies || undefined,
        exercisePref: form.exercisePref.length > 0 ? form.exercisePref : undefined,
        sleepQuality: form.sleepQuality,
        stressLevel: form.stressLevel,
        dietPattern: form.dietPattern.length > 0 ? form.dietPattern : undefined,
        smoking: form.smoking || undefined,
        alcohol: form.alcohol || undefined,
        waterIntake: form.waterIntake === '' ? undefined : Number(form.waterIntake),
        objectives: form.objectives.length > 0 ? form.objectives : undefined,
        motivation: form.motivation || undefined,
        barriers: form.barriers.length > 0 ? form.barriers : undefined,
        trainingPlace: form.trainingPlace.length > 0 ? form.trainingPlace : undefined,
        hoursPerWeek: form.hoursPerWeek === '' ? undefined : Number(form.hoursPerWeek),
        checkinFreq: form.checkinFreq || undefined,
      };

      const updated = await usersApi.updateMe({
        birthDate: form.birthDate || undefined,
        weight: form.weight === '' ? undefined : Number(form.weight),
        height: form.height === '' ? undefined : Number(form.height),
        healthConditions: form.healthConditions.length > 0 ? form.healthConditions : undefined,
        fitnessLevel: form.activityFreq ? FITNESS_LEVEL_MAP[form.activityFreq] : undefined,
        profile,
        markOnboardingComplete: true,
      });
      setCurrentUser(updated);
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Falha ao salvar';
      setError(Array.isArray(msg) ? msg.join(', ') : msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSkip = () => navigate('/dashboard', { replace: true });

  const isLast = step === STEPS.length - 1;
  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <Layout
      title="Vamos te conhecer"
      subtitle="Quanto mais soubermos, melhor a IA personaliza sua jornada."
    >
      <div className="wizard">
        <div className="wizard-progress">
          <div className="wizard-progress-bar" style={{ width: `${progress}%` }} />
        </div>
        <div className="wizard-step-label muted small">
          Etapa {step + 1} de {STEPS.length} · {STEPS[step].label}
        </div>

        <div className="wizard-step" key={step}>
        {step === 0 && (
          <section className="card">
            <h3>Identidade</h3>
            <div className="form-grid">
              <Field label="Data de nascimento">
                <input
                  type="date"
                  value={form.birthDate}
                  max={new Date().toISOString().slice(0, 10)}
                  onChange={(e) => update('birthDate', e.target.value)}
                />
              </Field>
              <FieldGroup label="Como você se identifica?">
                <ChipSingle
                  options={GENDER_OPTIONS}
                  value={form.gender}
                  onChange={(v) => update('gender', v)}
                  columns={2}
                />
              </FieldGroup>
              <Field label="Cidade (opcional)">
                <input
                  type="text"
                  value={form.city}
                  onChange={(e) => update('city', e.target.value)}
                  placeholder="Ex: São Paulo, SP"
                />
              </Field>
              <Field label="Telefone (opcional)">
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => update('phone', e.target.value)}
                  placeholder="(11) 99999-9999"
                />
              </Field>
            </div>
          </section>
        )}

        {step === 1 && (
          <section className="card">
            <h3>Seu corpo hoje</h3>
            <div className="form-grid">
              <div className="row-2">
                <Field label="Peso atual (kg)">
                  <input
                    type="number"
                    min={20}
                    max={300}
                    step={0.1}
                    value={form.weight}
                    onChange={(e) =>
                      update('weight', e.target.value === '' ? '' : Number(e.target.value))
                    }
                  />
                </Field>
                <Field label="Altura (cm)">
                  <input
                    type="number"
                    min={80}
                    max={250}
                    value={form.height}
                    onChange={(e) =>
                      update('height', e.target.value === '' ? '' : Number(e.target.value))
                    }
                  />
                </Field>
              </div>
              <div className="row-2">
                <Field label="Peso desejado (kg)" hint="Opcional">
                  <input
                    type="number"
                    min={20}
                    max={300}
                    step={0.1}
                    value={form.desiredWeight}
                    onChange={(e) =>
                      update('desiredWeight', e.target.value === '' ? '' : Number(e.target.value))
                    }
                  />
                </Field>
                <Field label="Cintura (cm)" hint="Opcional">
                  <input
                    type="number"
                    min={40}
                    max={200}
                    value={form.waist}
                    onChange={(e) =>
                      update('waist', e.target.value === '' ? '' : Number(e.target.value))
                    }
                  />
                </Field>
              </div>
              {bmi && (
                <div className="info-pill">
                  IMC calculado: <strong>{bmi}</strong>
                </div>
              )}
            </div>
          </section>
        )}

        {step === 2 && (
          <section className="card">
            <h3>Histórico ginecológico</h3>
            <div className="form-grid">
              <Field label="Idade da primeira menstruação (menarca)">
                <input
                  type="number"
                  min={6}
                  max={20}
                  value={form.menarcheAge}
                  onChange={(e) =>
                    update('menarcheAge', e.target.value === '' ? '' : Number(e.target.value))
                  }
                />
              </Field>
              <FieldGroup label="Seu ciclo é regular?">
                <ChipSingle
                  options={[
                    { value: 'yes', label: 'Sim' },
                    { value: 'no', label: 'Não' },
                    { value: 'unknown', label: 'Não sei' },
                  ]}
                  value={form.cycleRegular}
                  onChange={(v) => update('cycleRegular', v as any)}
                  columns={3}
                />
              </FieldGroup>
              <div className="row-2">
                <Field label="Duração média do ciclo (dias)">
                  <input
                    type="number"
                    min={20}
                    max={45}
                    value={form.cycleLength}
                    onChange={(e) =>
                      update('cycleLength', e.target.value === '' ? '' : Number(e.target.value))
                    }
                  />
                </Field>
                <Field label="Duração do período (dias)">
                  <input
                    type="number"
                    min={1}
                    max={15}
                    value={form.periodLength}
                    onChange={(e) =>
                      update('periodLength', e.target.value === '' ? '' : Number(e.target.value))
                    }
                  />
                </Field>
              </div>
              <Field label="Última menstruação (1º dia)">
                <input
                  type="date"
                  value={form.lastPeriod}
                  max={new Date().toISOString().slice(0, 10)}
                  onChange={(e) => update('lastPeriod', e.target.value)}
                />
              </Field>
              <div className="row-2">
                <Field label="Gestações">
                  <input
                    type="number"
                    min={0}
                    max={20}
                    value={form.pregnancies}
                    onChange={(e) =>
                      update('pregnancies', e.target.value === '' ? '' : Number(e.target.value))
                    }
                  />
                </Field>
                <Field label="Partos">
                  <input
                    type="number"
                    min={0}
                    max={20}
                    value={form.births}
                    onChange={(e) =>
                      update('births', e.target.value === '' ? '' : Number(e.target.value))
                    }
                  />
                </Field>
              </div>
              <FieldGroup label="Contracepção em uso">
                <Checklist
                  options={CONTRACEPTION}
                  value={form.contraception}
                  onChange={(v) => update('contraception', v)}
                />
              </FieldGroup>
              <FieldGroup label="Você está em menopausa?">
                <ChipSingle
                  options={MENOPAUSE_STATUS}
                  value={form.menopauseStatus}
                  onChange={(v) => update('menopauseStatus', v)}
                  columns={2}
                />
              </FieldGroup>
            </div>
          </section>
        )}

        {step === 3 && (
          <section className="card">
            <h3>Histórico clínico</h3>
            <div className="form-grid">
              <FieldGroup
                label="Condições de saúde atuais"
                hint="Selecione tudo que se aplica."
              >
                <ChecklistGrouped
                  groups={HEALTH_CONDITIONS_GROUPED}
                  value={form.healthConditions}
                  onChange={(v) => update('healthConditions', v)}
                />
              </FieldGroup>
              <FieldGroup
                label="Histórico familiar relevante"
                hint="Doenças que pais, irmãos ou avós já tiveram."
              >
                <ChecklistGrouped
                  groups={FAMILY_HISTORY_GROUPED}
                  value={form.familyHistory}
                  onChange={(v) => update('familyHistory', v)}
                />
              </FieldGroup>
              <Field label="Cirurgias anteriores" hint="Texto livre — opcional">
                <textarea
                  rows={2}
                  value={form.surgeries}
                  onChange={(e) => update('surgeries', e.target.value)}
                  placeholder="Ex: cesárea em 2020, cirurgia de joelho…"
                />
              </Field>
              <Field label="Medicações em uso" hint="Texto livre — opcional">
                <textarea
                  rows={2}
                  value={form.medications}
                  onChange={(e) => update('medications', e.target.value)}
                  placeholder="Ex: levotiroxina, anticoncepcional, vitamina D…"
                />
              </Field>
              <Field label="Alergias" hint="Texto livre — opcional">
                <textarea
                  rows={2}
                  value={form.allergies}
                  onChange={(e) => update('allergies', e.target.value)}
                  placeholder="Ex: penicilina, frutos do mar…"
                />
              </Field>
            </div>
          </section>
        )}

        {step === 4 && (
          <section className="card">
            <h3>Estilo de vida</h3>
            <div className="form-grid">
              <FieldGroup label="Frequência atual de exercício">
                <OptionList
                  options={ACTIVITY_FREQ}
                  value={form.activityFreq}
                  onChange={(v) => update('activityFreq', v)}
                />
              </FieldGroup>
              <FieldGroup label="Tipos de exercício que você gosta">
                <IconGrid
                  options={EXERCISE_PREF}
                  value={form.exercisePref}
                  onChange={(v) => update('exercisePref', v)}
                  columns={3}
                />
              </FieldGroup>
              <FieldGroup label="Qualidade do sono">
                <div className="scale">
                  {SCALE_5.map((n) => (
                    <button
                      key={n}
                      type="button"
                      className={`scale-btn ${form.sleepQuality === n ? 'active' : ''}`}
                      onClick={() => update('sleepQuality', n)}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </FieldGroup>
              <FieldGroup label="Nível de estresse">
                <div className="scale">
                  {SCALE_5.map((n) => (
                    <button
                      key={n}
                      type="button"
                      className={`scale-btn ${form.stressLevel === n ? 'active' : ''}`}
                      onClick={() => update('stressLevel', n)}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </FieldGroup>
              <FieldGroup label="Padrão alimentar">
                <ChecklistGrouped
                  groups={DIET_PATTERN_GROUPED}
                  value={form.dietPattern}
                  onChange={(v) => update('dietPattern', v)}
                />
              </FieldGroup>
              <FieldGroup label="Tabagismo">
                <ChipSingle
                  options={SMOKING}
                  value={form.smoking}
                  onChange={(v) => update('smoking', v)}
                  columns={3}
                />
              </FieldGroup>
              <FieldGroup label="Álcool">
                <ChipSingle
                  options={ALCOHOL}
                  value={form.alcohol}
                  onChange={(v) => update('alcohol', v)}
                  columns={2}
                />
              </FieldGroup>
              <Field label="Copos de água por dia" hint="Aproximado">
                <input
                  type="number"
                  min={0}
                  max={20}
                  value={form.waterIntake}
                  onChange={(e) =>
                    update('waterIntake', e.target.value === '' ? '' : Number(e.target.value))
                  }
                />
              </Field>
            </div>
          </section>
        )}

        {step === 5 && (
          <section className="card">
            <h3>Seus objetivos</h3>
            <p className="field-hint" style={{ marginBottom: 16 }}>
              Selecione os que mais importam pra você agora.
            </p>
            <IconGrid
              options={OBJECTIVES}
              value={form.objectives}
              onChange={(v) => update('objectives', v)}
              columns={2}
            />
          </section>
        )}

        {step === 6 && (
          <section className="card">
            <h3>Motivação & barreiras</h3>
            <div className="form-grid">
              <Field label="Por que esses objetivos importam pra você?" hint="Conta sua história — é o que faz a IA te entender de verdade.">
                <textarea
                  rows={4}
                  value={form.motivation}
                  onChange={(e) => update('motivation', e.target.value)}
                  placeholder="Ex: quero ter mais energia pra brincar com meus filhos, voltar a correr, me sentir bem na minha pele…"
                />
              </Field>
              <FieldGroup label="O que tem te impedido?" hint="Selecione tudo que se aplica.">
                <ChecklistGrouped
                  groups={BARRIERS_GROUPED}
                  value={form.barriers}
                  onChange={(v) => update('barriers', v)}
                />
              </FieldGroup>
            </div>
          </section>
        )}

        {step === 7 && (
          <section className="card">
            <h3>Como você quer essa jornada?</h3>
            <div className="form-grid">
              <FieldGroup label="Onde você prefere treinar?">
                <IconGrid
                  options={TRAINING_PLACE}
                  value={form.trainingPlace}
                  onChange={(v) => update('trainingPlace', v)}
                  columns={2}
                />
              </FieldGroup>
              <Field label="Horas por semana disponíveis para se cuidar">
                <input
                  type="number"
                  min={0}
                  max={40}
                  value={form.hoursPerWeek}
                  onChange={(e) =>
                    update('hoursPerWeek', e.target.value === '' ? '' : Number(e.target.value))
                  }
                />
              </Field>
              <FieldGroup label="Frequência de check-in">
                <OptionList
                  options={CHECKIN_FREQ}
                  value={form.checkinFreq}
                  onChange={(v) => update('checkinFreq', v)}
                />
              </FieldGroup>
            </div>
          </section>
        )}
        </div>

        {error && <div className="error">{error}</div>}

        <div className="wizard-actions">
          {step > 0 ? (
            <button type="button" className="link-button" onClick={goBack}>
              ← Voltar
            </button>
          ) : (
            <button type="button" className="link-button" onClick={handleSkip}>
              Pular por agora
            </button>
          )}
          {!isLast ? (
            <button type="button" className="btn-primary" onClick={goNext}>
              Próximo →
            </button>
          ) : (
            <button
              type="button"
              className="btn-primary"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? 'Salvando…' : 'Concluir'}
            </button>
          )}
        </div>
      </div>
    </Layout>
  );
}
