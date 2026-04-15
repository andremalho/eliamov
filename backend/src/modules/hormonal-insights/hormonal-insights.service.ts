import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CycleEntry } from '../cycle/entities/cycle.entity';
import { HormonalInsightEntity } from './entities/hormonal-insight.entity';

type RiskLevel = 'low' | 'moderate' | 'high';
type HormonalStatus = 'stable' | 'possible_anovulatory_pattern' | 'possible_perimenopause_transition' | 'needs_clinical_review';

@Injectable()
export class HormonalInsightsService {
  constructor(
    @InjectRepository(CycleEntry) private readonly cycleRepo: Repository<CycleEntry>,
    @InjectRepository(HormonalInsightEntity) private readonly insightRepo: Repository<HormonalInsightEntity>,
  ) {}

  async recomputeForUser(userId: string): Promise<HormonalInsightEntity> {
    const cycles = await this.cycleRepo.find({ where: { userId }, order: { startDate: 'ASC' }, take: 12 });
    if (cycles.length < 3) throw new UnprocessableEntityException('É necessário pelo menos 3 ciclos registrados.');
    const lengths = cycles.map(c => c.cycleLength).filter((v): v is number => typeof v === 'number' && v > 0);
    if (lengths.length < 3) throw new UnprocessableEntityException('Não há ciclos suficientes com duração preenchida.');

    const avgCycleLength = this.average(lengths);
    const cycleVariability = this.stdDev(lengths);
    const cycleTrendSlope = this.linearSlope(lengths);
    const prolongedBleedingCount = cycles.filter(c => (c.periodLength ?? 0) >= 8).length;
    const shortPeriodCount = cycles.filter(c => typeof c.periodLength === 'number' && c.periodLength <= 2).length;
    const irregularCycles = lengths.filter(l => l < 21 || l > 35).length;
    const highVariability = cycleVariability >= 7 ? 1 : 0;
    const shorteningTrend = cycleTrendSlope <= -0.8 ? 1 : 0;
    const wideningTrend = cycleTrendSlope >= 0.8 ? 1 : 0;

    const aubRiskScore = Math.min(100, prolongedBleedingCount * 18 + shortPeriodCount * 10 + irregularCycles * 12 + highVariability * 14);
    const perimenopauseScore = Math.min(100, irregularCycles * 10 + highVariability * 22 + shorteningTrend * 14 + wideningTrend * 12);

    const aubRiskLevel: RiskLevel = aubRiskScore >= 60 ? 'high' : aubRiskScore >= 30 ? 'moderate' : 'low';
    const hormonalStatus: HormonalStatus = aubRiskScore >= 70 ? 'needs_clinical_review' : perimenopauseScore >= 50 ? 'possible_perimenopause_transition' : (cycleVariability >= 8 || irregularCycles >= 3) ? 'possible_anovulatory_pattern' : 'stable';

    const statusMap: Record<HormonalStatus, string> = {
      stable: 'Seu padrão recente parece relativamente estável.',
      possible_anovulatory_pattern: 'Seu padrão recente mostra irregularidade maior que o esperado.',
      possible_perimenopause_transition: 'Seu padrão recente pode ser compatível com fase de transição hormonal.',
      needs_clinical_review: 'Seu padrão recente merece avaliação clínica mais cuidadosa.',
    };
    const riskMap: Record<RiskLevel, string> = {
      low: 'baixo risco de padrão sugestivo de sangramento uterino anormal',
      moderate: 'risco moderado de padrão sugestivo de sangramento uterino anormal',
      high: 'risco elevado de padrão sugestivo de sangramento uterino anormal',
    };

    const patientSummary = `Média dos seus ciclos: ${this.round(avgCycleLength)} dias. Variabilidade: ${this.round(cycleVariability)} dias. ${statusMap[hormonalStatus]} O sistema identificou ${riskMap[aubRiskLevel]}. Este resultado não substitui consulta médica.`;
    const clinicianSummary = `Média de ciclo: ${this.round(avgCycleLength)} dias. Variabilidade: ${this.round(cycleVariability)} dias. Inclinação temporal: ${this.round(cycleTrendSlope)}. Ciclos fora de 21-35 dias: ${irregularCycles}. Sangramento prolongado ≥8 dias: ${prolongedBleedingCount}. Período curto ≤2 dias: ${shortPeriodCount}. AUB risk score: ${this.round(aubRiskScore)}. Perimenopause score: ${this.round(perimenopauseScore)}. Classificação final: ${hormonalStatus}.`;

    const entity = this.insightRepo.create({ userId, analyzedCycleCount: cycles.length, avgCycleLength: this.round(avgCycleLength), cycleVariability: this.round(cycleVariability), cycleTrendSlope: this.round(cycleTrendSlope), aubRiskScore: this.round(aubRiskScore), perimenopauseScore: this.round(perimenopauseScore), aubRiskLevel, hormonalStatus, patientSummary, clinicianSummary, rawMetrics: { prolongedBleedingCount, shortPeriodCount, irregularCycles, highVariability, shorteningTrend, wideningTrend } });
    return this.insightRepo.save(entity);
  }

  async findLatestByUser(userId: string): Promise<HormonalInsightEntity | null> {
    return this.insightRepo.findOne({ where: { userId }, order: { createdAt: 'DESC' } });
  }

  private average(v: number[]) { return v.reduce((s, n) => s + n, 0) / v.length; }
  private stdDev(v: number[]) { const a = this.average(v); return Math.sqrt(v.reduce((s, n) => s + Math.pow(n - a, 2), 0) / v.length); }
  private linearSlope(v: number[]) { const n = v.length; const x = Array.from({length: n}, (_, i) => i + 1); const ax = this.average(x); const ay = this.average(v); let num = 0, den = 0; for (let i = 0; i < n; i++) { num += (x[i]-ax)*(v[i]-ay); den += Math.pow(x[i]-ax,2); } return den === 0 ? 0 : num/den; }
  private round(v: number, d = 2) { const f = Math.pow(10, d); return Math.round(v * f) / f; }
}
