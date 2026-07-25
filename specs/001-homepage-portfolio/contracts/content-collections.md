# Contract: Content Collections (schemas)

Define os schemas Zod das _content collections_ em `src/content.config.ts`. Este é o contrato entre
o conteúdo versionado (editável pelo dono) e o layout. Adicionar/editar itens NÃO deve exigir
mudança de layout (SC-005). Tipos aqui refletem [data-model.md](../data-model.md).

## `profile`

```ts
// coleção 'profile' — item único (bilíngue)
{
  name: string,               // obrigatório
  headline_pt: string,        // obrigatório
  headline_en: string,        // obrigatório
  email: string,              // formato email
  socialLinks: Array<{ label: string, url: string /* url() */ }>,  // default []
  photo?: string,             // path relativo em public/
  photoAlt_pt?: string,       // obrigatório se photo presente
  photoAlt_en?: string,       // obrigatório se photo presente
}
```

Regra de validação cruzada: se `photo` presente, `photoAlt_pt` e `photoAlt_en` são obrigatórios.

## `certifications`

```ts
{
  name: string,
  issuer: string,
  year: number,               // inteiro, 4 dígitos
  verifyUrl?: string,         // url()
  order?: number,
}
```

Ordenação default: `year` desc, depois `name`.

## `articles`

```ts
{
  title_pt: string,
  title_en: string,
  publishedAt: Date,          // ISO YYYY-MM-DD
  venue: string,
  pdf: string,                // path em public/articles/*.pdf
  order?: number,
}
```

Ordenação default: `publishedAt` desc.

## `ui`

```ts
// um item por locale
{
  locale: 'pt' | 'en',
  strings: Record<string, string>,
}
```

Invariante testável: `Object.keys(ui.pt.strings)` === `Object.keys(ui.en.strings)` (mesmas chaves).

## Critérios de aceite do contrato

- Um item inválido (campo obrigatório ausente, url malformada, pdf inexistente) falha o build com
  mensagem clara (`astro check` / validação de collection).
- Nenhum componente de layout lê caminhos hardcoded de conteúdo — tudo via a API de collections.
