import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CycleEntry } from '../cycle/entities/cycle.entity';
import { MedicationEntity } from '../medications/entities/medication.entity';
import { MentalHealthAssessmentEntity } from '../mental-health/entities/mental-health-assessment.entity';
import { DailyLogEntity } from '../daily-log/entities/daily-log.entity';

export type PhaseContext = {
  phase: string;
  cycleDay: number | null;
  daysUntilNextPeriod: number | null;
  trainingRecommendation: TrainingRec;
  nutritionRecommendation: NutritionRec;
  mentalHealthAlert: MentalHealthAlert | null;
  medicationInteractions: string[];
  wellnessTips: string[];
};

type TrainingRec = {
  intensity: 'rest' | 'light' | 'moderate' | 'high' | 'peak';
  label: string;
  types: string[];
  avoid: string[];
  rationale: string;
};

type NutritionRec = {
  focus: string[];
  foods: string[];
  avoid: string[];
  hydration: string;
};

type MentalHealthAlert = {
  level: 'info' | 'warning' | 'alert';
  message: string;
};

@Injectable()
export class CorrelationService {
  constructor(
    @InjectRepository(CycleEntry) private readonly cycleRepo: Repository<CycleEntry>,
    @InjectRepository(MedicationEntity) private readonly medRepo: Repository<MedicationEntity>,
    @InjectRepository(MentalHealthAssessmentEntity) private readonly assessmentRepo: Repository<MentalHealthAssessmentEntity>,
    @InjectRepository(DailyLogEntity) private readonly dailyLogRepo: Repository<DailyLogEntity>,
  ) {}

  async getPhaseContext(userId: string): Promise<PhaseContext> {
    const cycle = await this.cycleRepo.findOne({ where: { userId }, order: { startDate: 'DESC' } });
    const phase = cycle?.phase ?? 'unknown';
    const cycleLength = cycle?.cycleLength ?? 28;
    let cycleDay: number | null = null;
    let daysUntilNextPeriod: number | null = null;

    if (cycle?.startDate) {
      const start = new Date(cycle.startDate);
      const today = new Date();
      cycleDay = Math.floor((today.getTime() - start.getTime()) / 86400000) + 1;
      daysUntilNextPeriod = Math.max(0, cycleLength - cycleDay + 1);
    }

    const [medications, recentAssessments, todayLog] = await Promise.all([
      this.medRepo.find({ where: { userId, active: true } }),
      this.assessmentRepo.find({ where: { userId }, order: { createdAt: 'DESC' }, take: 5 }),
      this.dailyLogRepo.findOne({ where: { userId, logDate: new Date().toISOString().split('T')[0] } }),
    ]);

    return {
      phase, cycleDay, daysUntilNextPeriod,
      trainingRecommendation: this.getTrainingRec(phase, todayLog),
      nutritionRecommendation: this.getNutritionRec(phase, medications),
      mentalHealthAlert: this.getMentalHealthAlert(phase, recentAssessments, todayLog),
      medicationInteractions: this.getMedicationInteractions(phase, medications),
      wellnessTips: this.getWellnessTips(phase, todayLog, cycleDay),
    };
  }

  private getTrainingRec(phase: string, log: DailyLogEntity | null): TrainingRec {
    const energy = log?.energyLevel ?? null;
    const recs: Record<string, TrainingRec> = {
      menstrual: { intensity: energy !== null && energy <= 2 ? 'rest' : 'light', label: 'Movimento suave', types: ['Yoga restaurativa', 'Caminhada leve', 'Alongamento', 'Pilates suave'], avoid: ['HIIT', 'Treino pesado de forca', 'Treino de alta intensidade'], rationale: 'Niveis de estrogeno e progesterona estao baixos. O corpo pede descanso ativo.' },
      follicular: { intensity: 'moderate', label: 'Construcao progressiva', types: ['Musculacao', 'Corrida moderada', 'Ciclismo', 'Danca'], avoid: ['Overtraining'], rationale: 'Estrogeno em ascensao melhora recuperacao e coordenacao. Otimo para aprender movimentos novos.' },
      ovulatory: { intensity: 'peak', label: 'Performance maxima', types: ['HIIT', 'Treino de forca maxima', 'Competicoes', 'Sprints'], avoid: [], rationale: 'Pico de estrogeno e testosterona. Momento de maior forca, resistencia e motivacao.' },
      luteal: { intensity: energy !== null && energy <= 2 ? 'light' : 'moderate', label: 'Manutencao e foco', types: ['Pilates', 'Yoga', 'Natacao', 'Caminhada', 'Treino moderado de forca'], avoid: ['Treino de alta intensidade nos ultimos 5 dias da fase'], rationale: 'Progesterona elevada aumenta temperatura corporal e percepcao de esforco.' },
      unknown: { intensity: 'moderate', label: 'Treino equilibrado', types: ['Qualquer atividade de intensidade moderada'], avoid: [], rationale: 'Registre seu ciclo para recomendacoes personalizadas.' },
    };
    return recs[phase] ?? recs['unknown'];
  }

  private getNutritionRec(phase: string, medications: MedicationEntity[]): NutritionRec {
    const hasThyroid = medications.some(m => m.category === 'thyroid');
    const hasAntidepressant = medications.some(m => m.category === 'antidepressant');
    const recs: Record<string, NutritionRec> = {
      menstrual: { focus: ['Ferro', 'Vitamina C', 'Magnesio', 'Omega-3'], foods: ['Folhas verdes escuras', 'Feijao', 'Carne vermelha magra', 'Chocolate amargo', 'Salmao', 'Nozes', 'Frutas citricas'], avoid: ['Excesso de sal', 'Alcool', 'Cafeina em excesso'], hydration: 'Aumente a ingestao de agua. Cha de gengibre pode ajudar com colicas.' },
      follicular: { focus: ['Proteina', 'Zinco', 'Vitamina E', 'Probioticos'], foods: ['Ovos', 'Leguminosas', 'Sementes de abobora', 'Brocolis', 'Iogurte natural', 'Azeite', 'Abacate'], avoid: ['Alimentos ultraprocessados'], hydration: 'Hidratacao regular. Agua com limao pela manha.' },
      ovulatory: { focus: ['Antioxidantes', 'Fibras', 'Vitamina B'], foods: ['Frutas vermelhas', 'Espinafre', 'Quinoa', 'Grao-de-bico', 'Cenoura', 'Beterraba'], avoid: ['Excesso de gordura saturada'], hydration: 'Agua de coco e boa opcao nesta fase.' },
      luteal: { focus: ['Calcio', 'Vitamina B6', 'Complexo B', 'Magnesio'], foods: ['Banana', 'Batata-doce', 'Leite e derivados', 'Sementes de girassol', 'Frango', 'Arroz integral'], avoid: ['Acucar refinado', 'Alcool', 'Cafeina em excesso (piora TPM)'], hydration: 'Reduza sodio para diminuir retencao de liquidos.' },
      unknown: { focus: ['Alimentacao equilibrada'], foods: ['Frutas', 'Verduras', 'Proteinas magras', 'Graos integrais'], avoid: ['Ultraprocessados', 'Acucar em excesso'], hydration: 'Beba pelo menos 2 litros de agua por dia.' },
    };
    const rec = { ...(recs[phase] ?? recs['unknown']), avoid: [...(recs[phase] ?? recs['unknown']).avoid] };
    if (hasThyroid) rec.avoid.push('Soja em excesso proxima ao horario da medicacao tireoidiana');
    if (hasAntidepressant) rec.avoid.push('Alcool (interage com antidepressivos)');
    return rec;
  }

  private getMentalHealthAlert(phase: string, assessments: MentalHealthAssessmentEntity[], log: DailyLogEntity | null): MentalHealthAlert | null {
    const lastPhq9 = assessments.find(a => a.assessmentType === 'phq9');
    if (phase === 'luteal') {
      if (lastPhq9 && lastPhq9.totalScore >= 10) return { level: 'warning', message: 'Fase lutea tende a intensificar sintomas depressivos. Seu ultimo PHQ-9 indica atencao. Considere fazer uma nova avaliacao.' };
      if ((log?.irritability ?? 0) >= 4 || (log?.anxiety ?? 0) >= 4) return { level: 'info', message: 'Irritabilidade e ansiedade elevadas sao comuns na fase lutea. Tecnicas de respiracao e exercicio leve podem ajudar.' };
      return { level: 'info', message: 'Voce esta na fase lutea. E normal sentir mais sensibilidade emocional neste periodo.' };
    }
    if (phase === 'menstrual' && lastPhq9 && lastPhq9.totalScore >= 15) return { level: 'alert', message: 'Seu ultimo registro de humor indica sofrimento significativo. Conversar com seu medico pode ser importante.' };
    return null;
  }

  private getMedicationInteractions(phase: string, medications: MedicationEntity[]): string[] {
    const tips: string[] = [];
    if (medications.some(m => m.category === 'hormonal_contraceptive' || m.category === 'hormonal_iud')) tips.push('Anticoncepcional hormonal pode reduzir a variacao de sintomas entre as fases.');
    if (medications.some(m => m.category === 'antidepressant') && phase === 'luteal') tips.push('ISRS pode ser menos eficaz na fase lutea em algumas mulheres. Converse com seu medico se notar piora.');
    if (medications.some(m => m.category === 'progesterone')) tips.push('Progesterona exogena pode causar sintomas similares a fase lutea independente da fase atual.');
    return tips;
  }

  private getWellnessTips(phase: string, log: DailyLogEntity | null, cycleDay: number | null): string[] {
    const tips: string[] = [];
    if (phase === 'menstrual') { tips.push('Bolsa de agua quente pode aliviar colicas.'); tips.push('Priorize descanso e sono de qualidade.'); }
    if (phase === 'follicular') { tips.push('Otimo momento para iniciar novos projetos e habitos.'); tips.push('Sua criatividade e disposicao estao em alta.'); }
    if (phase === 'ovulatory') { tips.push('Voce esta no pico de energia e comunicacao social.'); tips.push('Reunioes importantes e decisoes estrategicas se saem melhor agora.'); }
    if (phase === 'luteal') { tips.push('Reduza estimulos excessivos nos ultimos dias antes da menstruacao.'); tips.push('Meditacao e diario emocional podem ajudar a processar a intensidade desta fase.'); }
    if ((log?.sleepQuality ?? 5) <= 2) tips.push('Qualidade do sono baixa hoje. Evite telas 1h antes de dormir.');
    if ((log?.pelvicPain ?? 0) >= 4) tips.push('Dor pelvica intensa merece atencao. Registre e mencione ao seu medico.');
    return tips;
  }
}
