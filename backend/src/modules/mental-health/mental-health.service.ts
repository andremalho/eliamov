import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MentalHealthAssessment } from './entities/mental-health-assessment.entity';

// PHQ-9 questions — Kroenke, Spitzer & Williams (2001)
const PHQ9_QUESTIONS = [
  'Pouco interesse ou prazer em fazer as coisas',
  'Sentir-se para baixo, deprimido(a) ou sem esperanca',
  'Dificuldade para pegar no sono, manter o sono ou dormir demais',
  'Sentir-se cansado(a) ou com pouca energia',
  'Falta de apetite ou comer demais',
  'Sentir-se mal consigo mesmo(a), ou que e um fracasso, ou que decepcionou a si mesmo(a) ou a sua familia',
  'Dificuldade para se concentrar nas coisas',
  'Mover-se ou falar tao devagar que outras pessoas podem ter notado, ou ao contrario, ficar tao agitado(a) que se mexe muito mais do que de costume',
  'Pensar que seria melhor estar morto(a) ou se machucar de alguma forma',
];

// GAD-7 questions — Spitzer, Kroenke, Williams & Löwe (2006)
const GAD7_QUESTIONS = [
  'Sentir-se nervoso(a), ansioso(a) ou no limite',
  'Nao conseguir parar ou controlar a preocupacao',
  'Preocupar-se demais com diferentes coisas',
  'Dificuldade para relaxar',
  'Ficar tao agitado(a) que e dificil ficar sentado(a)',
  'Ficar facilmente irritado(a) ou incomodado(a)',
  'Sentir medo como se algo terrivel pudesse acontecer',
];

@Injectable()
export class MentalHealthService {
  constructor(
    @InjectRepository(MentalHealthAssessment)
    private readonly assessmentRepo: Repository<MentalHealthAssessment>,
  ) {}

  getQuestions(type: 'phq9' | 'gad7') {
    const questions = type === 'phq9' ? PHQ9_QUESTIONS : GAD7_QUESTIONS;
    return questions.map((text, index) => ({ index, text }));
  }

  async submitAssessment(
    userId: string,
    type: 'phq9' | 'gad7',
    answers: number[],
  ) {
    const expectedLength = type === 'phq9' ? 9 : 7;
    if (answers.length !== expectedLength) {
      throw new BadRequestException(
        `Expected ${expectedLength} answers for ${type.toUpperCase()}, got ${answers.length}`,
      );
    }

    const totalScore = answers.reduce((sum, val) => sum + val, 0);
    const severity = this.calculateSeverity(type, totalScore);

    const assessment = this.assessmentRepo.create({
      userId,
      date: new Date(),
      type,
      answers,
      totalScore,
      severity,
    });

    return this.assessmentRepo.save(assessment);
  }

  async getHistory(userId: string, type: 'phq9' | 'gad7') {
    return this.assessmentRepo.find({
      where: { userId, type },
      order: { date: 'DESC' },
    });
  }

  async getLatest(userId: string) {
    const [latestPhq9, latestGad7] = await Promise.all([
      this.assessmentRepo.findOne({
        where: { userId, type: 'phq9' },
        order: { date: 'DESC' },
      }),
      this.assessmentRepo.findOne({
        where: { userId, type: 'gad7' },
        order: { date: 'DESC' },
      }),
    ]);

    return { phq9: latestPhq9 ?? null, gad7: latestGad7 ?? null };
  }

  async getMeditationSuggestions(userId: string) {
    const latest = await this.getLatest(userId);

    const suggestions: {
      title: string;
      duration: string;
      description: string;
    }[] = [];

    // Base suggestions for everyone
    suggestions.push({
      title: 'Respiracao Diafragmatica',
      duration: '5 min',
      description:
        'Exercicio de respiracao profunda para acalmar o sistema nervoso',
    });

    const phq9Score = latest.phq9?.totalScore ?? 0;
    const gad7Score = latest.gad7?.totalScore ?? 0;

    // Anxiety-focused suggestions
    if (gad7Score >= 5) {
      suggestions.push({
        title: 'Body Scan para Ansiedade',
        duration: '10 min',
        description:
          'Escaneamento corporal guiado para liberar tensao e ansiedade',
      });
      suggestions.push({
        title: 'Tecnica 4-7-8',
        duration: '5 min',
        description:
          'Respiracao 4-7-8 para reducao imediata de ansiedade',
      });
    }

    if (gad7Score >= 10) {
      suggestions.push({
        title: 'Meditacao de Ancoragem',
        duration: '15 min',
        description:
          'Tecnica de grounding para momentos de ansiedade intensa',
      });
    }

    // Depression-focused suggestions
    if (phq9Score >= 5) {
      suggestions.push({
        title: 'Meditacao de Autocompaixao',
        duration: '10 min',
        description:
          'Pratica guiada de bondade amorosa e autocompaixao',
      });
      suggestions.push({
        title: 'Visualizacao Positiva',
        duration: '8 min',
        description:
          'Visualizacao guiada para cultivar emocoes positivas',
      });
    }

    if (phq9Score >= 10) {
      suggestions.push({
        title: 'Meditacao de Aceitacao',
        duration: '12 min',
        description:
          'Pratica de aceitacao e presenca para dias dificeis',
      });
    }

    // High severity alert
    if (phq9Score >= 15 || gad7Score >= 15) {
      suggestions.push({
        title: 'Importante: Busque Apoio Profissional',
        duration: '',
        description:
          'Seus resultados indicam sintomas significativos. Recomendamos conversar com um profissional de saude mental. CVV: 188 (24h)',
      });
    }

    return {
      suggestions,
      basedOn: {
        phq9Score,
        phq9Severity: latest.phq9?.severity ?? null,
        gad7Score,
        gad7Severity: latest.gad7?.severity ?? null,
      },
    };
  }

  private calculateSeverity(
    type: 'phq9' | 'gad7',
    score: number,
  ): string {
    if (type === 'phq9') {
      // PHQ-9: Kroenke 2001
      if (score <= 4) return 'minimo';
      if (score <= 9) return 'leve';
      if (score <= 14) return 'moderado';
      if (score <= 19) return 'moderado-grave';
      return 'grave';
    }

    // GAD-7: Spitzer 2006
    if (score <= 4) return 'minimo';
    if (score <= 9) return 'leve';
    if (score <= 14) return 'moderado';
    return 'grave';
  }
}
