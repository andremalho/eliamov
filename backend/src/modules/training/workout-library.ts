export interface WorkoutTemplate {
  name: string;
  phase: 'menstrual' | 'follicular' | 'ovulatory' | 'luteal';
  type: string;
  duration: number; // minutes
  intensity: 'low' | 'moderate' | 'high' | 'max';
  rpe: string; // "3-5", "7-9", etc
  exercises: { name: string; sets?: number; reps?: string; duration?: string; rest?: string; notes?: string }[];
  description: string;
  reference: string;
}

export const WORKOUT_LIBRARY: WorkoutTemplate[] = [
  // MENSTRUAL (3 workouts)
  {
    name: 'Yoga restaurativa',
    phase: 'menstrual', type: 'yoga', duration: 25, intensity: 'low', rpe: '3-4',
    exercises: [
      { name: 'Balasana (crianca)', duration: '3 min', notes: 'Alivia dor lombar' },
      { name: 'Supta Baddha Konasana', duration: '3 min', notes: 'Abre quadril' },
      { name: 'Cat-Cow', sets: 1, reps: '10 ciclos', notes: 'Mobilidade coluna' },
      { name: 'Viparita Karani (pernas na parede)', duration: '5 min', notes: 'Reduz inchaco' },
      { name: 'Respiracao diafragmatica', duration: '5 min' },
      { name: 'Savasana com bolster', duration: '5 min' },
    ],
    description: 'Pratica suave para acolher seu corpo. Alivia colicas e reduz estresse.',
    reference: 'Schlie et al. 2025: pior performance durante sangramento. Exercicios leves recomendados.',
  },
  {
    name: 'Caminhada leve + alongamento',
    phase: 'menstrual', type: 'cardio', duration: 30, intensity: 'low', rpe: '3-5',
    exercises: [
      { name: 'Caminhada moderada', duration: '20 min', notes: '50-60% FCmax' },
      { name: 'Alongamento quadriceps', duration: '1 min cada lado' },
      { name: 'Alongamento isquiotibiais', duration: '1 min cada lado' },
      { name: 'Alongamento lombar', duration: '2 min' },
      { name: 'Respiracao profunda', duration: '3 min' },
    ],
    description: 'Movimento suave com foco em circulacao e bem-estar.',
    reference: 'McNulty et al. 2020: performance trivialmente reduzida. Manter ativa com baixa intensidade.',
  },
  {
    name: 'Mobilidade articular',
    phase: 'menstrual', type: 'mobility', duration: 20, intensity: 'low', rpe: '2-4',
    exercises: [
      { name: 'Circulos de quadril', sets: 2, reps: '10 cada direcao' },
      { name: 'Circulos de ombro', sets: 2, reps: '10 cada' },
      { name: 'Rotacao toracica', sets: 2, reps: '8 cada lado' },
      { name: 'Flexao plantar/dorsiflexao', sets: 2, reps: '15' },
      { name: 'Neck rolls', sets: 1, reps: '5 cada direcao' },
    ],
    description: 'Trabalho articular para manter mobilidade sem sobrecarregar.',
    reference: 'ACSM: mobilidade articular recomendada em dias de baixa energia.',
  },

  // FOLLICULAR (3 workouts)
  {
    name: 'Forca progressiva - membros inferiores',
    phase: 'follicular', type: 'strength', duration: 45, intensity: 'high', rpe: '7-9',
    exercises: [
      { name: 'Agachamento livre', sets: 4, reps: '8-10', rest: '90s' },
      { name: 'Leg press', sets: 3, reps: '10-12', rest: '60s' },
      { name: 'Stiff', sets: 3, reps: '10', rest: '60s' },
      { name: 'Cadeira extensora', sets: 3, reps: '12', rest: '45s' },
      { name: 'Elevacao de panturrilha', sets: 3, reps: '15', rest: '30s' },
      { name: 'Prancha', sets: 3, duration: '30s', rest: '30s' },
    ],
    description: 'Estrogeno crescente favorece ganho de forca. Momento ideal para progressao de carga!',
    reference: 'Estudo 18 atletas: pico de forca no half-squat na fase folicular tardia. Blagrove et al. 2022.',
  },
  {
    name: 'HIIT - intervalos de alta intensidade',
    phase: 'follicular', type: 'hiit', duration: 30, intensity: 'high', rpe: '8-9',
    exercises: [
      { name: 'Aquecimento (trote)', duration: '5 min' },
      { name: 'Sprint 30s + recuperacao 60s', sets: 6, notes: '85-90% FCmax' },
      { name: 'Burpees', sets: 3, reps: '10', rest: '45s' },
      { name: 'Mountain climbers', sets: 3, duration: '30s', rest: '30s' },
      { name: 'Desaquecimento + alongamento', duration: '5 min' },
    ],
    description: 'Fase ideal para HIIT. Energia alta, recuperacao rapida.',
    reference: 'Wen et al. 2025: capacidade maxima para exercicios de alta intensidade na fase folicular.',
  },
  {
    name: 'Forca - membros superiores + core',
    phase: 'follicular', type: 'strength', duration: 40, intensity: 'high', rpe: '7-8',
    exercises: [
      { name: 'Supino reto', sets: 4, reps: '8-10', rest: '90s' },
      { name: 'Remada curvada', sets: 3, reps: '10', rest: '60s' },
      { name: 'Desenvolvimento ombros', sets: 3, reps: '10', rest: '60s' },
      { name: 'Rosca biceps', sets: 3, reps: '12', rest: '45s' },
      { name: 'Triceps corda', sets: 3, reps: '12', rest: '45s' },
      { name: 'Prancha lateral', sets: 3, duration: '20s cada', rest: '30s' },
    ],
    description: 'Aproveite a energia folicular para ganhos de forca no upper body.',
    reference: 'ISSN Position Stand: treino resistido 2-4x/semana para mulheres ativas.',
  },

  // OVULATORY (3 workouts)
  {
    name: 'Performance maxima - full body',
    phase: 'ovulatory', type: 'strength', duration: 50, intensity: 'max', rpe: '8-10',
    exercises: [
      { name: 'Agachamento pesado', sets: 5, reps: '5', rest: '2 min', notes: '85-95% 1RM' },
      { name: 'Terra', sets: 4, reps: '5', rest: '2 min' },
      { name: 'Supino', sets: 4, reps: '6', rest: '90s' },
      { name: 'Barra fixa (ou assistida)', sets: 3, reps: 'max', rest: '90s' },
      { name: 'Core: ab wheel', sets: 3, reps: '10', rest: '45s' },
    ],
    description: 'Pico de estrogeno = pico de forca. Dia de tentar PRs! ATENCAO: aquecimento prolongado pela laxidez ligamentar.',
    reference: 'Estudo 18 atletas: performance maxima na ovulacao. ALERTA: risco ligamentar aumentado (relaxina).',
  },
  {
    name: 'Cardio de alta performance',
    phase: 'ovulatory', type: 'cardio', duration: 40, intensity: 'max', rpe: '8-9',
    exercises: [
      { name: 'Aquecimento', duration: '5 min' },
      { name: 'Corrida intervalada: 2 min rapido + 1 min leve', sets: 8, notes: '80-90% FCmax' },
      { name: 'Desaquecimento', duration: '5 min' },
      { name: 'Alongamento global', duration: '5 min' },
    ],
    description: 'Maximo VO2 e economia de corrida. Performance de pico.',
    reference: 'Wen et al. 2025: mecanismos hormonais favorecem performance na ovulacao.',
  },
  {
    name: 'Treino funcional explosivo',
    phase: 'ovulatory', type: 'functional', duration: 35, intensity: 'high', rpe: '8-9',
    exercises: [
      { name: 'Box jumps', sets: 4, reps: '8', rest: '60s' },
      { name: 'Kettlebell swings', sets: 4, reps: '12', rest: '45s' },
      { name: 'Thruster', sets: 3, reps: '10', rest: '60s' },
      { name: 'Battle ropes', sets: 3, duration: '30s', rest: '30s' },
      { name: 'Estabilizacao neuromuscular (bosu)', sets: 2, duration: '30s', notes: 'Protecao ligamentar' },
    ],
    description: 'Treino explosivo aproveitando o pico hormonal. Inclui estabilizacao para protecao ligamentar.',
    reference: 'Prevencao LCA: exercicios neuromusculares na ovulacao. Incidencia LCA 2-8x maior em mulheres.',
  },

  // LUTEAL (3 workouts)
  {
    name: 'Pilates mat',
    phase: 'luteal', type: 'pilates', duration: 35, intensity: 'moderate', rpe: '5-6',
    exercises: [
      { name: 'The Hundred', sets: 1, reps: '100 pulsos' },
      { name: 'Roll-up', sets: 1, reps: '8' },
      { name: 'Single leg stretch', sets: 1, reps: '10 cada' },
      { name: 'Swimming', sets: 1, reps: '20 pulsos' },
      { name: 'Side kicks', sets: 1, reps: '8 cada lado' },
      { name: 'Spine stretch', sets: 1, reps: '5' },
      { name: 'Seal', sets: 1, reps: '8' },
    ],
    description: 'Treino de controle e estabilizacao. Progesterona alta favorece trabalho moderado.',
    reference: 'McNulty 2020: performance pode ser reduzida na fase lutea. Intensidade moderada recomendada.',
  },
  {
    name: 'Treino moderado - full body',
    phase: 'luteal', type: 'strength', duration: 40, intensity: 'moderate', rpe: '5-7',
    exercises: [
      { name: 'Agachamento goblet', sets: 3, reps: '12', rest: '60s' },
      { name: 'Remada unilateral', sets: 3, reps: '10 cada', rest: '45s' },
      { name: 'Elevacao lateral', sets: 3, reps: '12', rest: '30s' },
      { name: 'Cadeira flexora', sets: 3, reps: '12', rest: '45s' },
      { name: 'Prancha com toque no ombro', sets: 3, reps: '8 cada', rest: '30s' },
    ],
    description: 'Manter a frequencia com intensidade moderada. Respeite a fadiga da fase lutea.',
    reference: 'POMS: fadiga e depressao aumentadas na fase lutea tardia. Intensidade moderada recomendada.',
  },
  {
    name: 'Reducao de cortisol - alongamento e respiracao',
    phase: 'luteal', type: 'recovery', duration: 25, intensity: 'low', rpe: '3-4',
    exercises: [
      { name: 'Respiracao 4-7-8', sets: 5, notes: 'Inspira 4s, segura 7s, expira 8s' },
      { name: 'Alongamento cadeia posterior', duration: '3 min' },
      { name: 'Piriforme stretch', duration: '1 min cada' },
      { name: 'Thread the needle', sets: 1, reps: '8 cada lado' },
      { name: 'Foam rolling', duration: '5 min', notes: 'Quadriceps, IT band, lombar' },
      { name: 'Meditacao corporal guiada', duration: '5 min' },
    ],
    description: 'Foco em recuperacao e reducao de cortisol. Prepare-se para o proximo ciclo.',
    reference: 'Estudo HIIT: percepcao de esforco aumentada na fase lutea. Recuperacao ativa recomendada.',
  },
];
