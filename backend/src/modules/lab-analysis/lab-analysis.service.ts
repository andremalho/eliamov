import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LabResult } from './entities/lab-result.entity';
import { CreateLabResultDto } from './dto/create-lab-result.dto';

@Injectable()
export class LabAnalysisService {
  constructor(
    @InjectRepository(LabResult) private repo: Repository<LabResult>,
  ) {}

  async create(userId: string, dto: CreateLabResultDto) {
    const classified = this.classifyValues(dto.values ?? {});
    const aiAnalysis = this.generateAnalysis(classified);

    const result = this.repo.create({
      userId,
      examDate: dto.examDate,
      labName: dto.labName,
      reportFileUrl: dto.reportFileUrl,
      values: classified,
      aiAnalysis,
      notes: dto.notes,
    } as any);
    return this.repo.save(result);
  }

  async findAll(userId: string) {
    return this.repo.find({ where: { userId }, order: { examDate: 'DESC' } });
  }

  async getEvolution(userId: string, marker: string) {
    const results = await this.repo.find({
      where: { userId },
      order: { examDate: 'ASC' },
    });
    return results
      .filter((r) => r.values?.[marker])
      .map((r) => ({
        date: r.examDate,
        value: r.values[marker].value,
        unit: r.values[marker].unit,
        status: r.values[marker].status,
      }));
  }

  private classifyValues(
    values: Record<string, { value: number; unit: string }>,
  ): Record<string, any> {
    const refs: Record<string, { min: number; max: number; unit: string }> = {
      hemoglobina: { min: 12.0, max: 16.0, unit: 'g/dL' },
      hematocrito: { min: 36, max: 46, unit: '%' },
      ferritina: { min: 12, max: 150, unit: 'ng/mL' },
      glicemia_jejum: { min: 70, max: 99, unit: 'mg/dL' },
      insulina: { min: 2.6, max: 24.9, unit: 'uU/mL' },
      tsh: { min: 0.4, max: 4.0, unit: 'mUI/L' },
      t4_livre: { min: 0.8, max: 1.8, unit: 'ng/dL' },
      colesterol_total: { min: 0, max: 200, unit: 'mg/dL' },
      hdl: { min: 40, max: 999, unit: 'mg/dL' },
      ldl: { min: 0, max: 130, unit: 'mg/dL' },
      triglicerides: { min: 0, max: 150, unit: 'mg/dL' },
      vitamina_d: { min: 30, max: 100, unit: 'ng/mL' },
      vitamina_b12: { min: 200, max: 900, unit: 'pg/mL' },
      cortisol: { min: 6.2, max: 19.4, unit: 'mcg/dL' },
      creatina_quinase: { min: 26, max: 192, unit: 'U/L' },
      pcr: { min: 0, max: 3, unit: 'mg/L' },
    };

    const result: Record<string, any> = {};
    for (const [key, val] of Object.entries(values)) {
      const ref = refs[key];
      let status: string = 'normal';
      if (ref) {
        if (val.value < ref.min) status = 'low';
        else if (val.value > ref.max) status = 'high';
        if (key === 'glicemia_jejum' && val.value > 125) status = 'critical';
        if (key === 'ferritina' && val.value < 12) status = 'critical';
      }
      result[key] = {
        ...val,
        refMin: ref?.min,
        refMax: ref?.max,
        status,
      };
    }
    return result;
  }

  private generateAnalysis(values: Record<string, any>): string {
    const alerts: string[] = [];
    for (const [key, val] of Object.entries(values)) {
      const label = key.replace(/_/g, ' ');
      if (val.status === 'critical')
        alerts.push(
          `ATENCAO: ${label} = ${val.value} ${val.unit} (critico)`,
        );
      else if (val.status === 'high')
        alerts.push(
          `${label} elevado: ${val.value} ${val.unit} (ref: ate ${val.refMax})`,
        );
      else if (val.status === 'low')
        alerts.push(
          `${label} baixo: ${val.value} ${val.unit} (ref: acima de ${val.refMin})`,
        );
    }
    if (alerts.length === 0)
      return 'Todos os valores dentro da normalidade.';
    return (
      'Pontos de atencao:\n' +
      alerts.join('\n') +
      '\n\nConsulte seu medico para interpretacao completa.'
    );
  }
}
