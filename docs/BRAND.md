# elia — Brand System ("Lunar Bloom")

> Documento canônico da identidade visual compartilhada entre **elia·mov** (B2C)
> e **elia·health** (B2B). Tudo o que for criado nos dois projetos **deve**
> obedecer este sistema. Qualquer desvio exige justificativa explícita.

---

## 1. Marca

### 1.1 Identidade

| Atributo | Definição |
|---|---|
| **Nome da holding** | `elia` (sempre em minúsculas, sem acento) |
| **Significado** | Raiz hebraica "o Senhor é Deus"; raiz grega ligada ao sol (Hélios). Luminoso, feminino, atemporal. |
| **Produtos** | `elia·mov` (movimento, B2C) / `elia·health` (clínico, B2B) |
| **Elemento signature** | Ponto **●** em Terracotta entre o nome-mãe e o sub-produto — representa *o agora*, o presente do ciclo, o ritmo. É o único ornamento que a marca carrega. |

### 1.2 Posicionamento

**Holding narrative (compartilhada):**
> elia — *o cuidado que reconhece o feminino como ciência.*
>
> Um ecossistema onde rigor clínico e intimidade cotidiana se encontram. Da consulta à rotina, do prontuário ao movimento — uma única inteligência, dois gestos.

**Por produto:**

| Produto | Território mental | Tagline |
|---|---|---|
| `elia·mov` | *"Meu corpo em ritmo"* — movimento inteligente | **A ciência do feminino, em movimento.** |
| `elia·health` | *"Cuidado íntegro"* — rigor clínico especializado | **Saúde íntegra da mulher, em cada consulta.** *(provisório — confirmar com stakeholders)* |

### 1.3 Cliente

| Produto | Cliente decisor | Cliente final |
|---|---|---|
| `elia·mov` | Mulher 25-50 a/ ou gestora de academia | Usuária do app |
| `elia·health` | Ginecologista-obstetra, gestor de clínica, maternidade | Médico + paciente via portal |

### 1.4 Tensão que resolvemos

- `elia·mov`: apps genéricos de fitness ignoram o ciclo hormonal; dados fragmentados em múltiplas plataformas.
- `elia·health`: EHRs genéricos não compreendem protocolos de ginecologia/obstetrícia (FMF, ACOG, FEBRASGO, PALM-COEIN).

---

## 2. Paleta "Lunar Bloom"

A paleta **rejeita o clichê "wellness purple"**. Remete a editorial médico + luxury wellness (Aesop, Byredo, Linear, NYT Styles).

| Token | Hex | CSS var | Uso |
|---|---|---|---|
| **Ink** | `#14161F` | `--ink` | Superfície primária dark, tipografia principal, CTAs sólidos |
| **Ink 2** | `#20232F` | `--ink-2` | Segunda camada de profundidade |
| **Ink Soft** | `#2A2C38` | `--ink-soft` | Texto secundário em superfícies claras |
| **Cream** | `#F5EFE6` | `--cream` | Fundo principal (substitui o branco clínico) — off-white quente |
| **Cream Warm** | `#EEE7DB` | `--cream-warm` | Sections alternadas no fundo light |
| **Parchment** | `#FDFAF3` | `--parchment` | Cards, elevações, formulários |
| **Terracotta** | `#D97757` | `--terracotta` | ★ **Signature.** Ciclo, paixão, energia cíclica. |
| **Terracotta Soft** | `#E89A80` | `--terracotta-soft` | Variação suave para italic/highlights sobre dark |
| **Terracotta Deep** | `#B85A3D` | `--terracotta-deep` | Italic de ênfase sobre light, CTAs terciários |
| **Terracotta Pale** | `#FBEAE1` | `--terracotta-pale` | Fills extremamente sutis, badges |
| **Sage** | `#9CA89A` | `--sage` | Serenidade, saúde natural, grounding |
| **Sage Soft** | `#C5CDC1` | `--sage-soft` | Informativos calmos |
| **Sage Pale** | `#E8ECE6` | `--sage-pale` | Fills muito suaves |
| **Brass** | `#C9A977` | `--brass` | Premium moments (planos, medalhas, insights VIP) |
| **Brass Soft** | `#E3CFA5` | `--brass-soft` | Highlights secundários premium |
| **Oxide** | `#8B3A2F` | `--oxide` | Alertas clínicos sérios (substitui vermelho comum) |

### 2.1 Hierarquia de uso

```
Dominância   Ink + Cream              70%
Signature    Terracotta                15%
Suporte      Sage                      10%
Premium      Brass                      5%
Alerta       Oxide                   pontual
```

### 2.2 Hairlines e superfícies

- Hairline padrão: `1px solid rgba(20, 22, 31, 0.08)`
- Hairline forte: `1px solid rgba(20, 22, 31, 0.18)`
- Hairline sobre dark: `1px solid rgba(245, 239, 230, 0.14)`
- Sombras: `--shadow-sm`, `--shadow-md`, `--shadow-lg`, `--shadow-accent` (declaradas em `eliamov/frontend/src/index.css`)

---

## 3. Tipografia

| Papel | Família | Fonte | Razão |
|---|---|---|---|
| **Display** | `--font-display` | **Fraunces** (variable serif) | Rigor editorial + curvas orgânicas. Italic opsz com detalhes caligráficos para momentos de ênfase. |
| **UI** | `--font-ui` | **Figtree** (variable sans) | Humanista, redondas nos `o/a/e`, proporções não-robóticas. Substitui Inter. |
| **Mono** | `--font-mono` | **JetBrains Mono** | Labels técnicos, numeração de seção, dados clínicos no `elia·health`. |

### 3.1 Regras

- **H1, H2, H3 e `.h-display` usam Fraunces automaticamente** (declarado em `index.css`).
- **H4, H5, H6 e corpo usam Figtree** (default no `:root`).
- `font-variation-settings: 'opsz' 96, 'SOFT' 40` em display grande (hero). Para heroes gigantes use `opsz 144, SOFT 60`.
- Italic em Fraunces **só para momentos de ênfase** (1 palavra por parágrafo, nunca mais) — tipicamente palavras emocionais ("ritmo", "sua", "agora").
- Letter-spacing de display: `-0.025em` a `-0.04em`.
- Letter-spacing de UI caps tracked: `0.08em` a `0.32em`.

### 3.2 Escala tipográfica

```
Hero display      clamp(3.2rem, 10vw, 8.5rem)   Fraunces 300-400
H1 de seção       clamp(2.2rem, 5vw, 3.6rem)    Fraunces 400
H2                clamp(2rem, 4.5vw, 3.2rem)    Fraunces 400
H3 / Card title   22-32px                        Fraunces 450-500
UI body           14-17px                        Figtree 400
UI small          12-13px                        Figtree 400-500
Section label     11px tracked 0.3em             Figtree 500 UPPERCASE
Mono label        10-11px tracked 0.2em          JetBrains Mono
```

---

## 4. Lockup da marca

### 4.1 Estrutura canônica

```
elia  ●  mov              elia  ●  health
```

- `elia` em **Fraunces 450**, `letter-spacing: -0.035em`, `font-variation-settings: 'opsz' 96, 'SOFT' 40`.
- Ponto `●` em **Terracotta** (`#D97757`), diâmetro = 14% do tamanho do texto, deslocado verticalmente -11% para alinhar à baseline central.
- Sub-produto (`mov`/`health`) em **Figtree 500**, 42% do tamanho, `letter-spacing: 0.14-0.16em`, lowercase.
- Implementado em: `frontend/src/components/Logo.tsx` (eliamov). `elia·health` ainda aguarda implementação (ver `VISUAL_REFACTOR_STATUS.md`).

### 4.2 Variantes

| Variante | Uso |
|---|---|
| `dark` | Sobre fundo claro (Cream, Parchment). `elia` em Ink. |
| `light` | Sobre fundo escuro (Ink). `elia` em Cream. |
| `header` | Header de navegação (idem `dark` com ajuste de peso). |

### 4.3 Espaços mínimos

- Área livre ao redor = altura da letra `a` em `elia`.
- Mínimo renderizável em tela = 24px de altura da caixa "elia" (abaixo disso, o ponto vira pixel).

### 4.4 Não faça

- ❌ `eliaMov` (CamelCase antigo — **proibido**).
- ❌ `ELIA MOV` em caps (apenas o sub-produto em lowercase tracked).
- ❌ Ponto colorido em qualquer outra cor que não Terracotta.
- ❌ Sublinhar ou colocar caixa ao redor do lockup.

---

## 5. Motion

### 5.1 Princípios

1. **Subtle fade + translate-Y de 12-18px** em cascata de 150ms.
2. **Easing:** `cubic-bezier(0.16, 1, 0.3, 1)` (easeOutExpo) — saída confiante, chegada suave.
3. **Zero bounce, zero spring, zero overshoot.**
4. **Respeitar `prefers-reduced-motion: reduce`** (toda animação deve ter fallback).

### 5.2 Tokens

```css
--ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
--ease-in-out-soft: cubic-bezier(0.65, 0, 0.35, 1);
```

### 5.3 Hovers

- Cards: `transform: translateY(-2px)` + troca de `border-color` para Terracotta.
- CTAs primários (Ink): `background` → Terracotta na hover.
- CTAs invertidos (Cream): `background` → Terracotta com `color: Ink`.
- Links: `border-bottom` Terracotta com `text-decoration-color`.

---

## 6. Texturas & atmosfera

### 6.1 Grain overlay

SVG noise com `opacity: 0.05-0.06`, `mix-blend-mode: overlay`. Aplicado em **todas as superfícies Ink** para quebrar a flatness digital.

Utilitária disponível: classe `.elia-grain` (declarada em `index.css`).

### 6.2 Aurora meshes

Sobre fundos Ink, usar `radial-gradient(closest-side, [accent]33, transparent 70%)` com `filter: blur(40-80px)`. Cores de aurora:
- Terracotta @ 22-33% opacity → calor, energia
- Brass @ 16-20% opacity → premium
- Sage @ 14-20% opacity → calma

### 6.3 Numeração editorial

Seções numeradas `/ 01`, `/ 02` em **JetBrains Mono**, `letter-spacing: 0.14-0.3em`, cor Terracotta ou Brass. Padrão em landing, cards de feature, step-by-step.

---

## 7. Tokens CSS (mapa completo)

Localização: `frontend/src/index.css` (bloco `:root`).

```css
/* Raw palette */
--ink / --ink-2 / --ink-soft
--cream / --cream-warm / --parchment
--terracotta / --terracotta-soft / --terracotta-deep / --terracotta-pale
--sage / --sage-soft / --sage-pale
--brass / --brass-soft
--oxide

/* Typography */
--font-display / --font-ui / --font-mono

/* Semantic (retrocompatível com classes antigas) */
--color-bg / --color-card / --color-border / --color-border-strong
--color-text / --color-text-soft / --color-muted
--color-primary / --color-primary-hover / --color-primary-soft
--color-primary-pastel / --color-primary-border
--color-accent / --color-accent-light / --color-accent-deep
--color-error-bg / --color-error-text

/* Shape */
--radius-sm: 8px
--radius:    12px
--radius-lg: 20px
--radius-xl: 28px

/* Shadows */
--shadow-sm / --shadow-md / --shadow-lg / --shadow-accent

/* Motion */
--ease-out-expo / --ease-in-out-soft
```

---

## 8. ThemeContext (white label)

O `frontend/src/contexts/ThemeContext.tsx` expõe:

```ts
interface AppTheme {
  name: string;       // ex: 'elia·mov'
  slogan: string;     // ex: 'A ciência do feminino, em movimento.'
  colors: {
    primary, primaryDark, accent, accentLight,
    textDark, bg, card, border, muted
  };
  logo?: string;      // URL custom (white label)
}
```

**Regras para white label:**

1. Tenants podem trocar `primary` (default Ink) e `accent` (default Terracotta).
2. Tipografia é **fixa** (Fraunces + Figtree) — não é customizável por tenant para preservar a espinha dorsal da marca.
3. Logo pode ser substituído por asset do tenant via `logo: string` (URL).
4. Slogan é customizável.
5. Fundo (`bg`) e `card` **não** devem ser customizáveis (quebra legibilidade).

---

## 9. Rejeições explícitas (do-not-use)

- ❌ **Inter**, **Roboto**, **Arial**, **Open Sans**, **Space Grotesk**, **Poppins** — genéricos, proibidos.
- ❌ **Cormorant Garamond**, **DM Sans**, **Montserrat** — legados do eliamov v1, sendo removidos.
- ❌ Gradient roxo → rosa (`#7C3AED` → `#EC4899`) — clichê wellness saas, banido.
- ❌ Navy profundo como primário (ex: `#2D1B4E`) — era o primaryDark antigo, substituído por Ink.
- ❌ Lavender (`#EDE9FE`, `#FAF5FF`) como fundo de card/seleção — substituir por `--terracotta-pale` ou `--sage-pale`.
- ❌ Círculos gigantes decorativos como fundo — substitua por aurora meshes.
- ❌ Bordas arredondadas >24px em superfícies grandes — mantenha `--radius` (12px) ou `--radius-lg` (20px) no máximo.
- ❌ Sombras coloridas (ex: `rgba(124,58,237,0.3)`) — use `--shadow-accent` ou tons neutros.

---

## 10. Referências visuais

- **Aesop** (produtos, embalagens) — cream backgrounds, serif editorial, minimalismo orgânico.
- **Byredo** (perfumaria) — Ink dark + tipografia distintiva, aurora de produto.
- **Linear** (software) — hairlines, microtipografia, grain subtle em dark.
- **NYT Styles / Cup of Jo** — editorial layout, pull-quotes, numeração de seção.
- **Everlane, Maison Margiela (sites)** — cards com border fino ao invés de shadow-glow.

---

## 11. Governança

- **Owner da marca:** Luan (@locdesenvolvimento).
- **Fonte da verdade:** este documento.
- **Arquivos implementadores:**
  - `eliamov/frontend/index.html` (imports de fonte)
  - `eliamov/frontend/src/index.css` (tokens `:root` + heading rules)
  - `eliamov/frontend/src/contexts/ThemeContext.tsx` (DEFAULT_THEME)
  - `eliamov/frontend/src/components/Logo.tsx` (lockup)
- **Status de adoção:** ver `docs/VISUAL_REFACTOR_STATUS.md` — 4 páginas aplicadas, 60+ com resíduos.
