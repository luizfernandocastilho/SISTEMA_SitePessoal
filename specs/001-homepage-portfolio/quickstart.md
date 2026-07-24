# Quickstart & Validação: Página Inicial — Portfólio Pessoal

Guia para rodar e **validar** a feature de ponta a ponta. Referencia
[data-model.md](./data-model.md) e [contracts/](./contracts/) em vez de duplicar detalhes. Não
contém código de implementação — as tarefas ficam em `tasks.md`.

## Pré-requisitos

- Node.js 20 LTS e npm.
- (Opcional para vídeos reais) `YOUTUBE_API_KEY` e o ID/handle do canal. Sem a chave, a seção de
  vídeos usa `src/data/youtube-cache.json` (ou é omitida) — o site continua construindo.

## Setup

```bash
npm install
cp .env.example .env   # preencher YOUTUBE_API_KEY e CHANNEL_ID (opcional)
```

## Rodar em desenvolvimento

```bash
npm run dev            # servidor local do Astro (http://localhost:4321)
```

## Build e preview estático

```bash
npm run build          # gera saída estática em dist/ (aqui ocorre o fetch do YouTube)
npm run preview        # serve o dist/ para conferência
```

## Qualidade

```bash
npm run lint           # ESLint + Prettier
npx astro check        # checagem de tipos e das content collections
npm test               # Vitest (lógica de youtube.ts e i18n.ts)
```

## Cenários de validação (mapeados à spec)

1. **Apresentação (US1, SC-001/SC-002)**: abrir `/pt` e `/en`; confirmar nome, headline e
   links de contato/redes visíveis na primeira dobra, em ambos os idiomas, sem rolagem horizontal.
2. **Toggle de idioma (FR-008, SC-006)**: no toggle, alternar PT↔EN em 1 clique; todo o conteúdo
   visível muda de idioma; funciona sem JavaScript habilitado (navegação por link).
3. **Certificações (US2, FR-003)**: adicionar um item em `src/content/certifications/`; após build,
   ele aparece com nome/emissor/ano; item com `verifyUrl` abre verificação em nova aba; item sem
   `verifyUrl` aparece sem link.
4. **Artigos (US3, FR-004)**: colocar um PDF em `public/articles/` e um metadado em
   `src/content/articles/`; após build, o item lista título/data/veículo e o download entrega o
   PDF. Remover/renomear o PDF ⇒ build falha com mensagem clara (contrato de collections).
5. **Vídeos — sucesso (FR-005, SC-007)**: com `YOUTUBE_API_KEY` válida, o build popula a seção com
   os vídeos recentes do canal e atualiza `youtube-cache.json`.
6. **Vídeos — fallback (FR-006/FR-011)**: rodar build sem a chave (ou simular falha da API);
   confirmar que o build conclui e a seção usa o cache ou é omitida, sem quebrar o layout.
7. **Acessibilidade/Performance (SC-003/SC-004)**: rodar Lighthouse (ou Lighthouse CI) em `/pt` e
   `/en`; Performance e Accessibility ≥ 95; sem erros de contraste ou de navegação por teclado.
8. **Conteúdo-como-dado (SC-005)**: adicionar uma certificação e um artigo editando apenas
   conteúdo/PDF (sem tocar em componentes de layout) e confirmar que aparecem após build.

## Deploy

Push para `main` dispara `.github/workflows/deploy.yml`, que roda build (com o secret
`YOUTUBE_API_KEY`) e publica `dist/` no GitHub Pages. Ver detalhes de segredos em
[contracts/youtube-fetch.md](./contracts/youtube-fetch.md).
