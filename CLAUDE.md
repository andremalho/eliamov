# elia·mov

Plataforma B2C de saúde feminina com treino adaptativo ao ciclo menstrual. Parte
da suíte **elia** (veja o projeto irmão `elia·health` em
`../eliahealth/`).

## Stack

- **Backend:** NestJS 10 + TypeORM + PostgreSQL 15 · porta `3001`
- **Frontend:** React 18 + Vite 5 · porta `5174`
- **DB externa:** porta `5433` (user `eliamov_user`, db `eliamov_db`)
- **IA:** Anthropic Claude (Coach Elia) — opcional, com fallback "modo offline"
- **Storage:** Cloudflare R2
- **Realtime:** Socket.io

## Comandos

```bash
# Docker (recomendado)
docker compose up -d
docker compose logs -f backend
docker compose logs -f frontend
docker compose down          # sem perder dados
docker compose down -v       # reset completo

# Local
cd backend && npm run start:dev    # :3001
cd frontend && npm run dev         # :5174
```

## Estrutura

- `backend/src/modules/` — **53 módulos NestJS**
- `frontend/src/pages/` — **42+ páginas** (Landing, Login, Register, Home reescritos com Lunar Bloom)
- `frontend/src/components/` — **40+ componentes** (maioria ainda com paleta antiga — ver `docs/VISUAL_REFACTOR_STATUS.md`)
- `frontend/src/contexts/ThemeContext.tsx` — white label dinâmico
- `frontend/src/services/` — **44 clientes API** (axios)

## Variáveis de ambiente

Backend (`backend/.env`):

```
DATABASE_HOST=postgres
DATABASE_PORT=5432
DATABASE_NAME=eliamov_db
DATABASE_USER=eliamov_user
DATABASE_PASS=eliamov_pass
JWT_SECRET=<dev>
ANTHROPIC_API_KEY=<opcional — sem chave, Coach Elia roda em modo offline>
ELIAHEALTH_API_URL=http://host.docker.internal:3000
STORY_TTL_HOURS=24
```

Frontend (`frontend/.env`):

```
VITE_API_BASE_URL=http://localhost:3001
```

## Identidade visual

**Lunar Bloom** (sistema compartilhado com `elia·health`).
**Leitura obrigatória antes de tocar em qualquer arquivo `.tsx` ou `.css`:**
→ [`docs/BRAND.md`](./docs/BRAND.md)

**Regras inegociáveis:**

- Fonte de **display**: `Fraunces` (variable serif). **Nunca** use Inter, Cormorant Garamond, Montserrat, Space Grotesk, Poppins.
- Fonte de **UI**: `Figtree` (variable sans). **Nunca** use Inter, DM Sans.
- Primário = **Ink** (`#14161F`). **Nunca** roxo/violeta (`#7C3AED`, `#6d4ac4`, `#2D1B4E` e variações).
- Acento signature = **Terracotta** (`#D97757`). O ponto `●` entre `elia` e o sub-produto **sempre** em Terracotta.
- **Sem gradients roxo→rosa**. Use `--shadow-accent` ou `linear-gradient(90deg, var(--terracotta), var(--brass))` quando precisar de gradiente.
- Corner radius: 2-12-20-28px. **Nunca** pill (`border-radius: 50`) em CTAs.
- **Zero mudança funcional** ao refatorar visual — preservar hooks, rotas, axios, Zustand.

Tokens disponíveis em `frontend/src/index.css` bloco `:root`:
`--ink`, `--cream`, `--parchment`, `--terracotta`, `--sage`, `--brass`, `--oxide`, `--font-display`, `--font-ui`, `--font-mono`, `--ease-out-expo`, `--shadow-accent`, etc.

## Status da migração visual

Rodada 1 (✅ concluída 2026-04-17): Landing, Login, Register, Home + tokens + fontes + SVGs.
Rodada 2 (🎯 pendente): Onboarding2 + AppShell + 18 páginas core + 13 componentes.
Rodada 3 (📅 futura): Trainer/Admin + cascata para `elia·health`.

Detalhe completo em [`docs/VISUAL_REFACTOR_STATUS.md`](./docs/VISUAL_REFACTOR_STATUS.md).

## Autenticação e guards

- `PrivateRoute` — exige JWT válido
- `FemaleRoute` — exige ciclo rastreado (`menstruates=true`)
- `RoleRoute` — papel específico (admin, trainer)
- `IncompleteRoute` — logada mas sem onboarding
- Rate limit global: 300 req/min (NestJS Throttler)

## Credenciais de dev

Usuário criado manualmente:

```
demo@eliamov.com / Senha123!
```

Perfil inicial: `female_user` · precisa completar `/onboarding-flow` para chegar à Home.

## Integração com elia·health

Módulo `backend/src/modules/eliahealth-integration/` sincroniza ciclo,
medicações, exames e sintomas com o prontuário do projeto irmão via
`ELIAHEALTH_API_URL`. Depende de LGPD consent do usuário (opt-in).

## Correções técnicas já aplicadas (não reverter)

- `services/api.ts`: interceptor 401 só redireciona se houver token no `localStorage` — evita loop de redirect em rotas públicas.
- Dockerfiles: `npm ci --legacy-peer-deps` (conflict entre `vite@8` e `vite-plugin-pwa@1.2` — falso positivo).

## Não faça

- ❌ Mudar lógica de negócio durante refatoração visual
- ❌ Adicionar `Inter`, `DM Sans`, `Cormorant` ou qualquer fonte fora do padrão `Fraunces / Figtree / JetBrains Mono`
- ❌ Usar `#7C3AED` ou derivados roxos
- ❌ Criar arquivos `.md` de documentação sem pedido explícito (este arquivo e `docs/*.md` foram pedidos)
- ❌ Tocar no ThemeContext sem ler `docs/BRAND.md` seção 8
- ❌ Commitar `.env` com chaves reais
