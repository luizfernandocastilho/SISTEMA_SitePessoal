# Phase 1 Data Model: Página Inicial — Portfólio Pessoal

Entidades derivadas da spec, mapeadas para *content collections* do Astro (schemas Zod em
`src/content.config.ts`). Todo conteúdo é versionado no repositório (Princípio IV). Regras de
validação vêm dos requisitos funcionais.

## Convenções

- Cada entidade textual tem versão **PT e EN** (FR-008). Estratégia: campos com sufixo de idioma
  (`_pt` / `_en`) para textos curtos; para blocos maiores, um arquivo por idioma.
- Datas em ISO `YYYY-MM-DD`.
- URLs validadas como URL absoluta; caminhos de asset validados como relativos a `public/`.

## Entidade: Perfil (`profile`)

Dados de apresentação do dono do site (US1, FR-001). Coleção com **um único item** que carrega
campos bilíngues (sufixos `_pt`/`_en`).

| Campo            | Tipo                          | Regras                                             |
|------------------|-------------------------------|----------------------------------------------------|
| `name`           | string                        | obrigatório                                        |
| `headline_pt`    | string                        | obrigatório; descrição profissional resumida (PT)  |
| `headline_en`    | string                        | obrigatório; descrição profissional resumida (EN)  |
| `email`          | string (email)                | obrigatório; usado em link `mailto:` (FR-012)      |
| `socialLinks`    | array de `{ label, url }`     | url absoluta; abrem em nova aba (FR-012)            |
| `photo`          | string (path em public/)      | opcional; requer `alt` (FR-010 acessibilidade)     |
| `photoAlt_pt/en` | string                        | obrigatório se `photo` presente                    |

## Entidade: Certificação (`certifications`)

US2, FR-003. Um item por certificação.

| Campo         | Tipo                    | Regras                                                     |
|---------------|-------------------------|-----------------------------------------------------------|
| `name`        | string                  | obrigatório                                               |
| `issuer`      | string                  | obrigatório (entidade emissora)                          |
| `year`        | number (inteiro)        | obrigatório; 4 dígitos                                    |
| `verifyUrl`   | string (URL)            | opcional; se presente, link de verificação em nova aba    |
| `order`       | number                  | opcional; ordenação de exibição (default: por `year` desc)|

Regra: se `verifyUrl` ausente, exibir a certificação sem link (edge case "link indisponível").

## Entidade: Artigo (`articles`)

US3, FR-004 (PDF hospedado para download). Um item por artigo.

| Campo         | Tipo                        | Regras                                                   |
|---------------|-----------------------------|----------------------------------------------------------|
| `title_pt`    | string                      | obrigatório                                              |
| `title_en`    | string                      | obrigatório                                             |
| `publishedAt` | date (ISO)                  | obrigatório                                              |
| `venue`       | string                      | obrigatório (veículo/local de publicação)               |
| `pdf`         | string (path public/articles) | obrigatório; arquivo `.pdf` existente                  |
| `order`       | number                      | opcional; default por `publishedAt` desc                |

Regra: se o `pdf` estiver ausente/inacessível, o artigo permanece listado com seus dados textuais
(edge case "PDF ausente").

## Entidade: Vídeo (`Video`) — derivada da API, não versionada como conteúdo editável

FR-005/FR-006, SC-007. **Não** é uma content collection editável: é obtida em build de
`src/lib/youtube.ts` e persistida em `src/data/youtube-cache.json` (fallback).

| Campo         | Tipo            | Origem                                             |
|---------------|-----------------|----------------------------------------------------|
| `id`          | string          | ID do vídeo no YouTube                             |
| `title`       | string          | título do vídeo (idioma conforme o canal)         |
| `thumbnail`   | string (URL)    | miniatura (maior resolução disponível)            |
| `url`         | string (URL)    | `https://www.youtube.com/watch?v={id}`            |
| `publishedAt` | date (ISO)      | data de publicação no canal                       |

Config associada (não por vídeo): `channelId`/handle do canal e `maxVideos` (default 6).

## Entidade: UI Strings (`ui`)

Suporte a i18n (FR-008): rótulos de interface (nomes de seções, botões, toggle de idioma, textos
de fallback). Um arquivo por idioma (`pt`, `en`) com o mesmo conjunto de chaves.

| Campo    | Tipo                | Regras                                             |
|----------|---------------------|----------------------------------------------------|
| `locale` | enum(`pt`,`en`)     | obrigatório                                        |
| `strings`| record<string,string> | mesmo conjunto de chaves em ambos os locales      |

Regra de consistência: o conjunto de chaves de `pt` e `en` deve ser idêntico (validado em teste).

## Relacionamentos

- `Perfil`, `Certificações`, `Artigos`, `UI` são independentes (sem chaves estrangeiras).
- `Vídeos` é derivado externamente e não referencia as demais entidades.
- A página inicial (por idioma) agrega as quatro seções + toggle de idioma.

## Estados / ciclos

- Sem transições de estado (conteúdo estático). "Publicado" = presente no repositório e no build.
- `youtube-cache.json` tem ciclo simples: atualizado a cada build bem-sucedido; reutilizado quando
  a API falha.
