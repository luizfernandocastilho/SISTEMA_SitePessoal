---

description: "Task list for Página Inicial — Portfólio Pessoal"
---

# Tasks: Página Inicial — Portfólio Pessoal

**Input**: Design documents from `/specs/001-homepage-portfolio/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Incluídos apenas para a lógica não-trivial (módulo YouTube e helpers de i18n), conforme
Princípio III da Constituição. Conteúdo estático não recebe teste unitário.

**Organization**: Tarefas agrupadas por user story (P1→P4) para implementação e teste independentes.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependências pendentes)
- **[Story]**: User story a que pertence (US1–US4)
- Caminhos de arquivo exatos incluídos em cada tarefa

## Path Conventions

Projeto único (site estático Astro): `src/`, `public/`, `tests/` na raiz do repositório (ver
"Project Structure" em [plan.md](./plan.md)).

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Inicialização do projeto Astro e ferramentas.

- [ ] T001 Inicializar projeto Astro na raiz: `package.json`, `astro.config.mjs` (i18n
  `defaultLocale: "pt"`, `locales: ["pt","en"]`; integração `@astrojs/sitemap`; `site` URL),
  `tsconfig.json`
- [ ] T002 [P] Criar estrutura de diretórios: `src/{content,components,layouts,pages,lib,data,styles}`,
  `public/{articles,images}`, `tests/unit`
- [ ] T003 [P] Configurar ESLint + Prettier na raiz (`.eslintrc`, `.prettierrc`) e scripts `lint`/`format` no `package.json`
- [ ] T004 [P] Configurar Vitest (`vitest.config.ts`) e script `test` no `package.json`
- [ ] T005 [P] Criar `.env.example` (`YOUTUBE_API_KEY`, `CHANNEL_ID`, `MAX_VIDEOS`) e atualizar `.gitignore` (`.env`, `dist/`, `node_modules/`)

**Checkpoint**: Projeto instala (`npm install`) e `npm run dev` sobe uma página vazia.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Infraestrutura que TODAS as user stories usam (schemas, i18n, layout base, shell da página).

**⚠️ CRITICAL**: Nenhuma user story pode começar antes desta fase.

- [ ] T006 Definir schemas das content collections em `src/content.config.ts` (`profile`,
  `certifications`, `articles`, `ui`) com Zod, conforme [contracts/content-collections.md](./contracts/content-collections.md)
- [ ] T007 [P] Criar estilos globais e tokens em `src/styles/global.css` (responsivo, sem rolagem horizontal, contraste WCAG AA)
- [ ] T008 [P] Criar strings de UI em `src/content/ui/pt.json` e `src/content/ui/en.json` (rótulos de seções, toggle, textos de fallback — mesmas chaves nos dois)
- [ ] T009 [P] [tests] Escrever teste unitário dos helpers de i18n em `tests/unit/i18n.test.ts` (deve FALHAR antes da implementação)
- [ ] T010 Implementar helpers de i18n em `src/lib/i18n.ts` (resolução de locale/rota, lookup de strings, fallback ao outro idioma) — fazer T009 passar
- [ ] T011 Criar layout base em `src/layouts/BaseLayout.astro` (HTML semântico, `<html lang>`, meta/OG, skip-link de acessibilidade, slot de conteúdo)
- [ ] T012 [P] Criar componente `src/components/LanguageToggle.astro` (link entre `/pt` e `/en` equivalentes, sem JS)
- [ ] T013 [P] Criar componente `src/components/Header.astro` (navegação por âncoras para as seções + LanguageToggle)
- [ ] T014 Criar shell das páginas: `src/pages/index.astro` (redireciona para `/pt`), `src/pages/pt/index.astro` e `src/pages/en/index.astro` (usam BaseLayout + Header, com `<main>` e âncoras de seção vazias)

**Checkpoint**: `/pt` e `/en` renderizam com header, toggle funcional e main vazio; `npm test` passa.

---

## Phase 3: User Story 1 - Apresentação profissional (Priority: P1) 🎯 MVP

**Goal**: Página inicial apresenta nome, descrição profissional e links de contato/redes, em PT e EN.

**Independent Test**: Abrir `/pt` e `/en` e confirmar nome, headline e links de contato visíveis na primeira dobra, sem rolagem horizontal (SC-001/SC-002).

- [ ] T015 [P] [US1] Criar conteúdo de perfil em `src/content/profile/` (nome, `headline_pt/en`, `email`, `socialLinks`, `photo`+alt opcional) conforme schema `profile`
- [ ] T016 [P] [US1] Adicionar imagens de perfil/OG em `public/images/` (com dimensões otimizadas)
- [ ] T017 [US1] Criar componente `src/components/Hero.astro` (renderiza perfil no idioma ativo: nome, headline, `mailto:` e redes abrindo em nova aba — FR-001/FR-012)
- [ ] T018 [US1] Incluir `<Hero />` no `<main>` de `src/pages/pt/index.astro` e `src/pages/en/index.astro`

**Checkpoint**: US1 completa e testável — MVP publicável apenas com a apresentação.

---

## Phase 4: User Story 2 - Certificações conquistadas (Priority: P2)

**Goal**: Seção lista certificações com nome, emissor, ano e link de verificação quando existir.

**Independent Test**: Adicionar um item em `certifications`; após build, aparece na seção; item com `verifyUrl` abre verificação em nova aba, item sem link aparece sem ele (FR-003).

- [ ] T019 [P] [US2] Criar itens de conteúdo em `src/content/certifications/` (exemplos reais) conforme schema `certifications`
- [ ] T020 [US2] Criar componente `src/components/Certifications.astro` (lista ordenada por ano desc; link de verificação opcional em nova aba; estado vazio omite a seção — FR-011)
- [ ] T021 [US2] Incluir `<Certifications />` nas páginas `src/pages/pt/index.astro` e `src/pages/en/index.astro`

**Checkpoint**: US1 e US2 funcionam de forma independente.

---

## Phase 5: User Story 3 - Artigos publicados (Priority: P3)

**Goal**: Seção lista artigos com título/data/veículo e disponibiliza o PDF hospedado para download.

**Independent Test**: Colocar um PDF em `public/articles/` + metadado em `articles`; após build, o item lista os dados e o download entrega o PDF (FR-004).

- [ ] T022 [P] [US3] Adicionar PDFs de exemplo em `public/articles/`
- [ ] T023 [P] [US3] Criar metadados em `src/content/articles/` (`title_pt/en`, `publishedAt`, `venue`, `pdf`) conforme schema `articles`
- [ ] T024 [US3] Criar componente `src/components/Articles.astro` (lista ordenada por data desc; link de download do PDF; degrada se PDF ausente — edge case)
- [ ] T025 [US3] Incluir `<Articles />` nas páginas `src/pages/pt/index.astro` e `src/pages/en/index.astro`

**Checkpoint**: US1–US3 funcionam de forma independente.

---

## Phase 6: User Story 4 - Vídeos do canal do YouTube (Priority: P4)

**Goal**: Seção lista vídeos obtidos automaticamente do canal via API em build, com fallback em cache.

**Independent Test**: Com chave válida, build popula a seção e atualiza o cache; sem chave/erro de API, build conclui usando cache ou omite a seção (FR-005/FR-006/FR-011).

- [ ] T026 [P] [US4] [tests] Escrever testes unitários de `src/lib/youtube.ts` em `tests/unit/youtube.test.ts` cobrindo todos os casos de [contracts/youtube-fetch.md](./contracts/youtube-fetch.md) (deve FALHAR antes da implementação)
- [ ] T027 [US4] Implementar `src/lib/youtube.ts` (`getChannelVideos`: fetch da uploads playlist, normalização, limite/ordenar, grava cache; fallbacks sem-chave/erro; nunca lança) — fazer T026 passar
- [ ] T028 [P] [US4] Criar `src/data/youtube-cache.json` inicial (seed vazio/`[]` versionado como fallback)
- [ ] T029 [US4] Criar componente `src/components/Videos.astro` que recebe os vídeos obtidos em build (título, miniatura com alt, link do vídeo e do canal em nova aba; omite seção se lista vazia — FR-005/FR-011)
- [ ] T030 [US4] Ligar o fetch de vídeos no carregamento das páginas `src/pages/pt/index.astro` e `src/pages/en/index.astro` (ler `CHANNEL_ID`/`MAX_VIDEOS` do ambiente) e incluir `<Videos />`

**Checkpoint**: Todas as quatro user stories funcionam de forma independente.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Deploy, gates de qualidade e validação final (afetam todas as stories).

- [ ] T031 [P] Criar workflow `.github/workflows/deploy.yml` (build com secret `YOUTUBE_API_KEY` + deploy no GitHub Pages)
- [ ] T032 [P] Configurar Lighthouse CI (`lighthouserc` + passo no workflow) com gates Performance/Accessibility ≥ 95 em `/pt` e `/en` (SC-003/SC-004)
- [ ] T033 Passar `npm run lint` e `npx astro check` sem erros; corrigir o que aparecer
- [ ] T034 Rodar os cenários de validação de [quickstart.md](./quickstart.md) (incluindo fallback de vídeos e toggle de idioma sem JS)
- [ ] T035 [P] Atualizar `CLAUDE.md` na raiz com a stack real e comandos (`dev`/`build`/`test`/`lint`)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sem dependências.
- **Foundational (Phase 2)**: depende do Setup — BLOQUEIA todas as user stories.
- **User Stories (Phase 3–6)**: dependem da Fase 2. Depois disso podem ser feitas em paralelo ou na ordem de prioridade P1→P4.
- **Polish (Phase 7)**: depende das user stories desejadas prontas.

### User Story Dependencies

- **US1 (P1)**: começa após Fase 2. Sem dependência de outras stories. É o MVP.
- **US2 (P2)**: após Fase 2. Independente (adiciona sua seção).
- **US3 (P3)**: após Fase 2. Independente.
- **US4 (P4)**: após Fase 2. Independente (lógica isolada em `src/lib/youtube.ts`).
- Nota de arquivo compartilhado: T018/T021/T025/T030 editam as mesmas páginas `pt/index.astro` e `en/index.astro` (inclusões aditivas de seção) — se stories forem paralelizadas, sequenciar essas inclusões para evitar conflito.

### Within Each User Story

- Onde há testes (US4, i18n): teste escrito e FALHANDO antes da implementação.
- Conteúdo/model antes do componente; componente antes de incluir na página.

### Parallel Opportunities

- Setup: T002–T005 em paralelo.
- Foundational: T007, T008, T009 em paralelo; T012 e T013 em paralelo (após T011).
- Dentro das stories: tarefas de conteúdo/assets marcadas [P] em paralelo (ex.: T015+T016; T022+T023).
- Com equipe, US1–US4 podem correr em paralelo após a Fase 2 (respeitando a nota de arquivo compartilhado).

---

## Parallel Example: User Story 1

```bash
# Conteúdo e assets de US1 em paralelo:
Task: "Criar conteúdo de perfil em src/content/profile/"        # T015
Task: "Adicionar imagens de perfil/OG em public/images/"        # T016
# Depois, sequencial:
Task: "Criar componente src/components/Hero.astro"              # T017
Task: "Incluir <Hero /> nas páginas pt/index e en/index"       # T018
```

---

## Implementation Strategy

### MVP First (User Story 1)

1. Fase 1 (Setup) → 2. Fase 2 (Foundational) → 3. Fase 3 (US1) → **PARAR e VALIDAR** a apresentação → publicar MVP.

### Incremental Delivery

Setup + Foundational → US1 (MVP) → US2 → US3 → US4, cada uma testada e publicável sem quebrar as anteriores; Polish fecha deploy e gates.

---

## Notes

- [P] = arquivos diferentes, sem dependências pendentes.
- Rótulo [Story] mapeia a tarefa à user story para rastreabilidade.
- Verificar que os testes falham antes de implementar (T009 antes de T010; T026 antes de T027).
- Commit após cada tarefa ou grupo lógico.
- Parar em qualquer checkpoint para validar a story isoladamente.
