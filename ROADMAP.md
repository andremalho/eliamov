# eliaMov - Roteiro de Execucao (Revisado)

## Identidade Visual
- Fonte: **Inter ExtraBold** (familia elia)
- Logo: **eliaMov** (minusculas, "M" maiusculo)
- Pingo do "i": cor diferenciada (assinatura visual)
- Slogan: "Movimento inteligente. Vida ativa."
- Preparado para **white label** (academias trocam logo/cores/slogan)

---

## Sprint 1 - FUNDACAO VISUAL + ADMIN (Dia 1-2)

### 1.1 Logo e tema definitivos
- [ ] Fonte Inter ExtraBold no componente Logo
- [ ] Pingo do "i" em cor accent (configuravel)
- [ ] ThemeProvider para white label (CSS variables por tenant)
- [ ] Aplicar em todas as paginas
- [ ] Favicon + meta tags

### 1.2 Admin CMS completo
- [ ] Dashboard admin com metricas reais (usuarios, treinos, engagement)
- [ ] CRUD artigos (titulo, corpo rich text, categoria, fase do ciclo, imagem, refs)
- [ ] CRUD videos (URL, thumbnail, duracao, categoria, fase)
- [ ] CRUD treinos (nome, exercicios, fase do ciclo, nivel, duracao)
- [ ] CRUD receitas (ingredientes, macros, fase, restricoes)
- [ ] Pesquisa global (usuarios, conteudo, treinos, assessments)
- [ ] Exportacao CSV de dados
- [ ] Logs de atividade

### 1.3 Seed de conteudo com referencias
- [ ] 20 artigos (ciclo+treino, nutricao hormonal, saude feminina)
- [ ] 12 treinos base (3 por fase do ciclo, com protocolo McNulty/Schlie)
- [ ] 8 receitas (2 por fase, com macros adaptados)
- [ ] Dicas diarias rotativas
- [ ] Todas com referencias bibliograficas (SCIENTIFIC_REFERENCES.md)

---

## Sprint 2 - TREINO ADAPTATIVO + IA (Dia 3-4)

### 2.1 Treino adaptativo por ciclo (CORE DIFERENCIAL)
- [ ] Engine que detecta fase atual → seleciona treino
- [ ] Protocolo por fase baseado na literatura:
  - Menstrual: leve (yoga, caminhada) - RPE 3-5
  - Folicular: progressivo (forca, HIIT) - RPE 7-9
  - Ovulatoria: performance maxima + alerta ligamentar - RPE 8-10
  - Lutea: moderado (pilates, mobilidade) - RPE 4-7
- [ ] Card "Treino de hoje" na Home com fase + recomendacao
- [ ] Biblioteca de exercicios com descricao/video
- [ ] Timer de treino (series, reps, descanso)
- [ ] Registro de carga e progresso
- [ ] Refs: McNulty 2020, Schlie 2025, Wen 2025, Blagrove 2022

### 2.2 IA Coach "Elia" (Claude API)
- [ ] Chat conversacional integrado
- [ ] Contexto completo: ciclo, treinos, nutricao, humor, wearables
- [ ] Respostas sobre treino, alimentacao, sintomas
- [ ] Preparado para substituir por IA eliaHealth
- [ ] Disclaimer medico em todas as respostas
- [ ] Historico de conversas

### 2.3 Referencias cientificas em todos os modulos
- [ ] Secao "Base cientifica" acessivel em cada funcionalidade
- [ ] Ciclo: ACOG, FEBRASGO, McNulty 2020
- [ ] Treino: McNulty 2020, Schlie 2025, Wen 2025, ACSM
- [ ] Nutricao: ISSN 2017, Guia Alimentar Brasileiro
- [ ] Emagrecimento: DPP 2002, Mifflin 1990 (ja implementado)
- [ ] Saude mental: PHQ-9 (Kroenke 2001), GAD-7 (Spitzer 2006)

---

## Sprint 3 - EXPERIENCIA SOCIAL (Dia 5-6)

### 3.1 Feed tipo Instagram
- [ ] Scroll vertical com cards de foto/video grandes
- [ ] Double-tap para curtir com animacao de coracao
- [ ] Pull-to-refresh
- [ ] Camera/galeria nativa para criar posts
- [ ] Compartilhamento (Instagram, X, WhatsApp, Facebook, Snapchat)
- [ ] Stories no topo (ja temos backend)

### 3.2 Gamificacao
- [ ] Streak diario (icone de chama no header)
- [ ] XP por: treino (+50), check-in ciclo (+10), post (+20), comentario (+5)
- [ ] Nivel da usuaria (1-50) com badges
- [ ] Ranking semanal da academia
- [ ] Desafios cooperativos (meta coletiva)

### 3.3 Navegacao simplificada
- [ ] 4 tabs: Feed, Treino, Ciclo, Perfil
- [ ] Drawer com menu completo
- [ ] Onboarding mais curto (4 steps essenciais, resto progressivo)

---

## Sprint 4 - INTEGRACAO E MODULO ATLETA (Dia 7-8)

### 4.1 Analise de exames laboratoriais
- [ ] Upload de exames (PDF/imagem)
- [ ] IA analisa valores e sinaliza alteracoes
- [ ] Marcadores relevantes: hemograma, ferritina, TSH, T4L, glicemia,
      insulina, colesterol, cortisol, vitamina D, B12
- [ ] Historico com evolucao (graficos)
- [ ] Preparado para integracao eliaHealth

### 4.2 Modulo Atleta de Alto Rendimento (OPCIONAL na venda)
- [ ] Dashboard de performance com metricas avancadas
- [ ] Monitoramento:
  - HRV diario (via wearable)
  - Temperatura basal (Oura/WHOOP)
  - RPE diario (Rating of Perceived Exertion)
  - POMS simplificado (fadiga, vigor, humor)
  - Carga de treino (sRPE x duracao)
  - Racio agudo:cronico de carga (ACWR)
- [ ] Periodizacao por ciclo validada hormonalmente (6 fases)
  - Refs: estudo 18 atletas eumenorreicas, Schlie 2025
- [ ] Performance markers: 1RM, VO2max estimado, tempos
- [ ] Lab markers: ferritina, CK, cortisol, T/C ratio
- [ ] Composicao corporal periodica (DXA/bioimpedancia)
- [ ] Relatorios para comissao tecnica (exportacao PDF)
- [ ] Alerta de risco ligamentar na ovulacao
- [ ] Integracao com nutricionista esportivo

### 4.3 White label
- [ ] ThemeProvider com CSS variables por tenant
- [ ] Endpoint admin para configurar: logo, cores, slogan, dominio
- [ ] Componente Logo dinamico (carrega do tenant)
- [ ] Tela de config no admin da academia

### 4.4 Polish
- [ ] Loading skeletons (shimmer effect)
- [ ] Micro-animacoes em botoes, transicoes, likes
- [ ] Lazy loading de paginas (code splitting)
- [ ] Meta tags SEO
- [ ] PWA (manifest + service worker)

---

## Backlog (pos-sprint)
- [ ] Modo gravidez (semana a semana)
- [ ] Modo pos-parto (assoalho pelvico, diastase)
- [ ] Modulo menopausa (sintomas, MRS score)
- [ ] Teleconsulta com video integrado
- [ ] Integracao completa eliaHealth (prontuario)
- [ ] Planejamento familiar (BBT + LH)
- [ ] Versao espanhol (LATAM)
- [ ] App nativo (React Native / Expo)
- [ ] Integracao Gympass/Wellhub
- [ ] Samsung Health integration

---

## Literatura base (docs/SCIENTIFIC_REFERENCES.md)
- McNulty et al. 2020 - Sports Med (meta-analise MC e performance)
- Schlie et al. 2025 - Systematic review (MC e atletas competitivas)
- Wen et al. 2025 - Front Endocrinol (mecanismos hormonais)
- Blagrove et al. 2022 - Sports Med (periodizacao resistida)
- Estudo 18 atletas - 6 fases validadas (forca + POMS)
- Psychophysiological responses to HIIT across MC - MSSE 2024
- Exercise performance impaired mid-luteal phase
- Mifflin 1990, ISSN 2017, DPP 2002, DASH 1997, FIGO 2023
- PHQ-9 (Kroenke 2001), GAD-7 (Spitzer 2006)
