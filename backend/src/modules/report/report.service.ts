import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Response } from 'express';
import PDFDocument from 'pdfkit';
import { CycleEntry } from '../cycle/entities/cycle.entity';
import { MedicationEntity } from '../medications/entities/medication.entity';
import { MentalHealthAssessmentEntity } from '../mental-health/entities/mental-health-assessment.entity';
import { MentalHealthPatternEntity } from '../mental-health/entities/mental-health-pattern.entity';
import { HormonalInsightEntity } from '../hormonal-insights/entities/hormonal-insight.entity';
import { DailyLogEntity } from '../daily-log/entities/daily-log.entity';

@Injectable()
export class ReportService {
  constructor(
    @InjectRepository(CycleEntry) private readonly cycleRepo: Repository<CycleEntry>,
    @InjectRepository(MedicationEntity) private readonly medRepo: Repository<MedicationEntity>,
    @InjectRepository(MentalHealthAssessmentEntity) private readonly assessmentRepo: Repository<MentalHealthAssessmentEntity>,
    @InjectRepository(MentalHealthPatternEntity) private readonly patternRepo: Repository<MentalHealthPatternEntity>,
    @InjectRepository(HormonalInsightEntity) private readonly insightRepo: Repository<HormonalInsightEntity>,
    @InjectRepository(DailyLogEntity) private readonly dailyLogRepo: Repository<DailyLogEntity>,
  ) {}

  async generateConsultationReport(userId: string, patientName: string, res: Response): Promise<void> {
    const [cycles, medications, assessments, pattern, insight, logs] = await Promise.all([
      this.cycleRepo.find({ where: { userId }, order: { startDate: 'DESC' }, take: 6 }),
      this.medRepo.find({ where: { userId, active: true }, order: { startDate: 'DESC' } }),
      this.assessmentRepo.find({ where: { userId }, order: { createdAt: 'DESC' }, take: 10 }),
      this.patternRepo.findOne({ where: { userId }, order: { createdAt: 'DESC' } }),
      this.insightRepo.findOne({ where: { userId }, order: { createdAt: 'DESC' } }),
      this.dailyLogRepo.find({ where: { userId }, order: { logDate: 'DESC' }, take: 30 }),
    ]);

    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="relatorio-saude-${new Date().toISOString().split('T')[0]}.pdf"`);
    doc.pipe(res);

    const purple = '#7C5CBF';
    const navy = '#0F1F3D';
    const gray = '#6B7280';
    const lightGray = '#F3F4F6';

    // CABECALHO
    doc.rect(0, 0, doc.page.width, 80).fill(navy);
    doc.fillColor('#FFFFFF').fontSize(22).font('Helvetica-Bold').text('EliaMov', 50, 25);
    doc.fontSize(10).font('Helvetica').text('Relatorio de Saude para Consulta Medica', 50, 52);
    doc.fillColor(navy);

    // INFO PACIENTE
    doc.moveDown(3);
    doc.fontSize(14).font('Helvetica-Bold').fillColor(navy).text('Informacoes do Paciente');
    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke(purple);
    doc.moveDown(0.5);
    doc.fontSize(11).font('Helvetica').fillColor('#1F2937');
    doc.text(`Paciente: ${patientName}`);
    doc.text(`Data do relatorio: ${new Date().toLocaleDateString('pt-BR')}`);
    doc.text(`Periodo analisado: ultimos 6 ciclos / 30 dias`);

    // CICLOS
    doc.moveDown(1.5);
    doc.fontSize(14).font('Helvetica-Bold').fillColor(navy).text('Historico de Ciclos');
    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke(purple);
    doc.moveDown(0.5);

    if (cycles.length === 0) {
      doc.fontSize(11).font('Helvetica').fillColor(gray).text('Nenhum ciclo registrado.');
    } else {
      cycles.forEach((c, i) => {
        const start = new Date(c.startDate).toLocaleDateString('pt-BR');
        const len = c.cycleLength ? `${c.cycleLength} dias` : 'nao informado';
        const period = c.periodLength ? `${c.periodLength} dias` : 'nao informado';
        doc.fontSize(10).font('Helvetica').fillColor('#1F2937')
          .text(`${i + 1}. Inicio: ${start} | Duracao: ${len} | Periodo: ${period}`);
      });
    }

    if (insight) {
      doc.moveDown(0.8);
      doc.fontSize(11).font('Helvetica-Bold').fillColor(navy).text('Analise Hormonal:');
      doc.fontSize(10).font('Helvetica').fillColor('#1F2937');
      doc.text(`Media do ciclo: ${insight.avgCycleLength ?? '-'} dias`);
      doc.text(`Variabilidade: ${insight.cycleVariability ?? '-'} dias`);
      doc.text(`Risco AUB: ${insight.aubRiskLevel.toUpperCase()} (score ${insight.aubRiskScore})`);
      doc.text(`Score perimenopausa: ${insight.perimenopauseScore}`);
      doc.text(`Status: ${insight.clinicianSummary}`, { width: 495 });
    }

    // SAUDE MENTAL
    doc.moveDown(1.5);
    doc.fontSize(14).font('Helvetica-Bold').fillColor(navy).text('Saude Mental');
    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke(purple);
    doc.moveDown(0.5);

    const phq9s = assessments.filter(a => a.assessmentType === 'phq9');
    const gad7s = assessments.filter(a => a.assessmentType === 'gad7');

    if (phq9s.length === 0 && gad7s.length === 0) {
      doc.fontSize(11).font('Helvetica').fillColor(gray).text('Nenhuma avaliacao de saude mental registrada.');
    } else {
      if (phq9s.length > 0) {
        doc.fontSize(11).font('Helvetica-Bold').fillColor(navy).text('PHQ-9 (Humor):');
        phq9s.slice(0, 5).forEach(a => {
          const date = new Date(a.createdAt).toLocaleDateString('pt-BR');
          doc.fontSize(10).font('Helvetica').fillColor('#1F2937')
            .text(`  ${date}: score ${a.totalScore} (${a.severityLevel}) — fase: ${a.cyclePhaseAtAssessment}`);
        });
      }
      if (gad7s.length > 0) {
        doc.moveDown(0.5);
        doc.fontSize(11).font('Helvetica-Bold').fillColor(navy).text('GAD-7 (Ansiedade):');
        gad7s.slice(0, 5).forEach(a => {
          const date = new Date(a.createdAt).toLocaleDateString('pt-BR');
          doc.fontSize(10).font('Helvetica').fillColor('#1F2937')
            .text(`  ${date}: score ${a.totalScore} (${a.severityLevel}) — fase: ${a.cyclePhaseAtAssessment}`);
        });
      }
      if (pattern) {
        doc.moveDown(0.5);
        doc.fontSize(10).font('Helvetica').fillColor('#1F2937');
        doc.text(`Padrao identificado: ${pattern.overallPattern}`);
        doc.text(`TDPM suspeito: ${pattern.pmddSuspected ? 'Sim' : 'Nao'}`);
        doc.text(`Alerta clinico: ${pattern.clinicianAlertRequired ? pattern.clinicianAlertReason : 'Nenhum'}`);
        doc.text(`Resumo: ${pattern.clinicianSummary}`, { width: 495 });
      }
    }

    // MEDICACOES
    doc.moveDown(1.5);
    doc.fontSize(14).font('Helvetica-Bold').fillColor(navy).text('Medicacoes em Uso');
    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke(purple);
    doc.moveDown(0.5);

    if (medications.length === 0) {
      doc.fontSize(11).font('Helvetica').fillColor(gray).text('Nenhuma medicacao registrada.');
    } else {
      medications.forEach(m => {
        const since = new Date(m.startDate).toLocaleDateString('pt-BR');
        const dose = m.dose ? ` | ${m.dose}` : '';
        const freq = m.frequency ? ` | ${m.frequency}` : '';
        doc.fontSize(10).font('Helvetica').fillColor('#1F2937').text(`• ${m.name}${dose}${freq} (desde ${since})`);
      });
    }

    // SINTOMAS 30 DIAS
    doc.moveDown(1.5);
    doc.fontSize(14).font('Helvetica-Bold').fillColor(navy).text('Sintomas Frequentes — Ultimos 30 dias');
    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke(purple);
    doc.moveDown(0.5);

    if (logs.length === 0) {
      doc.fontSize(11).font('Helvetica').fillColor(gray).text('Nenhum registro diario encontrado.');
    } else {
      const symFields: [keyof DailyLogEntity, string][] = [
        ['pelvicPain', 'Dor pelvica'], ['headache', 'Cefaleia'], ['bloating', 'Inchaco'],
        ['anxiety', 'Ansiedade'], ['irritability', 'Irritabilidade'], ['hotFlashes', 'Ondas de calor'],
      ];
      symFields.forEach(([field, label]) => {
        const count = logs.filter(l => {
          const val = l[field];
          return typeof val === 'boolean' ? val : (val as number ?? 0) >= 3;
        }).length;
        if (count > 0) {
          const pct = Math.round((count / logs.length) * 100);
          doc.fontSize(10).font('Helvetica').fillColor('#1F2937')
            .text(`• ${label}: presente em ${count} de ${logs.length} dias registrados (${pct}%)`);
        }
      });
      const energyLogs = logs.filter(l => l.energyLevel !== null);
      const avgEnergy = energyLogs.length > 0
        ? energyLogs.reduce((s, l) => s + (l.energyLevel ?? 0), 0) / energyLogs.length
        : 0;
      if (energyLogs.length > 0) doc.text(`• Energia media: ${avgEnergy.toFixed(1)}/5`);
    }

    // RODAPE
    doc.moveDown(2);
    const footerY = doc.y;
    doc.rect(50, footerY, 495, 45).fill(lightGray);
    doc.fillColor(gray).fontSize(9).font('Helvetica')
      .text(
        'Este relatorio foi gerado automaticamente pelo EliaMov e nao substitui avaliacao clinica. ' +
        'Os dados foram registrados pela propria paciente.',
        55, footerY + 8, { width: 485 },
      );

    doc.end();
  }
}
