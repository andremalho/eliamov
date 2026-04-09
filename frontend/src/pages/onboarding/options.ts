export interface Option {
  value: string;
  label: string;
}

export interface OptionGroup {
  title: string;
  options: Option[];
}

export const GENDER_OPTIONS: Option[] = [
  { value: 'cis_woman', label: 'Mulher cis' },
  { value: 'trans_woman', label: 'Mulher trans' },
  { value: 'non_binary', label: 'Não-binárie' },
  { value: 'prefer_not', label: 'Prefiro não dizer' },
];

export const HEALTH_CONDITIONS_GROUPED: OptionGroup[] = [
  {
    title: 'Hormonais',
    options: [
      { value: 'pcos', label: 'SOP / Ovários policísticos' },
      { value: 'endometriosis', label: 'Endometriose' },
      { value: 'hypothyroidism', label: 'Hipotireoidismo' },
      { value: 'hyperthyroidism', label: 'Hipertireoidismo' },
      { value: 'menopause', label: 'Menopausa' },
    ],
  },
  {
    title: 'Metabólicas & cardiovasculares',
    options: [
      { value: 'diabetes', label: 'Diabetes' },
      { value: 'prediabetes', label: 'Pré-diabetes' },
      { value: 'hypertension', label: 'Hipertensão' },
      { value: 'high_cholesterol', label: 'Colesterol alto' },
    ],
  },
  {
    title: 'Reprodutivas',
    options: [
      { value: 'pregnant', label: 'Gestante' },
      { value: 'postpartum', label: 'Pós-parto' },
      { value: 'infertility', label: 'Investigando fertilidade' },
    ],
  },
  {
    title: 'Outras',
    options: [
      { value: 'osteoporosis', label: 'Osteoporose / Osteopenia' },
      { value: 'anxiety', label: 'Ansiedade' },
      { value: 'depression', label: 'Depressão' },
      { value: 'fibromyalgia', label: 'Fibromialgia' },
      { value: 'autoimmune', label: 'Doença autoimune' },
    ],
  },
];

export const FAMILY_HISTORY_GROUPED: OptionGroup[] = [
  {
    title: 'Metabólicas & cardiovasculares',
    options: [
      { value: 'fh_diabetes', label: 'Diabetes' },
      { value: 'fh_hypertension', label: 'Hipertensão' },
      { value: 'fh_cardiovascular', label: 'Doença cardiovascular' },
    ],
  },
  {
    title: 'Oncológicas',
    options: [
      { value: 'fh_breast_cancer', label: 'Câncer de mama' },
      { value: 'fh_ovarian_cancer', label: 'Câncer de ovário' },
      { value: 'fh_uterine_cancer', label: 'Câncer de útero' },
      { value: 'fh_colorectal', label: 'Câncer colorretal' },
    ],
  },
  {
    title: 'Outras',
    options: [
      { value: 'fh_thyroid', label: 'Doença da tireoide' },
      { value: 'fh_osteoporosis', label: 'Osteoporose' },
      { value: 'fh_autoimmune', label: 'Doença autoimune' },
    ],
  },
];

export const CONTRACEPTION: Option[] = [
  { value: 'none', label: 'Nenhum' },
  { value: 'pill_combined', label: 'Pílula combinada' },
  { value: 'pill_progestin', label: 'Pílula só progesterona' },
  { value: 'iud_hormonal', label: 'DIU hormonal' },
  { value: 'iud_copper', label: 'DIU de cobre' },
  { value: 'implant', label: 'Implante' },
  { value: 'injection', label: 'Injeção' },
  { value: 'condom', label: 'Camisinha' },
  { value: 'tubal', label: 'Laqueadura' },
  { value: 'vasectomy_partner', label: 'Vasectomia (parceiro)' },
];

export const MENOPAUSE_STATUS: Option[] = [
  { value: 'no', label: 'Não' },
  { value: 'perimenopause', label: 'Perimenopausa' },
  { value: 'menopause', label: 'Menopausa' },
  { value: 'post', label: 'Pós-menopausa' },
];

export const ACTIVITY_FREQ = [
  { value: 'sedentary', label: 'Sedentária', desc: '0–1× por semana' },
  { value: 'light', label: 'Leve', desc: '2× por semana' },
  { value: 'moderate', label: 'Moderada', desc: '3–4× por semana' },
  { value: 'active', label: 'Ativa', desc: '5× ou mais por semana' },
];

export interface IconOption extends Option {
  icon: string;
}

export const EXERCISE_PREF: IconOption[] = [
  { value: 'strength', label: 'Musculação', icon: 'dumbbell' },
  { value: 'cardio', label: 'Corrida', icon: 'run' },
  { value: 'yoga', label: 'Yoga & Pilates', icon: 'lotus' },
  { value: 'dance', label: 'Dança', icon: 'music' },
  { value: 'walking', label: 'Caminhada', icon: 'walk' },
  { value: 'swimming', label: 'Natação', icon: 'wave' },
  { value: 'cycling', label: 'Ciclismo', icon: 'bike' },
  { value: 'crossfit', label: 'CrossFit', icon: 'flame' },
  { value: 'other', label: 'Outro', icon: 'sparkle' },
];

export const DIET_PATTERN_GROUPED: OptionGroup[] = [
  {
    title: 'Padrão principal',
    options: [
      { value: 'omnivore', label: 'Onívora' },
      { value: 'vegetarian', label: 'Vegetariana' },
      { value: 'vegan', label: 'Vegana' },
      { value: 'pescatarian', label: 'Pescetariana' },
    ],
  },
  {
    title: 'Restrições',
    options: [
      { value: 'low_carb', label: 'Low-carb' },
      { value: 'mediterranean', label: 'Mediterrânea' },
      { value: 'gluten_free', label: 'Sem glúten' },
      { value: 'lactose_free', label: 'Sem lactose' },
    ],
  },
];

export const SMOKING: Option[] = [
  { value: 'never', label: 'Nunca fumei' },
  { value: 'former', label: 'Ex-fumante' },
  { value: 'current', label: 'Fumante' },
];

export const ALCOHOL: Option[] = [
  { value: 'never', label: 'Não consumo' },
  { value: 'rarely', label: 'Raramente' },
  { value: 'weekly', label: '1–2× por semana' },
  { value: 'frequent', label: '3+ × por semana' },
];

export const OBJECTIVES: IconOption[] = [
  { value: 'weight_loss', label: 'Perder peso', icon: 'scale' },
  { value: 'muscle_gain', label: 'Ganhar massa', icon: 'muscle' },
  { value: 'strength', label: 'Ganhar força', icon: 'dumbbell' },
  { value: 'mobility', label: 'Mobilidade', icon: 'stretch' },
  { value: 'cardio', label: 'Cardiovascular', icon: 'heart' },
  { value: 'pain_relief', label: 'Reduzir dor', icon: 'shield' },
  { value: 'fertility', label: 'Pré-concepção', icon: 'sprout' },
  { value: 'postpartum', label: 'Pós-parto', icon: 'baby' },
  { value: 'menopause_symptoms', label: 'Menopausa', icon: 'moon' },
  { value: 'bone_health', label: 'Saúde óssea', icon: 'bone' },
  { value: 'mental_health', label: 'Bem-estar mental', icon: 'brain' },
  { value: 'sleep', label: 'Sono', icon: 'sleep' },
  { value: 'energy', label: 'Energia', icon: 'bolt' },
  { value: 'wellbeing', label: 'Bem-estar geral', icon: 'flower' },
];

export const BARRIERS_GROUPED: OptionGroup[] = [
  {
    title: 'Tempo & rotina',
    options: [
      { value: 'time', label: 'Falta de tempo' },
      { value: 'family', label: 'Família e cuidados' },
      { value: 'inconsistency', label: 'Manter rotina' },
    ],
  },
  {
    title: 'Energia & motivação',
    options: [
      { value: 'motivation', label: 'Falta de motivação' },
      { value: 'energy', label: 'Cansaço' },
      { value: 'pain', label: 'Dor ou desconforto' },
    ],
  },
  {
    title: 'Acesso',
    options: [
      { value: 'knowledge', label: 'Não sei por onde começar' },
      { value: 'money', label: 'Custo' },
      { value: 'access', label: 'Acesso a academia/profissionais' },
    ],
  },
];

export const TRAINING_PLACE: IconOption[] = [
  { value: 'home', label: 'Em casa', icon: 'home' },
  { value: 'gym', label: 'Academia', icon: 'building' },
  { value: 'outdoor', label: 'Ar livre', icon: 'tree' },
  { value: 'studio', label: 'Estúdio', icon: 'leaf' },
];

export const CHECKIN_FREQ = [
  { value: 'daily', label: 'Diário', desc: 'Quero registrar todos os dias' },
  { value: 'weekly', label: 'Semanal', desc: 'Resumo na semana' },
  { value: 'biweekly', label: 'Quinzenal', desc: 'A cada 15 dias' },
];
