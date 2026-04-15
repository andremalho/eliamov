import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MentalHealthAssessmentEntity } from './entities/mental-health-assessment.entity';
import { MentalHealthPatternEntity } from './entities/mental-health-pattern.entity';
import { CycleEntry } from '../cycle/entities/cycle.entity';
import { SubmitAssessmentDto } from './dto/submit-assessment.dto';

type AssessmentType = 'phq9' | 'gad7' | 'pss10' | 'drsp' | 'mrs';

const SEVERITY_TABLES: Record<AssessmentType, (score: number) => string> = {
  phq9: (s) => s <= 4 ? 'minimal' : s <= 9 ? 'mild' : s <= 14 ? 'moderate' : s <= 19 ? 'moderately_severe' : 'severe',
  gad7: (s) => s <= 4 ? 'minimal' : s <= 9 ? 'mild' : s <= 14 ? 'moderate' : 'severe',
  pss10: (s) => s <= 13 ? 'low' : s <= 26 ? 'moderate' : 'high',
  drsp: (s) => s <= 20 ? 'low' : s <= 40 ? 'moderate' : 'high',
  mrs: (s) => s <= 4 ? 'none' : s <= 8 ? 'mild' : s <= 16 ? 'moderate' : 'severe',
};

@Injectable()
export class MentalHealthService {
  constructor(
    @InjectRepository(MentalHealthAssessmentEntity) private readonly assessmentRepo: Repository<MentalHealthAssessmentEntity>,
    @InjectRepository(MentalHealthPatternEntity) private readonly patternRepo: Repository<MentalHealthPatternEntity>,
    @InjectRepository(CycleEntry) private readonly cycleRepo: Repository<CycleEntry>,
  ) {}

  async submitAssessment(userId: string, dto: SubmitAssessmentDto): Promise<MentalHealthAssessmentEntity> {
    const totalScore = Object.values(dto.answers).reduce((s, n) => s + n, 0);
    const severityLevel = SEVERITY_TABLES[dto.assessmentType](totalScore);

    let cyclePhaseAtAssessment: 'menstrual' | 'follicular' | 'ovulatory' | 'luteal' | 'unknown' = 'unknown';
    let cycleDay: number | null = null;
    const latestCycle = await this.cycleRepo.findOne({ where: { userId }, order: { startDate: 'DESC' } });
    if (latestCycle) {
      const start = new Date(latestCycle.startDate);
      const today = new Date();
      start.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);
      const diff = Math.floor((today.getTime() - start.getTime()) / 86400000);
      const cl = latestCycle.cycleLength ?? 28;
      const pl = latestCycle.periodLength ?? 5;
      const dayIndex = diff % cl;
      cycleDay = dayIndex + 1;
      if (dayIndex < pl) cyclePhaseAtAssessment = 'menstrual';
      else if (dayIndex < cl - 14 - 1) cyclePhaseAtAssessment = 'follicular';
      else if (dayIndex <= cl - 14 + 1) cyclePhaseAtAssessment = 'ovulatory';
      else cyclePhaseAtAssessment = 'luteal';
    }

    let criticalAlertTriggered = false;
    let criticalAlertReason: string | null = null;
    if (dto.assessmentType === 'phq9') {
      const q9Score = dto.answers['9'] ?? 0;
      if (q9Score >= 1) {
        criticalAlertTriggered = true;
        criticalAlertReason = q9Score >= 2 ? 'phq9_q9_high' : 'phq9_q9_present';
      }
    }

    const entity = this.assessmentRepo.create({
      userId, assessmentType: dto.assessmentType, answers: dto.answers,
      totalScore, severityLevel, cyclePhaseAtAssessment, cycleDay,
      criticalAlertTriggered, criticalAlertReason,
    });
    return this.assessmentRepo.save(entity);
  }

  async computePattern(userId: string): Promise<MentalHealthPatternEntity> {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const assessments = await this.assessmentRepo.find({
      where: { userId },
      order: { createdAt: 'ASC' },
    });

    const phq9All = assessments.filter(a => a.assessmentType === 'phq9');
    const gad7All = assessments.filter(a => a.assessmentType === 'gad7');
    const recent = assessments.filter(a => a.createdAt >= sixMonthsAgo);
    const phq9Recent = recent.filter(a => a.assessmentType === 'phq9');
    const gad7Recent = recent.filter(a => a.assessmentType === 'gad7');
    const pss10Recent = recent.filter(a => a.assessmentType === 'pss10');

    const avgPhq9Score = phq9Recent.length > 0 ? this.average(phq9Recent.map(a => a.totalScore)) : null;
    const avgGad7Score = gad7Recent.length > 0 ? this.average(gad7Recent.map(a => a.totalScore)) : null;
    const avgPss10Score = pss10Recent.length > 0 ? this.average(pss10Recent.map(a => a.totalScore)) : null;

    const lutealPhq9Avg = this.avgByPhase(phq9Recent, 'luteal');
    const follicularPhq9Avg = this.avgByPhase(phq9Recent, 'follicular', 'ovulatory');
    const lutealGad7Avg = this.avgByPhase(gad7Recent, 'luteal');
    const follicularGad7Avg = this.avgByPhase(gad7Recent, 'follicular', 'ovulatory');

    const phq9TrendSlope = phq9All.length >= 3 ? this.round(this.linearSlope(phq9All.map(a => a.totalScore))) : null;
    const gad7TrendSlope = gad7All.length >= 3 ? this.round(this.linearSlope(gad7All.map(a => a.totalScore))) : null;
    const phq9Trend = this.classifyTrend(phq9TrendSlope, phq9All.length);
    const gad7Trend = this.classifyTrend(gad7TrendSlope, gad7All.length);

    const pmddSuspected = lutealPhq9Avg !== null && follicularPhq9Avg !== null && (lutealPhq9Avg - follicularPhq9Avg) >= 5;
    const generalDepressionSuspected = avgPhq9Score !== null && avgPhq9Score >= 10;
    const generalAnxietySuspected = avgGad7Score !== null && avgGad7Score >= 10;

    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    const last90 = phq9All.filter(a => a.createdAt >= ninetyDaysAgo);
    const adherenceScore = this.round(Math.min(100, (last90.length / 3) * 100));

    const lastPhq9 = phq9All[phq9All.length - 1];
    let suggestedNextAssessmentDays: number;
    if (!lastPhq9) suggestedNextAssessmentDays = 0;
    else if (lastPhq9.totalScore >= 15) suggestedNextAssessmentDays = 7;
    else if (lastPhq9.totalScore >= 10) suggestedNextAssessmentDays = 14;
    else suggestedNextAssessmentDays = 30;

    let clinicianAlertRequired = false;
    let clinicianAlertReason: string | null = null;
    if (phq9All.length >= 2) {
      const last = phq9All[phq9All.length - 1].totalScore;
      const prev = phq9All[phq9All.length - 2].totalScore;
      if (last >= 15) { clinicianAlertRequired = true; clinicianAlertReason = 'phq9_severe_score'; }
      else if (last > prev + 4) { clinicianAlertRequired = true; clinicianAlertReason = 'phq9_significant_worsening'; }
    }
    if (!clinicianAlertRequired && gad7All.length >= 1) {
      if (gad7All[gad7All.length - 1].totalScore >= 15) { clinicianAlertRequired = true; clinicianAlertReason = 'gad7_severe_score'; }
    }

    let overallPattern: string;
    if (clinicianAlertRequired) overallPattern = 'needs_clinical_review';
    else if (pmddSuspected) overallPattern = 'pmdd_pattern';
    else if (generalDepressionSuspected && generalAnxietySuspected) overallPattern = 'mixed';
    else if (generalDepressionSuspected) overallPattern = 'generalized_depression';
    else if (generalAnxietySuspected) overallPattern = 'generalized_anxiety';
    else if (lutealPhq9Avg !== null && follicularPhq9Avg !== null && (lutealPhq9Avg - follicularPhq9Avg) >= 3) overallPattern = 'luteal_exacerbation';
    else overallPattern = 'stable';

    const patientSummary = this.buildMentalPatientSummary({ overallPattern, phq9Trend, avgPhq9Score, pmddSuspected, suggestedNextAssessmentDays, adherenceScore });
    const clinicianSummary = this.buildMentalClinicianSummary({
      avgPhq9Score, avgGad7Score, lutealPhq9Avg, follicularPhq9Avg,
      phq9TrendSlope, gad7TrendSlope, phq9Trend, gad7Trend,
      pmddSuspected, generalDepressionSuspected, generalAnxietySuspected,
      clinicianAlertRequired, clinicianAlertReason, adherenceScore, overallPattern,
    });

    const entity = this.patternRepo.create({
      userId, analyzedAssessmentCount: recent.length,
      avgPhq9Score: avgPhq9Score !== null ? this.round(avgPhq9Score) : null,
      avgGad7Score: avgGad7Score !== null ? this.round(avgGad7Score) : null,
      avgPss10Score: avgPss10Score !== null ? this.round(avgPss10Score) : null,
      lutealPhq9Avg, follicularPhq9Avg, lutealGad7Avg, follicularGad7Avg,
      pmddSuspected, generalDepressionSuspected, generalAnxietySuspected,
      overallPattern, phq9Trend, gad7Trend, phq9TrendSlope, gad7TrendSlope,
      adherenceScore, suggestedNextAssessmentDays, clinicianAlertRequired, clinicianAlertReason,
      patientSummary, clinicianSummary,
    });
    return this.patternRepo.save(entity);
  }

  async getLatestPattern(userId: string): Promise<MentalHealthPatternEntity | null> {
    return this.patternRepo.findOne({ where: { userId }, order: { createdAt: 'DESC' } });
  }

  async getAssessmentHistory(userId: string, type?: string): Promise<MentalHealthAssessmentEntity[]> {
    const where: any = { userId };
    if (type) where.assessmentType = type;
    return this.assessmentRepo.find({ where, order: { createdAt: 'DESC' } });
  }

  async getScoreTimeline(userId: string, type: 'phq9' | 'gad7' | 'pss10'): Promise<{ date: string; score: number; phase: string; severityLevel: string }[]> {
    const assessments = await this.assessmentRepo.find({
      where: { userId, assessmentType: type },
      order: { createdAt: 'ASC' },
    });
    return assessments.map(a => ({
      date: a.createdAt.toISOString().split('T')[0],
      score: a.totalScore,
      phase: a.cyclePhaseAtAssessment,
      severityLevel: a.severityLevel,
    }));
  }

  private average(v: number[]) { return v.reduce((s, n) => s + n, 0) / v.length; }
  private stdDev(v: number[]) { const a = this.average(v); return Math.sqrt(v.reduce((s, n) => s + Math.pow(n - a, 2), 0) / v.length); }
  private linearSlope(v: number[]) { const n = v.length; const x = Array.from({length: n}, (_, i) => i + 1); const ax = this.average(x); const ay = this.average(v); let num = 0, den = 0; for (let i = 0; i < n; i++) { num += (x[i]-ax)*(v[i]-ay); den += Math.pow(x[i]-ax,2); } return den === 0 ? 0 : num/den; }
  private round(v: number, d = 2) { const f = Math.pow(10, d); return Math.round(v * f) / f; }

  private avgByPhase(items: MentalHealthAssessmentEntity[], ...phases: string[]): number | null {
    const filtered = items.filter(a => phases.includes(a.cyclePhaseAtAssessment));
    return filtered.length > 0 ? this.round(this.average(filtered.map(a => a.totalScore))) : null;
  }

  private classifyTrend(slope: number | null, count: number): 'improving' | 'stable' | 'worsening' | 'insufficient_data' {
    if (slope === null || count < 3) return 'insufficient_data';
    if (slope <= -0.5) return 'improving';
    if (slope >= 0.5) return 'worsening';
    return 'stable';
  }

  private buildMentalPatientSummary(input: { overallPattern: string; phq9Trend: string; avgPhq9Score: number | null; pmddSuspected: boolean; suggestedNextAssessmentDays: number; adherenceScore: number }): string {
    const patternMap: Record<string, string> = {
      stable: 'Seu padrao emocional esta estavel.',
      luteal_exacerbation: 'Seus sintomas tendem a ser mais intensos em determinadas fases do ciclo.',
      pmdd_pattern: 'Ha um padrao de variacao emocional significativa ligada ao ciclo.',
      generalized_depression: 'Seus registros indicam sintomas de humor que merecem atencao.',
      generalized_anxiety: 'Seus registros indicam sintomas de ansiedade que merecem atencao.',
      mixed: 'Seus registros indicam sintomas de humor e ansiedade que merecem atencao.',
      needs_clinical_review: 'Seu padrao recente merece avaliacao com um profissional de saude.',
    };
    const trendMap: Record<string, string> = { improving: 'A tendencia recente e de melhora.', stable: 'Sua pontuacao esta estavel ao longo do tempo.', worsening: 'Notamos uma tendencia de aumento nos sintomas.', insufficient_data: '' };
    const nextText = input.suggestedNextAssessmentDays === 0 ? 'Recomendamos fazer sua primeira avaliacao.' : `Proxima avaliacao recomendada em ${input.suggestedNextAssessmentDays} dias.`;
    return [patternMap[input.overallPattern] ?? '', trendMap[input.phq9Trend] ?? '', nextText, 'Este resultado nao substitui consulta medica.'].filter(Boolean).join(' ');
  }

  private buildMentalClinicianSummary(input: { avgPhq9Score: number | null; avgGad7Score: number | null; lutealPhq9Avg: number | null; follicularPhq9Avg: number | null; phq9TrendSlope: number | null; gad7TrendSlope: number | null; phq9Trend: string; gad7Trend: string; pmddSuspected: boolean; generalDepressionSuspected: boolean; generalAnxietySuspected: boolean; clinicianAlertRequired: boolean; clinicianAlertReason: string | null; adherenceScore: number; overallPattern: string }): string {
    return [
      `PHQ-9 medio (6 meses): ${input.avgPhq9Score ?? 'insuficiente'}.`,
      `GAD-7 medio (6 meses): ${input.avgGad7Score ?? 'insuficiente'}.`,
      `PHQ-9 fase lutea: ${input.lutealPhq9Avg ?? '-'} | fase folicular: ${input.follicularPhq9Avg ?? '-'}.`,
      `Tendencia PHQ-9: ${input.phq9Trend} (slope ${input.phq9TrendSlope ?? '-'}).`,
      `Tendencia GAD-7: ${input.gad7Trend} (slope ${input.gad7TrendSlope ?? '-'}).`,
      `TDPM suspeito: ${input.pmddSuspected ? 'sim' : 'nao'}.`,
      `Aderencia (90 dias): ${input.adherenceScore}%.`,
      `Alerta clinico: ${input.clinicianAlertRequired ? input.clinicianAlertReason : 'nao'}.`,
      `Padrao geral: ${input.overallPattern}.`,
    ].join(' ');
  }
}
