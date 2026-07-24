<!--
SYNC IMPACT REPORT
==================
Version change: TEMPLATE (unversioned) → 1.0.0
Bump rationale: Initial ratification — all principles and sections defined for the first time.

Modified principles: N/A (initial adoption)
Added sections:
  - Core Principles (4): Simplicidade Primeiro; Performance e Acessibilidade;
    Qualidade de Código e Testes; Conteúdo como Dado Versionado
  - Restrições Técnicas
  - Fluxo de Desenvolvimento
  - Governance
Removed sections: none

Templates requiring updates:
  - .specify/templates/plan-template.md ...... ✅ no change needed (Constitution Check gate
      derives from this file dynamically; no hardcoded principle names)
  - .specify/templates/spec-template.md ...... ✅ no change needed (no constitution references)
  - .specify/templates/tasks-template.md ..... ✅ no change needed (no constitution references)
  - .claude/skills/speckit-*/SKILL.md ........ ✅ no change needed (generic guidance)

Follow-up TODOs: none
-->

# Site Pessoal Constitution

Site pessoal de Luiz Fernando Castilho — portfólio profissional que apresenta projetos,
certificações conquistadas, o canal do YouTube e artigos escritos e publicados.

## Core Principles

### I. Simplicidade Primeiro (YAGNI)

Comece simples e adicione complexidade apenas quando uma necessidade concreta e presente a
justificar. Cada dependência, biblioteca ou ferramenta de build DEVE ganhar seu lugar — na
dúvida entre uma solução com framework e HTML/CSS/JS direto, a solução mais simples que atende
ao requisito vence. Funcionalidades "para o futuro" NÃO DEVEM ser construídas antes de existir
demanda real.

**Rationale**: É um site pessoal mantido por uma pessoa. Complexidade acidental é o maior risco
de abandono — cada peça a mais é custo de manutenção que não se paga.

### II. Performance e Acessibilidade (NÃO-NEGOCIÁVEL)

Toda página entregue DEVE ser rápida e acessível a todos. Requisitos mínimos:

- Responsiva e utilizável de mobile a desktop.
- HTML semântico; imagens com `alt`; navegação por teclado funcional; contraste de cores
  adequado (WCAG AA como piso).
- Sem regressões perceptíveis de carregamento — imagens otimizadas, JavaScript mínimo, nada de
  bibliotecas pesadas para efeitos que CSS resolve.

**Rationale**: O site é a vitrine profissional pública. Lentidão ou barreiras de acessibilidade
afastam visitantes e depõem contra a imagem que o site existe para construir.

### III. Qualidade de Código e Testes

O código DEVE passar por lint e formatação automática configurados no projeto antes de ser
integrado. Toda lógica não-trivial (transformações, geração de conteúdo, componentes com
comportamento) DEVE ter testes automatizados. Conteúdo puramente estático e estilo não exigem
teste unitário, mas quebras de build e links quebrados DEVEM ser detectados automaticamente
quando houver ferramenta para isso.

**Rationale**: Testes e checagem automáticos são a rede de segurança que permite manter o site
sozinho, sem medo de que uma mudança pequena quebre algo silenciosamente.

### IV. Conteúdo como Dado Versionado

Conteúdo — projetos do portfólio, certificações, artigos, links do YouTube — DEVE ser tratado
como dado estruturado versionado em arquivos (ex.: Markdown, JSON, YAML), separado da camada de
apresentação. Adicionar ou editar uma certificação, artigo ou projeto NÃO DEVE exigir alterar
lógica de layout. Todo conteúdo publicado vive no controle de versão.

**Rationale**: Separar conteúdo de apresentação torna atualizações frequentes (novo artigo, nova
certificação) triviais e revisáveis via histórico do Git, sem tocar em código.

## Restrições Técnicas

- **Hospedagem**: o site DEVE ser publicável como **site estático** (ex.: GitHub Pages,
  Netlify). Nenhum backend, servidor de aplicação ou banco de dados é permitido sem uma emenda
  a esta constituição que justifique a necessidade.
- **Sem estado de servidor**: interações dinâmicas (ex.: contato) DEVEM usar serviços de
  terceiros ou soluções client-side compatíveis com hospedagem estática.
- **Escolha de stack**: definida no `/speckit.plan`, respeitando os Princípios I e II — preferir
  o mínimo de dependências e ferramentas de build.
- **Áreas de conteúdo previstas**: apresentação profissional (portfólio), certificações, canal
  do YouTube e artigos publicados.

## Fluxo de Desenvolvimento

- O desenvolvimento segue **Spec-Driven Development** via Spec Kit: `constitution` → `specify`
  → (`clarify`) → `plan` → `tasks` → (`analyze`) → `implement`.
- Todo trabalho de feature nasce de uma spec em `specs/NNN-.../`; nada de implementar sem spec e
  plano aprovados nos review gates do workflow.
- Cada feature vive em seu próprio branch numerado (`NNN-nome-curto`) e é integrada à `main`
  após revisão.
- O `/speckit.plan` DEVE validar a proposta contra os princípios desta constituição (Constitution
  Check). Qualquer violação DEVE ser justificada explicitamente ou o plano ajustado.

## Governance

Esta constituição é a autoridade máxima sobre as práticas de desenvolvimento do projeto e
prevalece sobre convenções ad-hoc. Emendas DEVEM ser feitas via `/speckit.constitution`,
registradas no histórico do Git com versão incrementada e data de emenda atualizada.

Versionamento semântico desta constituição:

- **MAJOR**: remoção ou redefinição incompatível de princípios/governança.
- **MINOR**: adição de novo princípio/seção ou expansão material de orientação.
- **PATCH**: esclarecimentos, correções de texto, refinamentos não-semânticos.

Toda revisão de mudança (PR ou equivalente) DEVE verificar conformidade com os princípios acima.
Complexidade que contrarie o Princípio I DEVE ser justificada por escrito. Para orientação de
desenvolvimento em tempo de execução, consulte `CLAUDE.md` e os templates em `.specify/templates/`.

**Version**: 1.0.0 | **Ratified**: 2026-07-24 | **Last Amended**: 2026-07-24
