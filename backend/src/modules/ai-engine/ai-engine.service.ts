import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CycleService } from '../cycle/cycle.service';
import { MoodService } from '../mood/mood.service';
import { GlucometerService } from '../glucometer/glucometer.service';
import { BloodPressureService } from '../blood-pressure/blood-pressure.service';
import { User } from '../users/entities/user.entity';
import { ChatMessage } from '../chat/entities/chat.entity';

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
    @InjectRepository(ChatMessage) private readonly chatRepo: Repository<ChatMessage>,
  ) {}

  private hasApiKey() {
    const key = process.env.ANTHROPIC_API_KEY;
    return !!key && key !== 'sua_chave_aqui';
  }

  private async callClaude(prompt: string, systemPrompt?: string, messageHistory?: { role: string; content: string }[]) {
    try {
      const messages = messageHistory
        ? [...messageHistory, { role: 'user', content: prompt }]
        : [{ role: 'user', content: prompt }];

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
          messages,
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
    const [user, currentPhase, moodSummary] = await Promise.all([
      this.usersRepo.findOne({ where: { id: userId } }),
      this.cycleService.getCurrentPhase(userId),
      this.moodService.summary(userId),
    ]);

    if (!user) {
      return { text: null, error: 'user_not_found' };
    }

    const age = user.birthDate
      ? Math.floor(
          (Date.now() - new Date(user.birthDate).getTime()) / (1000 * 60 * 60 * 24 * 365.25),
        )
      : null;

    const bmi =
      user.weight && user.height
        ? +(user.weight / Math.pow(user.height / 100, 2)).toFixed(1)
        : null;

    if (!this.hasApiKey()) {
      return {
        generatedAt: new Date().toISOString(),
        usingAi: false,
        text: 'Configure ANTHROPIC_API_KEY em backend/.env para gerar planos de treino personalizados com IA.',
      };
    }

    const systemPrompt =
      'Você é uma personal trainer especializada em saúde feminina do EliaMov. ' +
      'Crie planos de treino adaptados ao ciclo menstrual, nível de condicionamento e objetivos da usuária. ' +
      'Use linguagem acolhedora e baseada em evidências. Ajuste intensidade e tipo de exercício conforme a fase do ciclo. ' +
      'NÃO dê diagnósticos médicos. Sempre sugira consultar um profissional para condições específicas. ' +
      'Responda em português, em formato JSON válido com a estrutura: ' +
      '{ "weekPlan": [{ "day": "segunda", "focus": "...", "exercises": [{ "name": "...", "sets": N, "reps": "...", "notes": "..." }], "duration_min": N, "intensity": "low|moderate|high" }], ' +
      '"cycleAdaptation": "...", "generalTips": ["..."] }';

    const prompt = `Crie um plano de treino semanal personalizado para esta usuária:

Perfil:
- Nome: ${user.name}
- Idade: ${age ?? 'não informada'}
- Peso: ${user.weight ?? 'não informado'} kg
- Altura: ${user.height ?? 'não informada'} cm
- IMC: ${bmi ?? 'não calculado'}
- Nível de atividade: ${user.fitnessLevel ?? 'não informado'}
- Objetivo principal: ${user.fitnessGoal ?? 'não informado'}
- Condições de saúde: ${user.healthConditions?.join(', ') || 'nenhuma informada'}
- Detalhes adicionais do perfil: ${user.profile ? JSON.stringify(user.profile) : 'nenhum'}

Ciclo menstrual:
- Fase atual: ${currentPhase.phase ?? 'não registrada'}
- Dia do ciclo: ${currentPhase.dayOfCycle ?? 'desconhecido'}
- Próxima menstruação: ${currentPhase.nextStart ?? 'desconhecida'}

Humor e bem-estar (últimos 7 dias):
- Registros: ${moodSummary.count}
- Energia média: ${moodSummary.avgEnergy}/5
- Humor médio: ${moodSummary.avgMood}/5
- Sono médio: ${moodSummary.avgSleep ?? 'não informado'}h
- Dias com dor: ${moodSummary.painDays}

Adapte o plano à fase do ciclo e ao estado emocional/energético atual. Retorne APENAS o JSON, sem texto adicional.`;

    const result = await this.callClaude(prompt, systemPrompt);

    return {
      generatedAt: new Date().toISOString(),
      usingAi: !!result.text,
      plan: result.text ? this.tryParseJson(result.text) : null,
      raw: result.text,
      error: result.error ?? undefined,
    };
  }

  async analyzeLabExam(examData: any) {
    const prompt = `Analisar exame laboratorial e sinalizar pontos de atenção: ${JSON.stringify(examData)}`;
    return this.callClaude(prompt);
  }

  async generateNutritionPlan(userId: string) {
    const [user, currentPhase] = await Promise.all([
      this.usersRepo.findOne({ where: { id: userId } }),
      this.cycleService.getCurrentPhase(userId),
    ]);

    if (!user) {
      return { text: null, error: 'user_not_found' };
    }

    const age = user.birthDate
      ? Math.floor(
          (Date.now() - new Date(user.birthDate).getTime()) / (1000 * 60 * 60 * 24 * 365.25),
        )
      : null;

    const bmi =
      user.weight && user.height
        ? +(user.weight / Math.pow(user.height / 100, 2)).toFixed(1)
        : null;

    if (!this.hasApiKey()) {
      return {
        generatedAt: new Date().toISOString(),
        usingAi: false,
        text: 'Configure ANTHROPIC_API_KEY em backend/.env para gerar planos nutricionais personalizados com IA.',
      };
    }

    const systemPrompt =
      'Você é uma nutricionista especializada em saúde feminina do EliaMov. ' +
      'Crie planos alimentares adaptados ao ciclo menstrual, perfil antropométrico e objetivos da usuária. ' +
      'Use linguagem acolhedora e baseada em evidências. Adapte macro e micronutrientes conforme a fase do ciclo. ' +
      'NÃO dê diagnósticos médicos. Sempre sugira consultar um nutricionista para ajustes individuais. ' +
      'Responda em português, em formato JSON válido com a estrutura: ' +
      '{ "weekPlan": [{ "day": "segunda", "meals": [{ "meal": "café da manhã|lanche|almoço|lanche da tarde|jantar", ' +
      '"foods": ["..."], "notes": "..." }] }], ' +
      '"cycleAdaptation": "...", "dailyCalories": N, "macros": { "protein_g": N, "carbs_g": N, "fat_g": N }, ' +
      '"keyNutrients": ["..."], "generalTips": ["..."] }';

    const prompt = `Crie um plano alimentar semanal personalizado para esta usuária:

Perfil:
- Nome: ${user.name}
- Idade: ${age ?? 'não informada'}
- Peso: ${user.weight ?? 'não informado'} kg
- Altura: ${user.height ?? 'não informada'} cm
- IMC: ${bmi ?? 'não calculado'}
- Nível de atividade: ${user.fitnessLevel ?? 'não informado'}
- Objetivo principal: ${user.fitnessGoal ?? 'não informado'}
- Condições de saúde: ${user.healthConditions?.join(', ') || 'nenhuma informada'}
- Detalhes adicionais do perfil: ${user.profile ? JSON.stringify(user.profile) : 'nenhum'}

Ciclo menstrual:
- Fase atual: ${currentPhase.phase ?? 'não registrada'}
- Dia do ciclo: ${currentPhase.dayOfCycle ?? 'desconhecido'}
- Próxima menstruação: ${currentPhase.nextStart ?? 'desconhecida'}

Adapte o plano à fase do ciclo, priorizando nutrientes relevantes para a fase atual. Retorne APENAS o JSON, sem texto adicional.`;

    const result = await this.callClaude(prompt, systemPrompt);

    return {
      generatedAt: new Date().toISOString(),
      usingAi: !!result.text,
      plan: result.text ? this.tryParseJson(result.text) : null,
      raw: result.text,
      error: result.error ?? undefined,
    };
  }

  private tryParseJson(text: string): any {
    try {
      // Try direct parse first
      return JSON.parse(text);
    } catch {
      // Try extracting JSON from markdown code block
      const match = text.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (match) {
        try {
          return JSON.parse(match[1].trim());
        } catch {
          return null;
        }
      }
      return null;
    }
  }

  async chat(userId: string, message: string) {
    const [user, currentPhase, moodSummary] = await Promise.all([
      this.usersRepo.findOne({ where: { id: userId } }),
      this.cycleService.getCurrentPhase(userId).catch(() => null),
      this.moodService.summary(userId).catch(() => ({ count: 0 })),
    ]);

    const systemPrompt = `Voce e Elia, a assistente de saude feminina do eliaMov. Responda em portugues, de forma acolhedora, objetiva e baseada em evidencias. Voce tem acesso ao perfil da usuaria:
- Nome: ${user?.name ?? 'Usuaria'}
- Fase do ciclo: ${currentPhase?.phase ?? 'nao informado'} (dia ${currentPhase?.dayOfCycle ?? '?'})
- Objetivo: ${(user as any)?.fitnessGoal ?? 'nao informado'}
- Nivel: ${(user as any)?.fitnessLevel ?? 'nao informado'}
- Humor recente: ${(moodSummary as any)?.avgMood ?? 'nao registrado'}/5

Regras:
1. NUNCA de diagnosticos medicos. Voce NAO e profissional de saude. Sempre recomende consultar um profissional quando relevante.
2. Base suas recomendacoes de treino na fase do ciclo (McNulty 2020, Schlie 2025).
3. Para nutricao, use o Guia Alimentar Brasileiro e ISSN 2017.
4. Seja breve (max 200 palavras). Use markdown leve.
5. Se nao souber, diga que nao sabe.
6. Em respostas sobre saude, sintomas ou condicoes, SEMPRE inclua ao final: "⚕️ Lembre-se: sou uma assistente virtual e nao substituo a consulta com um profissional de saude."
7. NUNCA prescreva medicamentos, dosagens especificas de suplementos que requerem orientacao medica, ou tratamentos.`;

    // Load conversation history (last 10 messages for context)
    const conversationId = `elia-${userId}`;
    const history = await this.chatRepo.find({
      where: { userId, conversationId },
      order: { createdAt: 'ASC' },
      take: 20,
    });
    const messageHistory = history.map((m) => ({
      role: m.sender === 'user' ? 'user' : 'assistant',
      content: m.content,
    }));

    // Persist user message
    await this.chatRepo.save(this.chatRepo.create({
      userId,
      sender: 'user' as const,
      content: message,
      conversationId,
    }));

    if (!this.hasApiKey()) {
      // Offline fallback
      const offlineResponses: Record<string, string> = {
        treino: `Com base na sua fase ${currentPhase?.phase ?? 'atual'}, recomendo ${currentPhase?.phase === 'menstrual' ? 'yoga restaurativa ou caminhada leve' : currentPhase?.phase === 'follicular' ? 'treino de forca progressiva ou HIIT' : currentPhase?.phase === 'ovulatory' ? 'treino de performance maxima (cuidado com ligamentos!)' : 'pilates ou treino moderado'}. Acesse "Treino" no menu para ver o plano do dia.`,
        colica: 'Para colicas, yoga restaurativa pode ajudar. Posturas como Balasana (crianca) e Supta Baddha Konasana aliviam a dor. Alimentos ricos em magnesio (chocolate amargo 70%+, castanhas) tambem ajudam. Se as colicas forem muito intensas, consulte sua ginecologista.',
        alimentacao: `Para sua fase ${currentPhase?.phase ?? 'atual'}, priorize ${currentPhase?.phase === 'luteal' ? 'alimentos anti-inflamatorios (omega-3, magnesio)' : 'proteina de qualidade (1.4g/kg) e carboidratos complexos'}. Beba pelo menos 2L de agua por dia.`,
      };

      const key = Object.keys(offlineResponses).find((k) =>
        message.toLowerCase().includes(k),
      );
      return {
        response: key
          ? offlineResponses[key]
          : `Ola ${user?.name?.split(' ')[0] ?? ''}! Para respostas personalizadas com IA, configure sua chave da Anthropic. Enquanto isso, explore o menu de Treino para ver seu plano adaptado ao ciclo.`,
        usingAi: false,
      };
    }

    const result = await this.callClaude(message, systemPrompt, messageHistory.slice(-10));
    const disclaimer = '\n\n---\n*⚕️ Elia e uma assistente virtual e nao substitui a consulta com profissionais de saude. Para diagnosticos e tratamentos, consulte seu medico.*';
    const responseText = (result.text ?? 'Desculpe, nao consegui processar sua pergunta. Tente novamente.') + disclaimer;

    // Persist AI response
    await this.chatRepo.save(this.chatRepo.create({
      userId,
      sender: 'ai' as const,
      content: responseText,
      conversationId,
    }));

    return {
      response: responseText,
      usingAi: true,
      disclaimer: 'As informacoes fornecidas pela Elia sao de carater informativo e educacional. Nao constituem aconselhamento medico, diagnostico ou tratamento.',
    };
  }

  async getChatHistory(userId: string) {
    const conversationId = `elia-${userId}`;
    const messages = await this.chatRepo.find({
      where: { userId, conversationId },
      order: { createdAt: 'ASC' },
      take: 50,
    });
    return messages.map((m) => ({
      from: m.sender === 'user' ? 'user' : 'elia',
      text: m.content,
      createdAt: m.createdAt,
    }));
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
