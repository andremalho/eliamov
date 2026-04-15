# Prompt para Claude: Memorando Executivo do EliaMov

Cole o conteudo abaixo diretamente no Claude para gerar o memorando.

---

Preciso que voce gere um memorando executivo completo do projeto EliaMov.

## Sobre o projeto

EliaMov e uma plataforma de saude feminina com treino adaptativo ao ciclo menstrual, baseada em evidencias cientificas. O projeto tem:

- **Backend**: NestJS + TypeORM + PostgreSQL (53 modulos registrados)
- **Frontend**: React + Vite (42 paginas, 40+ componentes)
- **IA**: Integracao com Claude API (coach Elia) com historico persistente

## Modulos implementados

### Saude e Ciclo
- **Ciclo menstrual**: tracking de fases, predicao de proxima menstruacao, onboarding com opcao "nao menstruo" (DIU, pilula continua, cirurgia)
- **Analise hormonal**: scores AUB e perimenopausa, regressao linear temporal, classificacao de risco
- **Diario de sintomas**: 21 campos (energia, humor, sono, 6 sintomas fisicos, 3 psicologicos, 3 flags booleanas) com auto-deteccao de fase
- **Saude mental**: PHQ-9, GAD-7, PSS-10 com correlacao por fase do ciclo, deteccao de TDPM, tendencia longitudinal, alerta de ideacao suicida (CVV 188), aderencia
- **Medicacoes**: CRUD com 7 categorias, drawer lateral, integracao com onboarding, correlacao com sintomas

### Treino e Nutricao
- **Treino adaptativo**: 12 treinos base por fase do ciclo (McNulty 2020, Schlie 2025), timer funcional com cronometro/descanso/series, registro de carga (WorkoutLog), RPE, descricoes detalhadas dos exercicios
- **Nutricao**: CRUD refeicoes, metas (Mifflin-St Jeor), peso, composicao corporal, 8 receitas seed por fase do ciclo
- **Modulo atleta**: readiness score, ACWR (razao carga aguda:cronica), RPE diario, alertas de risco

### Social e Engajamento
- **Feed Instagram-style**: posts, likes, reacoes, comentarios, stories, compartilhamento
- **Gamificacao**: XP (+50 treino, +20 post), badges (8 tipos), level, streak, leaderboard global
- **Desafios**: individuais e cooperativos (team mode), progresso automatico

### Inteligencia e Correlacao
- **Motor de correlacao**: cruza ciclo + medicacoes + saude mental + diario de sintomas para gerar recomendacoes contextuais de treino, nutricao, saude mental e dicas de bem-estar
- **IA Coach Elia**: chat com Claude API, historico persistente, contexto de ciclo/humor/medicacoes no system prompt, disclaimer medico automatico
- **Insights IA**: analise personalizada com perfil clinico completo

### Infraestrutura
- **Admin CMS**: 7 abas (dashboard, conteudo, treinos, receitas, pesquisa, logs de auditoria, config)
- **White label**: CSS variables dinamicas por tenant, branding configuravel
- **PWA**: manifest, service worker, meta tags SEO
- **Exportacao**: CSV (admin), PDF para consulta medica (PDFKit), JSON LGPD (Art. 18)
- **Teleconsulta**: agendamento por especialidade, video room, 3 abas
- **Wearables**: integracao com 7 providers (Garmin, Strava, Polar, Oura, Fitbit, WHOOP, Apple Health)
- **Seguranca**: JWT global, guards por role, @FemaleZoneOnly(), audit log com interceptor global, rate limiting

### Qualidade de codigo
- 0 erros de compilacao TypeScript (backend e frontend)
- Tipos compartilhados (CyclePhaseFilter, badge config, initials utility)
- 3 commits de code review (N+1 fix, deduplicacao, type safety)
- Loading skeletons com shimmer effect
- Onboarding otimizado (4 steps minimos, opcao pular)

## Dashboard Home inteligente
O dashboard agrega todos os modulos em uma tela central:
- Card de fase do ciclo com gradiente dinamico e streak
- Grid de metricas: PHQ-9 com tendencia, medicacoes ativas, risco AUB
- Alerta contextual de saude mental baseado na fase
- Diario de sintomas inline
- Recomendacoes da fase (treino, nutricao, saude mental, dicas)
- Atalhos rapidos para modulos

## Referencias cientificas
- McNulty et al. 2020 - Sports Med (meta-analise ciclo e performance)
- Schlie et al. 2025 - Systematic review (ciclo e atletas)
- Wen et al. 2025 - Front Endocrinol (mecanismos hormonais)
- Kroenke 2001 - PHQ-9, Spitzer 2006 - GAD-7
- Gabbett 2016 - ACWR e prevencao de lesoes
- Mifflin-St Jeor 1990 - calculo metabolismo basal
- LGPD - Lei 13.709/2018

## O que preciso

Gere um **memorando executivo** em portugues brasileiro, formatado em Markdown, com as seguintes secoes:

1. **Sumario Executivo** (3-4 paragrafos)
2. **Visao Geral da Plataforma** (arquitetura, stack, numeros)
3. **Modulos e Funcionalidades** (tabela com modulo, descricao, status)
4. **Diferenciais Competitivos** (o que diferencia o EliaMov no mercado)
5. **Base Cientifica** (referencias usadas)
6. **Arquitetura Tecnica** (backend, frontend, IA, seguranca)
7. **Compliance e Privacidade** (LGPD, disclaimers, CVV)
8. **Metricas do Projeto** (commits, arquivos, modulos, linhas de codigo)
9. **Roadmap Futuro** (o que falta para producao)
10. **Conclusao**

Tom: profissional, tecnico mas acessivel. Destinado a investidores, parceiros clinicos e equipe tecnica.
