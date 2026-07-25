# Implementation Plan: Página Inicial — Portfólio Pessoal

**Branch**: `001-homepage-portfolio` | **Date**: 2026-07-24 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-homepage-portfolio/spec.md`

## Summary

Página inicial de um site pessoal (portfólio) com quatro seções — apresentação profissional,
certificações, artigos (PDF para download) e vídeos do canal do YouTube — bilíngue PT/EN e
publicada como site estático. Abordagem técnica: **gerador de site estático Astro** com conteúdo
mantido em _content collections_ versionadas, i18n nativo por rota (toggle sem JavaScript de
runtime), lista de vídeos obtida da **API do YouTube em tempo de build** (chave via secret, nunca
enviada ao navegador) com fallback em cache, e saída 100% estática publicada no GitHub Pages via
GitHub Actions. Lógica não-trivial (fetch de vídeos, helpers de i18n) em TypeScript, testada com
Vitest.

## Technical Context

**Language/Version**: TypeScript 5.x sobre Node.js 20 LTS (apenas em build; runtime do site é
HTML/CSS estático + JS mínimo)

**Primary Dependencies**: Astro 4.x (SSG, i18n, content collections + Zod); `@astrojs/sitemap`;
API do YouTube Data v3 (via `fetch` em build). Sem framework de UI cliente.

**Storage**: Arquivos versionados no repositório (Markdown/JSON/YAML nas content collections);
PDFs de artigos como assets estáticos. Sem banco de dados.

**Testing**: Vitest (unidade, para lógica de i18n e do cliente YouTube); `astro check` (types);
ESLint + Prettier (lint/format); auditoria de acessibilidade/performance com Lighthouse CI.

**Target Platform**: Navegadores modernos (desktop e mobile); hospedagem estática (GitHub Pages).

**Project Type**: Site estático (web front-end) — projeto único.

**Performance Goals**: Página inicial utilizável em < 3 s em conexão móvel típica (SC-003);
Lighthouse Performance e Accessibility ≥ 95 (SC-004); JavaScript de runtime próximo de zero.

**Constraints**: Saída 100% estática (sem backend/DB); segredo da API do YouTube nunca exposto ao
cliente; WCAG AA; sem rolagem horizontal; conteúdo editável sem tocar em layout.

**Scale/Scope**: 1 página inicial com 4 seções, 2 idiomas (PT/EN); dezenas de certificações,
artigos e vídeos (ordem de grandeza pequena); site pessoal mantido por 1 pessoa.

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

Avaliação contra a Constituição v1.0.0:

- **I. Simplicidade Primeiro (YAGNI)** — ✅ PASS. A spec já exige um passo de build (fetch do
  YouTube), i18n e conteúdo-como-dado; um SSG mínimo é a solução mais simples que atende a esses
  requisitos (a alternativa vanilla exigiria duplicar páginas por idioma e um pipeline de build
  caseiro — mais complexo). Astro é usado sem framework de UI cliente; dependências mantidas ao
  mínimo.
- **II. Performance e Acessibilidade (NÃO-NEGOCIÁVEL)** — ✅ PASS. Saída estática, zero JS por
  padrão (Astro islands), HTML semântico, imagens otimizadas; metas SC-003/SC-004 verificadas via
  Lighthouse CI. Toggle de idioma por link (sem JS).
- **III. Qualidade de Código e Testes** — ✅ PASS. ESLint/Prettier + `astro check`; Vitest cobre a
  lógica não-trivial (cliente YouTube, helpers i18n, fallback); verificação de links/build no CI.
- **IV. Conteúdo como Dado Versionado** — ✅ PASS. Content collections (Markdown/JSON/YAML) com
  schema Zod; adicionar certificação/artigo = editar conteúdo + PDF, sem mexer em layout (SC-005).
- **Restrições Técnicas (site estático)** — ✅ PASS (com nota). A API do YouTube é consumida
  **apenas em build**, produzindo saída estática; a chave vive como secret do CI e não é entregue
  ao navegador. Nenhum backend/DB é introduzido.

**Resultado**: Sem violações. Complexity Tracking permanece vazio.

## Project Structure

### Documentation (this feature)

```text
specs/001-homepage-portfolio/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
│   ├── content-collections.md   # schemas (Perfil, Certificação, Artigo, i18n UI)
│   └── youtube-fetch.md         # contrato do módulo de build de vídeos
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
public/
├── articles/            # PDFs dos artigos (assets estáticos p/ download)
└── images/              # imagens estáticas (ex.: foto de perfil, og)

src/
├── content/             # CONTENT COLLECTIONS (conteúdo versionado — Princípio IV)
│   ├── profile/         #   perfil/apresentação (por idioma)
│   ├── certifications/  #   certificações
│   ├── articles/        #   metadados dos artigos (aponta para PDF em public/articles)
│   └── ui/              #   strings de interface PT/EN (i18n)
├── content.config.ts    # schemas Zod das collections
├── lib/
│   ├── youtube.ts       # cliente de build: busca vídeos do canal + fallback em cache
│   └── i18n.ts          # helpers de idioma/rota
├── data/
│   └── youtube-cache.json  # último resultado da API (fallback quando a API falha no build)
├── components/          # Header, LanguageToggle, seções (Hero, Certs, Articles, Videos)
├── layouts/
│   └── BaseLayout.astro
├── pages/
│   ├── index.astro          # redireciona para o idioma padrão (pt)
│   ├── pt/index.astro       # home PT
│   └── en/index.astro       # home EN
└── styles/

tests/
└── unit/                # Vitest: youtube.ts (parse/fallback), i18n.ts

astro.config.mjs         # i18n (defaultLocale: pt; locales: [pt, en]), sitemap, site URL
.github/workflows/deploy.yml   # build (com YOUTUBE_API_KEY secret) + deploy GitHub Pages
```

**Structure Decision**: Projeto único (site estático Astro). Conteúdo isolado em `src/content/`
com schemas em `content.config.ts`; a única lógica com testes fica em `src/lib/`. Páginas por
idioma via i18n de rota do Astro. O build é o ponto onde a API do YouTube é consultada; o resultado
é persistido em `src/data/youtube-cache.json` como fallback determinístico.

## Complexity Tracking

> Sem violações constitucionais a justificar — seção intencionalmente vazia.
