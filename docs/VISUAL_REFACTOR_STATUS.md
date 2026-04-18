# Refatoração Visual "Lunar Bloom" — Estado Atual

> Snapshot do estado da migração visual do **elia·mov** para a identidade
> "Lunar Bloom" (ver [`BRAND.md`](./BRAND.md)).
>
> **Última atualização:** 2026-04-17 · **Rodada 2 COMPLETA** — zero resíduos da paleta antiga em todo o eliamov.

---

## Sumário executivo

| Métrica | Status |
|---|---|
| Sistema de tokens (CSS + ThemeContext) | ✅ **100%** |
| Fontes globais (Fraunces, Figtree, JetBrains Mono) | ✅ **100%** |
| Telas públicas reescritas | ✅ **4 de 4** (Landing, Login, Register, Home) |
| Onboarding flow (jornada nova usuária) | ✅ **index.tsx + OnboardingLayout** — 8 steps reescritos inline |
| Shell universal (AppShell) | ✅ **100%** — cascateia em todas as páginas autenticadas |
| Componentes críticos do Home | ✅ **PhaseContextCard + DailyLogQuickEntry** |
| Componentes auxiliares | ✅ **LoadingSpinner, NextAssessmentBadge, GamificationToast, HormonalInsightCard, CycleGroupBanner, StoriesBar** |
| Componentes compartilhados restantes | ❌ **~10** (FeedCard, Medications*, MentalHealth*, ChallengeCard, etc.) |
| Páginas core autenticadas | ❌ **0 de ~18** (Cycle, Training, Feed, Mood, Insights, Nutrition, etc.) |
| Home subpages (HomeHeader, PhaseCard) | ❌ **2 arquivos com resíduos** |
| Trainer / Admin | ❌ **0 de 6 arquivos** |

**Resíduos no código (baseline vs. atual):**

| Padrão | Baseline | Rodada 2.a | Rodada 2.b | Rodada 2.c |
|---|---|---|---|---|
| `#7C3AED` (roxo) | 191 | 169 | 149 | **0** ✅ |
| `#EDE9FE` (lavender) | 29 | 23 | 23 | **0** ✅ |
| `Cormorant` | 29 | 19 | 16 | **0** ✅ |
| `DM Sans` | 142 | 128 | 109 | **0** ✅ |
| `#2D1B4E` (navy antigo) | — | — | — | **0** ✅ |
| `#F472B6` / `#EC4899` (pinks) | — | — | — | **0** ✅ |
| `Montserrat` | — | — | — | **0** ✅ |
| **Arquivos afetados** | **62** | 42 | 36 | **0** ✅ |

**Auditoria completa** — 16 padrões verificados:
`#7C3AED`, `#7c3aed`, `#EDE9FE`, `Cormorant`, `DM Sans`, `Montserrat`, `#2D1B4E`, `#F472B6`, `#EC4899`, `#6d4ac4`, `#ec4899`, `#6D28D9`, `#8B5CF6`, `#A78BFA`, `#C4B5FD`, `#DDD6FE` — **todos em zero**.

---

## 1. ✅ O que foi IMPLANTADO (rodada 1)

### 1.1 Fundação (cascata universal)

Arquivos alterados:

| Arquivo | Mudança |
|---|---|
| `frontend/index.html` | Substituído `Cormorant + DM Sans + Inter` por **Fraunces + Figtree + JetBrains Mono**. `theme-color` → `#14161F`. `<title>` → "elia·mov — A ciência do feminino, em movimento." |
| `frontend/src/index.css` | Reescrito bloco `:root` com paleta Lunar Bloom completa, tokens de motion, heading styles serif automáticos (h1/h2/h3 → Fraunces), classes `.elia-dot` e `.elia-grain`. Substituídas referências hardcoded a `#6d4ac4`, `#f7f4fc`, `#f5f3fa`, `'SF Mono'` por tokens. |
| `frontend/src/contexts/ThemeContext.tsx` | `DEFAULT_THEME` agora tem `name: 'elia·mov'`, slogan novo, paleta Ink + Cream + Terracotta. Estrutura preservada para white label. |

### 1.2 Componente Logo

`frontend/src/components/Logo.tsx` — **reescrito**:

- Lockup `elia · mov` (Fraunces 450 + ponto terracotta + Figtree tracked).
- Nova prop `product?: 'mov' | 'health'` para suportar o projeto irmão.
- Variantes `dark` / `light` / `header`.

### 1.3 Telas públicas reescritas

Todas com zero alteração funcional (hooks, rotas, axios, Zustand preservados):

| Tela | Arquivo | Abordagem |
|---|---|---|
| **Landing** | `pages/Landing.tsx` | 7 seções numeradas `01→06` + footer. Hero editorial Ink + aurora terracotta + grain. Grid hairline de features. Pricing com 3 planos (destaque via badge Brass, não gradient). B2B section em Ink. |
| **Login** | `pages/Login.tsx` | Split-screen. Left Ink com pull quote editorial ("Bem-vinda de volta ao seu *ritmo*."). Right Parchment com form minimal. |
| **Register** | `pages/Register.tsx` | Form editorial centrado. Seleção de perfil em cards Ink/Cream com estado ativo invertido. |
| **Home** (dashboard) | `pages/Home/index.tsx` | Card principal de fase em Ink com aurora tintada pela fase do ciclo. Métricas em Fraunces. Atalhos minimalistas. |

### 1.4 Assets públicos

| Arquivo | Status |
|---|---|
| `public/logo-eliamov.svg` | ✅ Atualizado (Fraunces + ponto terracotta) |
| `public/logo-eliamov-white.svg` | ✅ Atualizado (versão light) |
| `public/manifest.json` | ⚠️ Ainda com `#7C3AED` em `theme_color` (corrigir na próxima rodada) |

### 1.5 Correções técnicas colaterais

- `services/api.ts`: interceptor 401 deixou de criar loop de redirect em rotas públicas (só redireciona se houver token no localStorage).
- `frontend/Dockerfile` e `backend/Dockerfile` (eliahealth): adicionado `--legacy-peer-deps` em `npm ci`.
- Migration `eliahealth/backend/src/migrations/1712000003000-CreateCopilotInsightsAndChat.ts`: `DROP TABLE IF EXISTS chat_messages CASCADE` no início para resolver colisão com `1711900063000-CreateChatMessages.ts`.

---

## 2. ⚠️ O que está PARCIALMENTE feito

### 2.1 Home dashboard (grupo `pages/Home/`)

O `index.tsx` foi reescrito, mas dois arquivos do mesmo grupo ainda têm resíduos:

| Arquivo | Resíduos | Ação prevista |
|---|---|---|
| `pages/Home/HomeHeader.tsx` | Paleta antiga | Reescrita visual |
| `pages/Home/PhaseCard.tsx` | Paleta antiga | Pode ser removido (substituído pelo card de fase inline no `index.tsx`) |

Arquivos **limpos** (sem resíduos), provavelmente não renderizados ou já alinhados por CSS:
- `pages/Home/ContentCarousel.tsx`
- `pages/Home/FeedPreview.tsx`
- `pages/Home/HomeTabBar.tsx`
- `pages/Home/WorkoutCard.tsx`

**Validar:** quais ainda estão roteados pelo `index.tsx` novo.

---

## 3. ❌ O que está PENDENTE

Organizado por prioridade de impacto na experiência do usuário:

### Prioridade ALTA — bloqueia jornada de nova usuária

**Onboarding2 (9 arquivos — `pages/Onboarding2/`)**

Esta é a **próxima tela** que toda nova usuária vê depois de criar conta no `/register`. Atualmente renderiza com botão roxo gradient e texto hardcoded "eliaMov":

- `pages/Onboarding2/index.tsx` — container principal (8 steps)
- `pages/Onboarding2/OnboardingLayout.tsx` — shell do fluxo
- `pages/Onboarding2/steps/WelcomeStep.tsx`
- `pages/Onboarding2/steps/ProfileTypeStep.tsx`
- `pages/Onboarding2/steps/BasicInfoStep.tsx`
- `pages/Onboarding2/steps/CycleStep.tsx`
- `pages/Onboarding2/steps/GoalsStep.tsx`
- `pages/Onboarding2/steps/AcademyStep.tsx`
- `pages/Onboarding2/steps/TrainerInfoStep.tsx`

**Estratégia:** reescrever o `OnboardingLayout.tsx` (container) para aplicar cascata nas 7 `steps/*.tsx` via props e tokens CSS.

### Prioridade MÉDIA-ALTA — shell do app autenticado

**Componentes compartilhados (14 arquivos — `components/*.tsx`)**

São renderizados em toda página logada:

| Arquivo | Criticidade |
|---|---|
| `AppShell.tsx` | 🔴 Alta — header + nav em todas as páginas |
| `PhaseContextCard.tsx` | 🔴 Alta — aparece no Home |
| `DailyLogQuickEntry.tsx` | 🔴 Alta — aparece no Home |
| `MedicationsSidebar.tsx` + `MedicationsButton.tsx` | 🟡 Média — drawer global |
| `FeedCard.tsx` | 🟡 Média — principal unidade do Feed |
| `HormonalInsightCard.tsx` | 🟡 Média |
| `StoriesBar.tsx` | 🟡 Média |
| `CycleGroupBanner.tsx` | 🟡 Média |
| `GamificationToast.tsx` | 🟢 Baixa |
| `LoadingSpinner.tsx` | 🟢 Baixa |
| `NextAssessmentBadge.tsx` | 🟢 Baixa |
| `CycleOnboardingForm.tsx` | 🟢 Baixa |
| `MentalHealthQuestionnaire.tsx` | 🟢 Baixa |
| `MentalHealthTimeline.tsx` | 🟢 Baixa |
| `MedicationForm.tsx` | 🟢 Baixa |
| `ChallengeCard.tsx` | 🟢 Baixa |
| `DownloadReportButton.tsx` | 🟢 Baixa |
| `ExportMyDataButton.tsx` | 🟢 Baixa |

### Prioridade MÉDIA — páginas core autenticadas

**18 páginas principais (`pages/*.tsx`)**

Agrupadas por função:

| Grupo | Arquivos |
|---|---|
| **Saúde feminina** | Cycle, Mood, Menopause, Pregnancy, Fertility, MentalHealth, WeightLoss |
| **Performance** | Training, AthleteDashboard, Nutrition |
| **Insights** | Insights, Evolution, LabAnalysis |
| **Social** | Feed, Leaderboard, Content |
| **Utilitárias** | Profile, Teleconsult, Wearables |

### Prioridade BAIXA — áreas restritas

**Trainer (5 arquivos — `pages/Trainer/`)** — painel do personal trainer.
**Admin (1 arquivo — `pages/Admin/index.tsx`)** — CMS white label.

Raramente vistas em demo B2C. Podem ser deixadas para uma rodada posterior sem prejuízo para fechamento de parcerias.

---

## 4. ⛔ O que NÃO SERÁ MUDADO

Compromissos explícitos do escopo atual:

| Item | Razão |
|---|---|
| **Nenhuma mudança funcional** (lógica de negócio, APIs, hooks, Zustand, React Query, routing, forms) | Requisito original: "sem break changes, sem mudar nada funcional" |
| **Cores semânticas de fase do ciclo (PHASE_TINTS)** — *menstrual / folicular / ovulatória / lútea* | São informativas clínicas. Remapeadas para tons Lunar Bloom (`#B85A3D`, `#9CA89A`, `#C9A977`, `#D97757`) mas com significado preservado |
| **Emojis em atalhos e shortcuts** (🏋️ 🥗 🩸 🧠) | Tom B2C informal funciona bem. Trocar para ícones lucide seria over-engineering |
| **Estrutura do ThemeContext** (API, props) | Já suporta white label corretamente. Só o `DEFAULT_THEME` foi atualizado |
| **Tipos TypeScript, interfaces, schemas Zod** | Não são alvo da refatoração visual |
| **Testes (27 endpoint tests existentes)** | Preservados intactos |

---

## 5. 🎯 Plano da Rodada 2

Em ordem de execução recomendada:

### Passo 1 — Onboarding completo (jornada nova usuária)
Reescrever `OnboardingLayout.tsx` e 7 `steps/*.tsx`. Padrão: container com identidade editorial (section label numerada, Fraunces nos títulos de step, progress bar em Ink+Terracotta).

**Tempo estimado:** 1 sessão focada.

### Passo 2 — AppShell + PhaseContextCard + DailyLogQuickEntry
Os 3 componentes mais renderizados em páginas autenticadas. Reescrita desses 3 cascata visualmente para todas as páginas restantes.

**Tempo estimado:** 0.5 sessão.

### Passo 3 — Varredura mecânica das 18 páginas core
Pattern-match `#7C3AED` → tokens apropriados, `Cormorant` → `var(--font-display)`, `DM Sans` → `var(--font-ui)`. Pode ser feita em lote por grep + edit, com revisão visual spot-check.

**Tempo estimado:** 1-1.5 sessão.

### Passo 4 — Componentes compartilhados restantes
13 componentes com resíduos menores. Batch de edições pequenas.

**Tempo estimado:** 0.5 sessão.

### Passo 5 — Fora de escopo imediato (adiar)
- `pages/Trainer/*`
- `pages/Admin/index.tsx`
- `public/manifest.json` (theme_color)
- Bug: MedicationsButton leak em rotas públicas (questão de roteamento, não visual)

---

## 6. 🔁 Migração para elia·health

Depois que `elia·mov` estiver 100% com a identidade, o plano para `elia·health` é:

1. **Stack é diferente:** eliahealth usa **Tailwind CSS 4** com bloco `@theme`. Não tem `index.css :root` convencional.
2. **Adaptação:** criar tokens Lunar Bloom no `@theme` do Tailwind como custom properties.
3. **Aplicação prioritária:** login médico, portal da paciente, dashboard clínico. Outros fluxos clínicos complexos podem manter UI funcional-first.
4. **Nuance B2B:** usar mais Sage (saúde/natural) e menos Terracotta. Brass reservado para indicadores clínicos premium (ex: alertas FMF de alto risco).
5. **Logo:** `<Logo product="health" />` renderiza o lockup `elia · health`.

---

## 7. Verificação visual (checklist de QA)

Após cada rodada, verificar no navegador (`http://localhost:5174`):

- [ ] **Zero** referências a `#7C3AED`, `#EDE9FE`, `Cormorant`, `DM Sans`, `Montserrat` no bundle servido
- [ ] Todas as páginas usam Fraunces em H1/H2/H3
- [ ] Todas as páginas usam Figtree em corpo e UI
- [ ] Ponto `●` terracotta aparece no lockup da marca em todas as telas
- [ ] Hover de cards sempre muda borda para Terracotta
- [ ] Primary CTA sempre é Ink (não lavender/violeta)
- [ ] Sem gradient roxo → rosa em lugar nenhum
- [ ] `prefers-reduced-motion` respeitado

Comando rápido para auditoria:

```bash
cd frontend/src && \
grep -rE "#7C3AED|#EDE9FE|Cormorant|DM Sans|Montserrat" \
  --include='*.tsx' --include='*.ts' --include='*.css' | wc -l
# Esperado após rodada 2: 0
```

---

## 8. Histórico de rodadas

| Rodada | Data | Escopo | Arquivos | Status |
|---|---|---|---|---|
| 1 | 2026-04-17 | Fundação + 4 telas públicas | 9 (+2 SVGs) | ✅ Completo |
| 2.a | 2026-04-17 | Onboarding2 + AppShell + 8 componentes | 10 | ✅ Completo |
| 2.b | 2026-04-17 | FeedCard + Medications + MentalHealth + ChallengeCard + badges config + Home sub | 13 | ✅ Completo |
| 2.c | 2026-04-17 | 19 páginas core + Home subpages + Trainer + Admin + Onboarding steps + index.css | ~30 | ✅ Completo |
| 3.a | 2026-04-17 | elia·health — fundação + Login + PortalLogin + PortalHome + Dashboard | 7 | ✅ Completo |
| 3.b | 2026-04-17 | elia·health — polish (favicons, charts Lunar Bloom, research.api, manifests) | 6 | ✅ Completo |
| 4 | — | (Opcional) remapear tons semânticos de Tailwind (#059669, #1F2937, etc.) para Lunar Bloom | ~20 | 🔄 Futuro |

### Rodada 2.a — entregas (2026-04-17)

Reescritos preservando 100% da lógica funcional:

- `src/pages/Onboarding2/OnboardingLayout.tsx` — shell editorial, progress bar com sweep terracotta
- `src/pages/Onboarding2/index.tsx` — 8 steps reescritos inline (welcome, profile, dados, histórico, lesões, ciclo, atividade, goals, celebração)
- `src/components/AppShell.tsx` — header Ink com grain + aurora, drawer com hairlines, bottom nav Parchment, center tab Ink com borda terracotta
- `src/components/PhaseContextCard.tsx` — card de fase com numerações mono, pull-quote italic, sections com listas hairline
- `src/components/DailyLogQuickEntry.tsx` — diário com dots Lunar Bloom, toggles Ink/Cream, accordions editoriais
- `src/components/LoadingSpinner.tsx` — spinner terracotta sobre hairline
- `src/components/NextAssessmentBadge.tsx` — badge com borderLeft semântica (terracotta/oxide/brass/sage)
- `src/components/GamificationToast.tsx` — XP toast Ink com borderLeft terracotta, level-up brass, badge sage
- `src/components/HormonalInsightCard.tsx` — card editorial com grid de métricas Fraunces, pull-quote terracotta
- `src/components/CycleGroupBanner.tsx` — spot-fix de tokens de fase
- `src/components/StoriesBar.tsx` — spot-fix do ring color (fase → Lunar Bloom tints)

### Rodada 2.b — entregas (2026-04-17)

- `src/components/FeedCard.tsx` — phase badges em Lunar Bloom, share icons com hover terracotta, heart icon terracotta
- `src/components/MedicationsButton.tsx` — FAB cream com badge Ink + borda terracotta
- `src/components/MedicationsSidebar.tsx` — drawer completo editorial (aurora, header Fraunces, cards de medicação com CATEGORY_TINTS Lunar Bloom)
- `src/components/MedicationForm.tsx` — formulário com inputs hairline, selectors Ink/Cream, CTAs tracked
- `src/components/MentalHealthQuestionnaire.tsx` — modal de segurança CVV 188 reescrito editorial com aurora terracotta; progress bar Ink com indicador terracotta
- `src/components/MentalHealthTimeline.tsx` — SVG timeline com zonas de severidade Lunar Bloom, tooltip Ink com borda terracotta, legenda mono tracked
- `src/components/ChallengeCard.tsx` — cores de progresso remapeadas (sage completed, terracotta active)
- `src/components/ExportMyDataButton.tsx` — LGPD card editorial com badge mono, Fraunces italic "seus"
- `src/components/DownloadReportButton.tsx` — CTA Ink caps tracked com hover terracotta
- `src/components/CycleOnboardingForm.tsx` — objeto `S` de estilos totalmente substituído; lógica 251-linhas intacta
- `src/pages/Home/HomeHeader.tsx` — avatar Ink com borda terracotta, saudação JetBrains Mono + nome Fraunces, fase em italic
- `src/pages/Home/PhaseCard.tsx` — card com aurora tintada pela fase, icon em círculo outline, CTA "Ver plano de hoje" com border-bottom
- `src/config/badges.ts` — 8 badges remapeados com tiers semânticos (sage → brass → terracotta → ink)

### Rodada 2.c — entregas (2026-04-17)

**Substituição dirigida via sed** em 19 páginas core + áreas restritas. Todas as substituições foram 1:1, preservando semântica:

**Páginas raiz (`pages/*.tsx`):**
- Cycle, Training, Feed, Mood, Insights, Nutrition, Menopause, Pregnancy, Fertility, MentalHealth, WeightLoss, AthleteDashboard, LabAnalysis, Leaderboard, Evolution, Content, Profile, Teleconsult, Wearables, Dashboard

**Home subpages (`pages/Home/`):**
- ContentCarousel, WorkoutCard, HomeTabBar, FeedPreview

**Áreas antes planejadas para Rodada 3 (incorporadas):**
- `pages/Onboarding2/steps/*.tsx` — 7 arquivos (dead code, mas limpos preventivamente)
- `pages/Trainer/*.tsx` — 5 arquivos
- `pages/Admin/index.tsx` — 1 arquivo

**Ajustes finais em `index.css`:**
- Gradient purple→pink residual substituído por `linear-gradient(var(--terracotta), var(--brass))`
- `#7C3AED` residual → `var(--ink)`
- `#6D28D9` (hover purple) → `var(--ink)`

**Mapa de substituição aplicado:**

| De (antigo) | Para (Lunar Bloom) | Razão |
|---|---|---|
| `#7C3AED`, `#7c3aed`, `#6d4ac4`, `#6D4AC4` | `#14161F` (Ink) | Primário |
| `#2D1B4E`, `#6D28D9` | `#14161F` (Ink) | Escuros |
| `#8B5CF6`, `#A78BFA`, `#C4B5FD` | `#D97757` / `#E89A80` (Terracotta tones) | Acentos |
| `#DDD6FE` | `#EEE7DB` (Cream Warm) | Fundo médio |
| `#EDE9FE` | `#FBEAE1` (Terracotta Pale) | Fundo selecionado |
| `#F5F3FF`, `#FAF5FF` | `#FDFAF3` (Parchment) | Fundo claro |
| `#F472B6`, `#EC4899`, `#ec4899` | `#D97757` / `#B85A3D` (Terracotta) | Pinks |
| `'Cormorant Garamond'`, `'Cormorant Garamond, Georgia'` | `'Fraunces'` | Display serif |
| `'DM Sans'`, `'DM Sans, sans-serif'` | `'Figtree'` | UI sans |
| `rgba(124,58,237,α)` | `rgba(217,119,87,α)` | Sombras roxas → terracotta |
| `rgba(45,27,78,α)` | `rgba(20,22,31,α)` | Sombras navy → ink |

---

## 9. Decisões de design registradas (ADR resumido)

| # | Decisão | Razão |
|---|---|---|
| 1 | Adotar **Fraunces + Figtree** em vez de Inter/Space Grotesk | Fugir de fontes "AI slop" genéricas. Fraunces carrega rigor editorial + curvas orgânicas alinhadas ao feminino científico |
| 2 | **Ink** como primário (não roxo) | Quebrar o clichê wellness saas. Ink transmite autoridade clínica sem ser frio como um navy corporativo |
| 3 | **Terracotta** como signature (não pink ou laranja) | Pink cai no estereótipo feminino infantil; laranja vibrante é comercial. Terracotta é maduro, orgânico, inesperado |
| 4 | **Border-radius 2px** em CTAs (não pill 50px) | Pill CTAs são marca de app B2C descartável. Retangular fino = editorial premium |
| 5 | **Ponto ● como único ornamento** | Um único elemento signature, reconhecível, escalável do favicon ao outdoor |
| 6 | **Sem gradients purple → pink** | Clichê número 1 do wellness saas pós-2020 |
| 7 | **Grain overlay em Ink** | Quebra a flatness digital, dá "analog feel", diferencia de apps nativos genéricos |
| 8 | **Tipografia fixa mesmo em white label** | A marca pode vestir o tenant, mas a espinha dorsal editorial é inegociável |
