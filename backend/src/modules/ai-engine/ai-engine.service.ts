import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CycleService } from '../cycle/cycle.service';
import { MoodService } from '../mood/mood.service';
import { GlucometerService } from '../glucometer/glucometer.service';
import { BloodPressureService } from '../blood-pressure/blood-pressure.service';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AiEngineService {
  private readonly logger = new Logger(AiEngineService.name);
  private readonly anthropicUrl = 'https://api.anthropic.com/v1/messages';
  private readonly model = 'claude-sonnet-4-20250514';

  constructor(
    private readonly cycleService: CycleService,
    private readonly moodService: MoodService,
    private readonly glucoseService: GlucometerService,
    private readonly bpService: BloodPressureService,
    @InjectRepository(User) private readonly usersRepo: Repository<User>,
  ) {}

  private hasApiKey() {
    const key = process.env.ANTHROPIC_API_KEY;
    return !!key && key !== 'sua_chave_aqui';
  }

  private async callClaude(prompt: string, systemPrompt?: string) {
    try {
      const res = await fetch(this.anthropicUrl, {
        method: 'POST',
        headers: {
          'x-api-key': process.env.ANTHROPIC_API_KEY ?? '',
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          max_tokens: 2048,
          system: systemPrompt,
          messages: [{ role: 'user', content: prompt }],
        }),
      });
      const json: any = await res.json();
      if (json?.content?.[0]?.text) {
        return { text: json.content[0].text as string };
      }
      this.logger.warn(`Claude response without text: ${JSON.stringify(json).slice(0, 300)}`);
      return { text: null, error: json?.error?.message ?? 'unknown_response' };
    } catch (err) {
      this.logger.error('Claude call failed', err as any);
      return { text: null, error: 'claude_unavailable' };
    }
  }

  async generateInsights(userId: string) {
    const [user, cycle, currentPhase, moodSummary, glucoseSummary, bpSummary] = await Promise.all([
      this.usersRepo.findOne({ where: { id: userId } }),
      this.cycleService.findAllForUser(userId),
      this.cycleService.getCurrentPhase(userId),
      this.moodService.summary(userId),
      this.glucoseService.summary(userId),
      this.bpService.summary(userId),
    ]);

    const age = user?.birthDate
      ? Math.floor(
          (Date.now() - new Date(user.birthDate).getTime()) / (1000 * 60 * 60 * 24 * 365.25),
        )
      : null;

    const bmi =
      user?.weight && user?.height
        ? +(user.weight / Math.pow(user.height / 100, 2)).toFixed(1)
        : null;

    const dataSnapshot = {
      perfil: {
        nome: user?.name,
        idade: age,
        peso_kg: user?.weight,
        altura_cm: user?.height,
        imc: bmi,
        condicoes_saude: user?.healthConditions,
        nivel_atividade: user?.fitnessLevel,
        objetivo_principal: user?.fitnessGoal,
        detalhes: user?.profile ?? null,
      },
      ciclo: {
        registros: cycle.length,
        fase_atual: currentPhase.phase,
        dia_do_ciclo: currentPhase.dayOfCycle,
        proxima_menstruacao: currentPhase.nextStart,
      },
      humor_ultimos_7d: moodSummary,
      glicemia_ultimos_14d: glucoseSummary,
      pressao_ultimos_14d: bpSummary,
    };

    const totalRecords =
      cycle.length + moodSummary.count + glucoseSummary.count + bpSummary.count;
    const hasProfile = !!user?.profile && Object.keys(user.profile).length > 0;

    if (totalRecords === 0 && !hasProfile) {
      return {
        generatedAt: new Date().toISOString(),
        usingAi: false,
        snapshot: dataSnapshot,
        text:
          'Você ainda não tem dados suficientes. Complete seu perfil e registre seu ciclo, ' +
          'humor, glicemia ou pressão para receber insights personalizados.',
      };
    }

    if (!this.hasApiKey()) {
      return {
        generatedAt: new Date().toISOString(),
        usingAi: false,
        snapshot: dataSnapshot,
        text: this.buildOfflineSummary(dataSnapshot),
      };
    }

    const systemPrompt =
      'Você é uma copiloto de saúde feminina do EliaMov. Use linguagem acolhedora, ' +
      'objetiva, baseada em evidências e sem jargão médico. Você tem o perfil clínico completo ' +
      'da usuária (idade, IMC, condições, objetivos, motivações) e os registros recentes. ' +
      'Conecte os dados ao perfil dela: trate como uma jornada personalizada, mencionando ' +
      'objetivos específicos quando relevante. NÃO dê diagnósticos — dê observações, padrões ' +
      'e ações práticas. Sempre lembre de buscar um profissional quando relevante. ' +
      'Responda em português, em até 350 palavras, usando markdown com cabeçalhos curtos (###), ' +
      'bullets (-) e blockquote (>) para destaque final.';

    const prompt = `Você está acompanhando uma usuária do EliaMov. Aqui está o perfil completo dela e os registros recentes.

Construa uma análise personalizada com:
1. Uma observação sobre o **momento atual** dela (fase do ciclo + perfil + objetivo)
2. **2–3 padrões** interessantes nos dados (conecte ciclo, humor, vitais e o perfil)
3. **2 ações práticas** específicas, alinhadas com os objetivos e barreiras dela
4. Um destaque final acolhedor (use blockquote)

Se faltarem dados em alguma área, sugira o que registrar pra evoluir a personalização — sem ser repetitiva.

Dados completos:
${JSON.stringify(dataSnapshot, null, 2)}`;

    const result = await this.callClaude(prompt, systemPrompt);

    if (!result.text) {
      return {
        generatedAt: new Date().toISOString(),
        usingAi: false,
        snapshot: dataSnapshot,
        text: this.buildOfflineSummary(dataSnapshot),
        error: result.error,
      };
    }

    return {
      generatedAt: new Date().toISOString(),
      usingAi: true,
      snapshot: dataSnapshot,
      text: result.text,
    };
  }

  private buildOfflineSummary(snapshot: any): string {
    const lines: string[] = [];
    lines.push('**Resumo dos seus registros** _(modo offline — configure ANTHROPIC_API_KEY para insights gerados por IA)_');
    lines.push('');

    if (snapshot.ciclo.fase_atual) {
      lines.push(
        `• Você está na fase **${snapshot.ciclo.fase_atual}** (dia ${snapshot.ciclo.dia_do_ciclo} do ciclo). Próxima menstruação prevista para ${snapshot.ciclo.proxima_menstruacao}.`,
      );
    }

    const m = snapshot.humor_ultimos_7d;
    if (m.count > 0) {
      lines.push(
        `• Nos últimos 7 dias: energia média ${m.avgEnergy}/5, humor ${m.avgMood}/5, sono ${m.avgSleep ?? '—'}h, ${m.painDays} dia(s) com dor.`,
      );
    }

    const g = snapshot.glicemia_ultimos_14d;
    if (g.count > 0) {
      lines.push(
        `• Glicemia (14 dias): média ${g.avg} mg/dL, mínima ${g.min}, máxima ${g.max}, ${g.alerts} alerta(s).`,
      );
    }

    const bp = snapshot.pressao_ultimos_14d;
    if (bp.count > 0) {
      lines.push(
        `• Pressão (14 dias): média ${bp.avgSystolic}/${bp.avgDiastolic} mmHg, FC ${bp.avgHeartRate ?? '—'} bpm, ${bp.alerts} alerta(s).`,
      );
    }

    lines.push('');
    lines.push('_Configure sua chave da Anthropic em `backend/.env` para receber análises personalizadas pela IA._');
    return lines.join('\n');
  }

  async generateTrainingPlan(userId: string) {
    const prompt = `Gerar plano de treino semanal para usuário ${userId} considerando fase do ciclo, mood e readiness wearable. Retorne JSON com dias da semana e atividades.`;
    return this.callClaude(prompt);
  }

  async analyzeLabExam(examData: any) {
    const prompt = `Analisar exame laboratorial e sinalizar pontos de atenção: ${JSON.stringify(examData)}`;
    return this.callClaude(prompt);
  }

  async generateNutritionPlan(userId: string) {
    const prompt = `Gerar plano alimentar semanal personalizado para usuário ${userId}.`;
    return this.callClaude(prompt);
  }

  async searchPubmed(query: string) {
    try {
      const url = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${encodeURIComponent(query)}&retmode=json&api_key=${process.env.PUBMED_API_KEY ?? ''}`;
      const res = await fetch(url);
      return await res.json();
    } catch (err) {
      this.logger.error('PubMed search failed', err as any);
      return { error: 'pubmed_unavailable' };
    }
  }
}
