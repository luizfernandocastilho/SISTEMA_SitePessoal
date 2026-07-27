# Feature Specification: Página Inicial — Portfólio Pessoal

**Feature Branch**: `001-homepage-portfolio`

**Created**: 2026-07-24

**Status**: Draft

**Input**: User description: "A página inicial do site com uma apresentação profissional, e seções para certificações conquistadas, vídeos do canal do YouTube e artigos publicados."

## Clarifications

### Session 2026-07-27

- Q: A seção de vídeos deve mesmo usar a YouTube Data API? → A: **Não** (reverte a decisão de 2026-07-24). Para evitar chave/risco de cobrança, a seção passa a **destacar playlists/cursos curados** como cards (capa + título + link), sem qualquer chamada de API. Capa vem da miniatura pública `img.youtube.com`.

### Session 2026-07-24

- Q: Como a seção de vídeos deve obter os vídeos do canal do YouTube? → A: ~~Automático via API do YouTube~~ (revertido em 2026-07-27 — ver acima).
- Q: Como os artigos publicados devem ser apresentados? → A: Como arquivos PDF hospedados no site, disponibilizados para download.
- Q: O site deve ser em qual(is) idioma(s)? → A: Bilíngue PT/EN, com alternância de idioma.
- Q: A página deve ter alguma forma de contato direto além de links de redes? → A: Apenas links (email/redes sociais); sem formulário.

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Apresentação profissional (Priority: P1)

Um visitante chega à página inicial e, sem rolar muito, entende imediatamente quem é o dono do
site, o que ele faz profissionalmente e como entrar em contato ou seguir seu trabalho.

**Why this priority**: É a razão de existir do site — a vitrine profissional. Mesmo sem nenhuma
outra seção, uma página que apresenta bem a pessoa já entrega valor e constitui um MVP viável.

**Independent Test**: Publicar a página apenas com a seção de apresentação e verificar que um
visitante consegue identificar nome, atuação profissional e ao menos um meio de contato/link.

**Acceptance Scenarios**:

1. **Given** um visitante que nunca viu o site, **When** ele abre a página inicial, **Then** vê
   nome, uma descrição profissional resumida e links de contato/redes sem precisar rolar além da
   primeira dobra em uma tela de desktop.
2. **Given** um visitante em um celular, **When** ele abre a página, **Then** a apresentação é
   legível e navegável sem rolagem horizontal.

---

### User Story 2 - Certificações conquistadas (Priority: P2)

Um visitante (ex.: recrutador) quer conferir as certificações do dono do site para validar sua
qualificação.

**Why this priority**: Certificações são prova concreta de qualificação e reforçam a
credibilidade da apresentação — alto valor para o público-alvo profissional.

**Independent Test**: Adicionar a seção de certificações e verificar que cada certificação exibe
seus dados e, quando disponível, um link para verificação, de forma independente das demais
seções.

**Acceptance Scenarios**:

1. **Given** a página inicial, **When** o visitante navega até a seção de certificações, **Then**
   vê uma lista de certificações, cada uma com nome, entidade emissora e ano.
2. **Given** uma certificação que possui link de verificação, **When** o visitante clica nela,
   **Then** é levado à página oficial de verificação em uma nova aba.

---

### User Story 3 - Artigos publicados (Priority: P3)

Um visitante interessado no trabalho intelectual do dono quer encontrar e baixar os artigos que
ele escreveu e publicou.

**Why this priority**: Demonstra profundidade e produção de conteúdo, mas é complementar à
apresentação e às certificações.

**Independent Test**: Adicionar a seção de artigos e verificar que cada artigo listado disponibiliza
o PDF correspondente para download.

**Acceptance Scenarios**:

1. **Given** a página inicial, **When** o visitante navega até a seção de artigos, **Then** vê uma
   lista de artigos com título, data de publicação e veículo/local de publicação.
2. **Given** um artigo da lista, **When** o visitante aciona o download, **Then** o arquivo PDF do
   artigo, hospedado no próprio site, é baixado/aberto.

---

### User Story 4 - Vídeos do canal do YouTube (Priority: P4)

Um visitante quer descobrir e assistir os vídeos do canal do YouTube do dono do site.

**Why this priority**: Enriquece o portfólio com conteúdo audiovisual, mas é o item mais
secundário entre as seções previstas.

**Independent Test**: Adicionar a seção de vídeos e verificar que ela lista vídeos obtidos
automaticamente do canal, cada um assistível a partir da página.

**Acceptance Scenarios**:

1. **Given** a página inicial, **When** o visitante navega até a seção de vídeos, **Then** vê os
   vídeos mais recentes do canal (obtidos automaticamente), cada um com título e miniatura.
2. **Given** um vídeo listado, **When** o visitante clica nele, **Then** consegue assistir ao
   vídeo (na página ou no YouTube) e há um link para o canal.

### Edge Cases

- **Seção sem itens**: quando uma seção (certificações, artigos ou vídeos) ainda não tem itens,
  ela é omitida ou exibe uma mensagem discreta, sem quebrar o layout.
- **Link externo indisponível**: se um link de verificação ou vídeo estiver fora do ar, o
  visitante ainda vê as informações textuais do item na página.
- **PDF de artigo ausente/inacessível**: o artigo continua listado com seus dados textuais e o
  problema de download degrada de forma elegante, sem quebrar a seção.
- **API do YouTube indisponível na publicação**: a seção de vídeos degrada de forma elegante (ex.:
  usa a última lista obtida ou é omitida) sem impedir a publicação nem quebrar o layout.
- **Miniatura de vídeo ausente**: a seção de vídeos degrada de forma elegante, mantendo título e
  link mesmo sem imagem.
- **Idioma sem tradução**: se um item de conteúdo não tiver versão no idioma selecionado, o
  sistema exibe um fallback claro (ex.: o outro idioma) sem deixar a área vazia.
- **Conteúdo longo**: listas com muitos itens permanecem navegáveis (ex.: exibindo os mais
  recentes ou permitindo ver mais) sem tornar a página excessivamente longa.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: A página inicial MUST apresentar, na seção de abertura, o nome, uma descrição
  profissional resumida e links de contato/redes do dono do site.
- **FR-002**: A página MUST oferecer navegação (ex.: âncoras ou menu) para acessar as seções de
  certificações, artigos e vídeos.
- **FR-003**: A seção de certificações MUST exibir cada certificação com, no mínimo, nome,
  entidade emissora e ano, e MUST oferecer link de verificação quando este existir.
- **FR-004**: A seção de artigos MUST exibir cada artigo com título, data de publicação e
  veículo/local de publicação, e MUST disponibilizar o arquivo PDF do artigo, hospedado no site,
  para download.
- **FR-005**: A seção de vídeos MUST listar vídeos obtidos automaticamente do canal do YouTube
  (ex.: os mais recentes), cada um com título e miniatura, e MUST oferecer link para o vídeo e
  para o canal.
- **FR-006**: A obtenção dos vídeos via API do YouTube MUST manter a saída publicada compatível
  com hospedagem estática (ex.: atualização no momento de build/publicação), sem expor segredos de
  API no conteúdo entregue ao navegador.
- **FR-007**: O conteúdo mantido pelo dono (certificações, artigos e respectivos PDFs, dados de
  apresentação e curadoria/configuração de vídeos) MUST ser versionado e editável sem alterar a
  lógica de layout.
- **FR-008**: A página MUST ser bilíngue (português e inglês) e MUST oferecer alternância de
  idioma; todo texto de interface e de conteúdo mantido pelo dono MUST ter versão em ambos os
  idiomas. Textos provenientes de fontes externas não traduzíveis pelo site — em especial os
  títulos de vídeos obtidos da API do YouTube — MAY ser exibidos no idioma original fornecido pela
  fonte, com os rótulos de interface ao redor traduzidos.
- **FR-009**: A página MUST ser responsiva e utilizável de telas de celular a desktop, sem
  rolagem horizontal.
- **FR-010**: A página MUST ser acessível: HTML semântico, imagens com texto alternativo,
  navegação por teclado e contraste adequado (WCAG AA como piso).
- **FR-011**: Quando uma seção não tiver itens (ou os vídeos não puderem ser obtidos), o sistema
  MUST omiti-la ou sinalizá-la discretamente, sem quebrar o layout.
- **FR-012**: Links externos (verificação de certificação, vídeos, canal) MUST abrir em nova aba
  preservando a página inicial; o contato MUST se dar apenas por links (email/redes), sem
  formulário.

### Key Entities _(include if feature involves data)_

- **Perfil**: dados de apresentação do dono — nome, descrição profissional (em PT e EN), links de
  contato (email) e redes sociais.
- **Certificação**: nome, entidade emissora, ano de conquista e link de verificação (opcional).
- **Artigo**: título, data de publicação, veículo/local de publicação e arquivo PDF hospedado no
  site para download.
- **Vídeo**: título, miniatura, URL do vídeo e referência ao canal do YouTube — obtido
  automaticamente via API do YouTube (não editado manualmente).

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Um visitante identifica quem é o dono do site e sua atuação profissional em menos de
  10 segundos após abrir a página inicial.
- **SC-002**: A partir da página inicial, o visitante alcança qualquer uma das quatro áreas
  (apresentação, certificações, artigos, vídeos) em no máximo 1 interação.
- **SC-003**: A página inicial carrega e fica utilizável em menos de 3 segundos em uma conexão
  móvel típica.
- **SC-004**: A página atinge pontuação de acessibilidade de pelo menos 95/100 em auditoria
  automatizada padrão e não apresenta erros de contraste ou de navegação por teclado.
- **SC-005**: Adicionar uma nova certificação ou artigo (com seu PDF) é feito editando apenas o
  conteúdo/arquivos correspondentes, sem alterar código de layout.
- **SC-006**: O visitante alterna entre português e inglês em 1 interação e todo o conteúdo
  mantido pelo dono e os rótulos de interface passam a ser exibidos no idioma escolhido (títulos de
  vídeos externos podem permanecer no idioma original da fonte).
- **SC-007**: A lista de vídeos reflete o canal do YouTube sem edição manual, atualizando-se a
  cada publicação do site.

## Assumptions

- **Público-alvo**: recrutadores, colegas de profissão e interessados no trabalho do dono do
  site; navegação em desktop e mobile, com conectividade padrão.
- **Site estático**: conforme a constituição, o site é publicado como site estático (ex.: GitHub
  Pages/Netlify), sem backend ou banco de dados. A integração com a API do YouTube (FR-005/FR-006)
  deve preservar isso — ex.: obtendo os vídeos no momento de build/publicação — mantendo qualquer
  segredo de API fora do que é entregue ao navegador.
- **Vídeos do YouTube (automático)**: a lista de vídeos é obtida automaticamente do canal via API
  do YouTube; não há curadoria manual de vídeos.
- **Artigos (PDF hospedado)**: os PDFs dos artigos ficam hospedados no próprio site e são
  disponibilizados para download; o site não renderiza o texto completo nem depende de links
  externos para o conteúdo do artigo.
- **Idioma**: site bilíngue PT/EN com alternância; português como idioma padrão inicial.
- **Contato**: apenas por links (email/redes sociais); sem formulário de contato.
- **Escopo v1**: esta feature cobre a página inicial e suas quatro seções; páginas de detalhe
  dedicadas, busca, comentários e formulário de contato dinâmico estão fora do escopo desta v1.
