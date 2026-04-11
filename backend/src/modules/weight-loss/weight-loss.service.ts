import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WeightLossAssessment } from './entities/weight-loss-assessment.entity';
import { WeightLossCheckin } from './entities/weight-loss-checkin.entity';
import { CreateAssessmentDto } from './dto/create-assessment.dto';
import { CheckinDto } from './dto/checkin.dto';
import { NutritionService } from '../nutrition/nutrition.service';
import { ProgramsService } from '../programs/programs.service';

@Injectable()
export class WeightLossService {
  constructor(
    @InjectRepository(WeightLossAssessment) private assessmentRepo: Repository<WeightLossAssessment>,
    @InjectRepository(WeightLossCheckin) private checkinRepo: Repository<WeightLossCheckin>,
    private readonly nutritionService: NutritionService,
    private readonly programsService: ProgramsService,
  ) {}

  async createAssessment(userId: string, tenantId: string, dto: CreateAssessmentDto) {
    const heightM = dto.heightCm / 100;
    const bmi = +(dto.weightKg / (heightM * heightM)).toFixed(2);

    // TMB - Mifflin-St Jeor
    const tmb = dto.biologicalSex === 'M'
      ? (10 * dto.weightKg) + (6.25 * dto.heightCm) - (5 * dto.age) + 5
      : (10 * dto.weightKg) + (6.25 * dto.heightCm) - (5 * dto.age) - 161;

    const tdee = +(tmb * dto.activityFactor).toFixed(2);

    // Deficit calculation
    const totalLossKg = dto.weightKg - dto.targetWeightKg;
    const totalDays = dto.deadlineMonths * 30;
    const rawDeficit = (totalLossKg * 7700) / totalDays;
    const caloricDeficit = Math.round(Math.min(750, Math.max(500, rawDeficit)));
    const dailyCalorieGoal = Math.max(1200, Math.round(tdee - caloricDeficit));

    // Macros
    const proteinG = +(dto.weightKg * 1.4).toFixed(1); // ISSN 2018
    const proteinKcal = proteinG * 4;
    const fatsKcal = dailyCalorieGoal * 0.28;
    const fatsG = +(fatsKcal / 9).toFixed(1);
    const carbsG = +((dailyCalorieGoal - proteinKcal - fatsKcal) / 4).toFixed(1);

    // Estimated loss
    const estimatedWeeklyLossKg = +((caloricDeficit * 7) / 7700).toFixed(2);
    const estimatedWeeksToGoal = Math.ceil(totalLossKg / estimatedWeeklyLossKg);

    // Weekly plan (12 weeks)
    const weeklyPlan = this.generateWeeklyPlan(dailyCalorieGoal, proteinG, carbsG, fatsG, dto.comorbidity);

    // Comorbidity protocol
    const comorbidityProtocol = this.generateComorbidityProtocol(dto.comorbidity, carbsG);

    // Save assessment
    const assessment = this.assessmentRepo.create({
      userId, tenantId,
      age: dto.age, biologicalSex: dto.biologicalSex,
      weightKg: dto.weightKg, heightCm: dto.heightCm,
      activityFactor: dto.activityFactor,
      targetWeightKg: dto.targetWeightKg,
      deadlineMonths: dto.deadlineMonths,
      comorbidity: dto.comorbidity,
      bmi, tmb, tdee, dailyCalorieGoal, caloricDeficit,
      proteinG, carbsG, fatsG,
      estimatedWeeklyLossKg, estimatedWeeksToGoal,
      weeklyPlan, comorbidityProtocol,
    } as any);
    const saved = await this.assessmentRepo.save(assessment) as unknown as WeightLossAssessment;

    // Update NutritionGoal
    await this.nutritionService.setGoal(userId, {
      dailyCalories: dailyCalorieGoal,
      dailyProtein: proteinG,
      dailyCarbs: carbsG,
      dailyFat: fatsG,
      goal: 'weight_loss',
    } as any);

    // Create WellnessProgram
    const program = await this.programsService.create({
      title: `Programa de Emagrecimento - ${dto.deadlineMonths} meses`,
      description: `Meta: ${dto.weightKg}kg -> ${dto.targetWeightKg}kg em ${estimatedWeeksToGoal} semanas`,
      category: 'nutrition',
      durationWeeks: Math.min(estimatedWeeksToGoal, 52),
      level: 'beginner',
      cycleAware: true,
    } as any);

    // Link program to assessment
    saved.wellnessProgramId = (program as any).id;
    await this.assessmentRepo.save(saved);

    return saved;
  }

  async getAssessment(userId: string) {
    const assessment = await this.assessmentRepo.findOne({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
    if (!assessment) throw new NotFoundException('Nenhuma avaliacao encontrada');

    const checkins = await this.checkinRepo.find({
      where: { assessmentId: assessment.id },
      order: { weekNumber: 'ASC' },
    });

    return { ...assessment, checkins };
  }

  async createCheckin(userId: string, assessmentId: string, dto: CheckinDto) {
    const assessment = await this.assessmentRepo.findOneBy({ id: assessmentId, userId });
    if (!assessment) throw new NotFoundException('Avaliacao nao encontrada');

    const weeklyLoss = Number(assessment.estimatedWeeklyLossKg);
    const initialWeight = Number(assessment.weightKg);
    const expectedWeightKg = +(initialWeight - (weeklyLoss * dto.weekNumber)).toFixed(2);
    const deltaFromExpected = +(dto.weightKg - expectedWeightKg).toFixed(2);

    const checkin = this.checkinRepo.create({
      assessmentId, userId,
      weekNumber: dto.weekNumber,
      weightKg: dto.weightKg,
      adherencePercent: dto.adherencePercent,
      notes: dto.notes ?? null,
      expectedWeightKg,
      deltaFromExpected,
    } as any);

    return this.checkinRepo.save(checkin);
  }

  async getProgress(userId: string, assessmentId: string) {
    const assessment = await this.assessmentRepo.findOneBy({ id: assessmentId, userId });
    if (!assessment) throw new NotFoundException('Avaliacao nao encontrada');

    const checkins = await this.checkinRepo.find({
      where: { assessmentId },
      order: { weekNumber: 'ASC' },
    });

    const avgAdherence = checkins.length > 0
      ? Math.round(checkins.reduce((s, c) => s + c.adherencePercent, 0) / checkins.length)
      : 0;

    // Real vs expected curve
    const initialWeight = Number(assessment.weightKg);
    const weeklyLoss = Number(assessment.estimatedWeeklyLossKg);
    const curve = checkins.map((c) => ({
      week: c.weekNumber,
      real: Number(c.weightKg),
      expected: +(initialWeight - weeklyLoss * c.weekNumber).toFixed(2),
      delta: Number(c.deltaFromExpected),
      adherence: c.adherencePercent,
    }));

    // Updated projection based on actual loss rate
    let projectedWeeks = Number(assessment.estimatedWeeksToGoal);
    if (checkins.length >= 2) {
      const first = Number(checkins[0].weightKg);
      const last = Number(checkins[checkins.length - 1].weightKg);
      const weeksElapsed = checkins[checkins.length - 1].weekNumber - checkins[0].weekNumber;
      if (weeksElapsed > 0) {
        const realWeeklyLoss = (first - last) / weeksElapsed;
        const remaining = last - Number(assessment.targetWeightKg);
        projectedWeeks = realWeeklyLoss > 0 ? Math.ceil(remaining / realWeeklyLoss) + checkins[checkins.length - 1].weekNumber : projectedWeeks;
      }
    }

    return {
      assessment: {
        startWeight: initialWeight,
        targetWeight: Number(assessment.targetWeightKg),
        currentWeight: checkins.length > 0 ? Number(checkins[checkins.length - 1].weightKg) : initialWeight,
        totalLoss: checkins.length > 0 ? +(initialWeight - Number(checkins[checkins.length - 1].weightKg)).toFixed(2) : 0,
      },
      avgAdherence,
      projectedWeeks,
      curve,
    };
  }

  private generateWeeklyPlan(calories: number, protein: number, carbs: number, fats: number, comorbidity: string) {
    const phases = [
      {
        name: 'Ancoragem',
        weeks: '1-4',
        focus: ['Registro alimentar diario', 'Eliminacao de ultraprocessados', 'Estrutura de refeicoes (3 principais + 2 lanches)', 'Meta calorica plena'],
        dailyTargets: { calories, protein, carbs, fats },
      },
      {
        name: 'Adaptacao',
        weeks: '5-8',
        focus: ['Densidade calorica dos alimentos', 'Qualidade proteica (fontes completas)', 'Inicio exercicio progressivo', 'Automonitoramento'],
        dailyTargets: { calories, protein, carbs, fats },
      },
      {
        name: 'Consolidacao',
        weeks: '9-12',
        focus: ['Revisao de progresso', 'Ajustes individuais', 'Estrategias de manutencao', 'Prevencao de reganho'],
        dailyTargets: { calories, protein, carbs, fats },
      },
    ];

    if (comorbidity === 'dm2') {
      phases[0].focus.push('Controle glicemico: IG baixo, carboidratos < 130g/dia');
    } else if (comorbidity === 'pcos') {
      phases[0].focus.push('Carboidratos 100-130g/dia, baixo IG, considerar inositol 40:1');
    }

    return phases;
  }

  async generateMealPlan(userId: string, preferences: { dietType: string; allergies: string[]; mealsPerDay: number; budget: string }) {
    const assessment = await this.assessmentRepo.findOne({ where: { userId }, order: { createdAt: 'DESC' } });
    if (!assessment) throw new NotFoundException('Nenhuma avaliacao encontrada');

    const calories = assessment.dailyCalorieGoal;
    const protein = Number(assessment.proteinG);
    const carbs = Number(assessment.carbsG);
    const fats = Number(assessment.fatsG);
    const comorbidity = assessment.comorbidity;

    // Build meal plan based on macros and preferences
    const plan = this.buildMealPlan(calories, protein, carbs, fats, preferences, comorbidity);
    return plan;
  }

  private buildMealPlan(calories: number, protein: number, carbs: number, fats: number, prefs: any, comorbidity: string) {
    const meals = prefs.mealsPerDay ?? 5;

    // Distribution: main meals get more, snacks less
    const distribution = meals === 3
      ? [0.35, 0.40, 0.25]
      : meals === 4
      ? [0.30, 0.10, 0.35, 0.25]
      : [0.25, 0.10, 0.30, 0.10, 0.25]; // 5 meals

    const mealNames = meals === 3
      ? ['Cafe da manha', 'Almoco', 'Jantar']
      : meals === 4
      ? ['Cafe da manha', 'Lanche da manha', 'Almoco', 'Jantar']
      : ['Cafe da manha', 'Lanche da manha', 'Almoco', 'Lanche da tarde', 'Jantar'];

    // Food database by category and diet type
    const foods = this.getFoodOptions(prefs.dietType, prefs.allergies ?? [], comorbidity);

    const mealPlan = {
      dailyTargets: { calories, protein, carbs, fats },
      preferences: prefs,
      meals: mealNames.map((name, i) => {
        const pct = distribution[i];
        const mealCal = Math.round(calories * pct);
        const mealProt = Math.round(protein * pct);
        const mealCarbs = Math.round(carbs * pct);
        const mealFat = Math.round(fats * pct);

        return {
          name,
          calories: mealCal,
          protein: mealProt,
          carbs: mealCarbs,
          fat: mealFat,
          suggestions: foods[name] ?? foods.default,
        };
      }),
      weeklyVariation: this.getWeeklyVariation(prefs.dietType),
      shoppingList: this.getShoppingList(prefs.dietType, prefs.allergies ?? []),
      tips: this.getMealTips(comorbidity, prefs.dietType),
    };

    return mealPlan;
  }

  private getFoodOptions(dietType: string, allergies: string[], comorbidity: string): Record<string, string[]> {
    const isVeg = dietType === 'vegetariana' || dietType === 'vegana';
    const noLactose = allergies.includes('lactose') || dietType === 'vegana';
    const noGluten = allergies.includes('gluten');
    const lowCarb = comorbidity === 'dm2' || comorbidity === 'pcos';

    return {
      'Cafe da manha': [
        !noGluten ? 'Pao integral com ovo mexido e abacate' : 'Tapioca com ovo e abacate',
        !noLactose ? 'Iogurte natural com granola e frutas' : 'Mingau de aveia com banana',
        'Omelete de claras com espinafre e tomate',
        isVeg ? 'Smoothie de banana, aveia e pasta de amendoim' : 'Crepioca com frango desfiado',
        lowCarb ? 'Ovos mexidos com cottage e nozes' : null,
      ].filter(Boolean) as string[],
      'Lanche da manha': [
        'Castanhas (30g) + 1 fruta',
        !noLactose ? 'Iogurte grego com canela' : 'Fruta + pasta de amendoim',
        'Mix de oleaginosas (amendoas, nozes)',
      ].filter(Boolean) as string[],
      'Almoco': [
        isVeg ? 'Arroz integral + feijao + legumes grelhados + salada' : 'Arroz integral + feijao + frango grelhado + salada',
        isVeg ? 'Quinoa com lentilha, abobora e rucula' : 'Peixe assado com batata doce e brocolis',
        !isVeg ? 'Carne magra com mandioca e salada colorida' : 'Bowl de grao-de-bico com vegetais',
        lowCarb ? 'Salada com proteina + azeite + sementes (sem arroz)' : null,
      ].filter(Boolean) as string[],
      'Lanche da tarde': [
        'Frutas com pasta de amendoim',
        !noLactose ? 'Queijo branco + 1 fruta' : 'Homus com palitos de cenoura',
        'Banana + canela + aveia',
      ].filter(Boolean) as string[],
      'Jantar': [
        isVeg ? 'Sopa de legumes com tofu' : 'Sopa de frango com legumes',
        isVeg ? 'Salada completa com grao-de-bico e abacate' : 'Omelete com salada verde',
        !isVeg ? 'Peixe grelhado com legumes no vapor' : 'Wrap de alface com cogumelos',
        lowCarb ? 'Salada com ovo + abacate + azeite' : null,
      ].filter(Boolean) as string[],
      default: ['Opcao balanceada conforme macros'],
    };
  }

  private getWeeklyVariation(dietType: string) {
    return [
      { day: 'Segunda', theme: 'Proteina magra + legumes verdes' },
      { day: 'Terca', theme: 'Peixe ou alternativa + vegetais coloridos' },
      { day: 'Quarta', theme: dietType === 'vegetariana' || dietType === 'vegana' ? 'Leguminosas variadas' : 'Carne vermelha magra (1x semana)' },
      { day: 'Quinta', theme: 'Ovos + saladas elaboradas' },
      { day: 'Sexta', theme: 'Refeicao livre controlada (dentro dos macros)' },
      { day: 'Sabado', theme: 'Receitas novas saudaveis' },
      { day: 'Domingo', theme: 'Meal prep para a semana' },
    ];
  }

  private getShoppingList(dietType: string, allergies: string[]) {
    const base = ['Ovos', 'Azeite extra virgem', 'Banana', 'Maca', 'Tomate', 'Alface', 'Brocolis', 'Cenoura', 'Cebola', 'Alho', 'Arroz integral', 'Feijao', 'Aveia', 'Castanhas', 'Pasta de amendoim'];
    if (dietType !== 'vegana') base.push('Frango', 'Peixe', 'Iogurte natural', 'Queijo branco');
    if (dietType === 'vegana') base.push('Tofu', 'Grao-de-bico', 'Lentilha', 'Leite vegetal');
    if (!allergies.includes('gluten')) base.push('Pao integral');
    return base;
  }

  private getMealTips(comorbidity: string, dietType: string) {
    const tips = [
      'Prepare as refeicoes com antecedencia (meal prep)',
      'Beba agua antes das refeicoes',
      'Coma devagar, mastigue bem',
      'Use pratos menores para controlar porcoes',
    ];
    if (comorbidity === 'dm2') tips.push('Evite carboidratos refinados', 'Prefira indice glicemico baixo');
    if (comorbidity === 'hypertension') tips.push('Reduza o sal', 'Use ervas e especiarias no lugar');
    if (comorbidity === 'pcos') tips.push('Prefira carboidratos de baixo IG', 'Inclua alimentos anti-inflamatorios');
    return tips;
  }

  private generateComorbidityProtocol(comorbidity: string, currentCarbs: number) {
    switch (comorbidity) {
      case 'dm2':
        return {
          name: 'Protocolo Diabetes Tipo 2',
          reference: 'Sainsbury et al., 2018 - Diabetes Care',
          guidelines: ['Low-carb com IG baixo', `Carboidratos: <130g/dia (atual: ${currentCarbs}g)`, 'Monitorar glicemia pos-prandial', 'Preferir gorduras mono/poli-insaturadas'],
          adjustedCarbs: Math.min(currentCarbs, 130),
        };
      case 'hypertension':
        return {
          name: 'Protocolo DASH',
          reference: 'Appel et al., NEJM 1997',
          guidelines: ['Sodio < 2.3g/dia', 'Rico em potassio, calcio e magnesio', 'Frutas: 4-5 porcoes/dia', 'Limitacao de alcool'],
          maxSodiumMg: 2300,
        };
      case 'metabolic_syndrome':
        return {
          name: 'Protocolo Sindrome Metabolica',
          reference: 'Despres et al., Nature 2012',
          guidelines: ['Deficit calorico moderado', 'Exercicio resistido 3x/semana', 'Circunferencia abdominal como marcador', 'Priorizacao de fibras'],
        };
      case 'pcos':
        return {
          name: 'Protocolo SOP/PCOS',
          reference: 'FIGO 2023 - Consensus on PCOS',
          guidelines: ['Carboidratos 100-130g/dia, baixo IG', 'Inositol mio + D-chiro (40:1)', 'Omega-3: 2g/dia', 'Vitamina D: suplementar se <30ng/mL'],
          adjustedCarbs: Math.min(currentCarbs, 130),
        };
      default:
        return {
          name: 'Protocolo Padrao DPP',
          reference: 'Diabetes Prevention Program, 2002',
          guidelines: ['Deficit 500-750 kcal/dia', 'Atividade fisica 150 min/semana', 'Automonitoramento semanal', 'Metas realistas (5-7% peso corporal)'],
        };
    }
  }
}
