# Phase 0 Research: Página Inicial — Portfólio Pessoal

Resolve as decisões técnicas do Technical Context. Nenhum item permanece como
NEEDS CLARIFICATION.

## 1. Gerador de site estático

- **Decision**: Astro 4.x, sem framework de UI cliente.
- **Rationale**: A spec exige, de qualquer forma, um passo de build (fetch de vídeos), i18n PT/EN
  e conteúdo-como-dado separado do layout. Astro entrega os três com o mínimo de peso: renderiza
  para HTML estático, **envia zero JavaScript por padrão** (atende Princípio II e SC-004),
  oferece *content collections* tipadas (Princípio IV) e i18n de rota nativo. TypeScript disponível
  para a lógica testável.
- **Alternatives considered**:
  - *HTML/CSS/JS puro*: mais simples só na aparência — exigiria duplicar páginas por idioma e um
    pipeline de build caseiro para o YouTube; viola DRY e aumenta manutenção.
  - *Eleventy (11ty)*: excelente e leve, mas i18n e tipagem de conteúdo são mais manuais.
  - *Next.js/Nuxt*: peso e runtime JS desnecessários para um site estático; contraria Princípio I.

## 2. Internacionalização PT/EN

- **Decision**: i18n de rota do Astro — `defaultLocale: "pt"`, `locales: ["pt", "en"]`, com páginas
  em `src/pages/pt/` e `src/pages/en/`. Strings de UI em uma collection `ui` (um arquivo por
  idioma). Toggle de idioma é um link entre as rotas equivalentes.
- **Rationale**: Alterna idioma em 1 interação (SC-006) **sem JavaScript de runtime**; cada idioma
  é uma URL indexável; conteúdo por idioma vive versionado nas collections.
- **Alternatives considered**:
  - *Troca client-side via JS* (esconder/mostrar): pior para SEO e acessibilidade, exige JS.
  - *Bibliotecas i18n de terceiros*: desnecessárias dado o suporte nativo do Astro.
- **Fallback de tradução**: quando um item não tiver versão no idioma ativo, exibir o outro idioma
  com marcação clara (atende edge case "Idioma sem tradução").

## 3. Vídeos via API do YouTube (em build)

- **Decision**: Módulo `src/lib/youtube.ts` consulta a **YouTube Data API v3** em tempo de build,
  buscando os uploads recentes do canal (via *uploads playlist* do canal). A chave vem de
  `YOUTUBE_API_KEY` (variável de ambiente / secret do CI) e **nunca** é incluída na saída. O
  resultado é normalizado e persistido em `src/data/youtube-cache.json`.
- **Rationale**: Mantém a saída 100% estática (Restrição constitucional) enquanto satisfaz
  FR-005/FR-006 e SC-007 (lista reflete o canal sem edição manual). Consultar a *uploads playlist*
  (`playlistItems.list`) é mais barato em cota do que `search.list`.
- **Fallback**: se a API falhar/estourar cota no build, usar o `youtube-cache.json` anterior; se
  não houver cache, a seção é omitida sem quebrar o build (FR-011, edge case "API indisponível").
- **Config necessária**: ID do canal em `CHANNEL_ID` (variável de ambiente / secret do CI) e nº de
  vídeos a exibir em `MAX_VIDEOS` (variável de ambiente, default 6) — mesma origem do `.env.example`
  e do workflow de deploy.
- **Alternatives considered**:
  - *Fetch client-side*: exporia a chave e adicionaria JS + dependência de runtime — rejeitado.
  - *RSS do canal* (`feeds/videos.xml`): sem chave, porém dados mais pobres (sem estatísticas,
    limite ~15 itens) e menos estável. Mantido como possível simplificação futura, não adotado.
  - *Embed único do canal*: não permite miniatura/título por vídeo conforme FR-005.

## 4. Artigos em PDF

- **Decision**: PDFs hospedados em `public/articles/`; metadados (título, data, veículo, caminho do
  PDF) numa collection `articles`. O link de download aponta para o asset estático.
- **Rationale**: Atende FR-004 e o esclarecimento (PDF para download, hospedado no site) sem
  renderizar texto completo nem depender de links externos. Adicionar artigo = colocar o PDF +
  editar o metadado (SC-005).
- **Alternatives considered**: renderizar Markdown como página de artigo (fora do escopo v1);
  linkar veículo externo (rejeitado no clarify).

## 5. Hospedagem e deploy

- **Decision**: GitHub Pages, build e deploy via GitHub Actions (`.github/workflows/deploy.yml`).
  O `YOUTUBE_API_KEY` é um *secret* do repositório injetado no passo de build.
- **Rationale**: Estático, gratuito, integrado ao GitHub; o build no CI é o único lugar que vê a
  chave da API, preservando a Restrição constitucional. Contato é só por links, então não há
  necessidade de recursos de formulário (ex.: Netlify Forms).
- **Alternatives considered**: Netlify/Vercel (equivalentes; escolhido GitHub Pages por
  simplicidade e por o projeto já viver no GitHub).

## 6. Testes e qualidade

- **Decision**: Vitest para unidade (normalização/fallback de `youtube.ts`, helpers de `i18n.ts`);
  `astro check` para tipos; ESLint + Prettier; Lighthouse CI para performance/acessibilidade
  (gates SC-003/SC-004) no pipeline.
- **Rationale**: Cobre a lógica não-trivial (Princípio III) sem exigir teste de conteúdo estático;
  os gates de Lighthouse tornam SC-003/SC-004 verificáveis automaticamente.
- **Alternatives considered**: testes E2E (Playwright) — adiáveis para além da v1 (YAGNI).

## Decisões em aberto

Nenhuma. Todas as incógnitas do Technical Context foram resolvidas.
