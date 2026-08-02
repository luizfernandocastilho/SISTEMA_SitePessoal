import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Perfil — item único com campos bilíngues (ver contracts/content-collections.md).
const profile = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/profile' }),
  schema: z
    .object({
      name: z.string(),
      headline_pt: z.string(),
      headline_en: z.string(),
      // Bio da home (um item por parágrafo), logo após a headline.
      bio_pt: z.array(z.string()).optional(),
      bio_en: z.array(z.string()).optional(),
      email: z.string().email(),
      socialLinks: z
        .array(
          z.object({
            label: z.string(),
            url: z.string().url(),
            icon: z.enum(['github', 'youtube', 'linkedin', 'bluesky', 'x', 'orcid']).optional(),
          }),
        )
        .default([]),
      photo: z.string().optional(),
      photoAlt_pt: z.string().optional(),
      photoAlt_en: z.string().optional(),
    })
    .refine((d) => !d.photo || (!!d.photoAlt_pt && !!d.photoAlt_en), {
      message: 'photoAlt_pt e photoAlt_en são obrigatórios quando photo está presente',
    })
    .refine((d) => !!d.bio_pt === !!d.bio_en, {
      message: 'bio_pt e bio_en devem estar ambos presentes (site bilíngue)',
    }),
});

// Certificações — um item por arquivo.
const certifications = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/certifications' }),
  schema: z.object({
    name: z.string(),
    issuer: z.string(),
    year: z.number().int().gte(1900).lte(2100),
    verifyUrl: z.string().url().optional(),
    order: z.number().optional(),
  }),
});

// Artigos — metadados; o PDF vive em public/articles/.
const articles = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/articles' }),
  schema: z
    .object({
      title_pt: z.string(),
      title_en: z.string(),
      publishedAt: z.coerce.date(),
      venue: z.string(),
      pdf: z.string().optional(),
      order: z.number().optional(),
      // Gate de download por e-mail (arquivo no backend, servido por token).
      gated: z.boolean().optional(),
      fileId: z.string().optional(),
    })
    .refine((d) => !!d.pdf || (d.gated === true && !!d.fileId), {
      message: 'Informe pdf (arquivo em public/) ou gated + fileId (backend)',
    }),
});

// Keynotes — apresentações/decks. Aponta para `url` (externo) ou `pdf` (public/).
// `cover` opcional (imagem da capa do deck). Um item por arquivo.
const keynotes = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/keynotes' }),
  schema: z
    .object({
      title_pt: z.string(),
      title_en: z.string(),
      url: z.string().url().optional(),
      pdf: z.string().optional(),
      cover: z.string().optional(),
      date: z.coerce.date().optional(),
      order: z.number().optional(),
      // Gate de download por e-mail: o arquivo vive no backend (api/storage) e é
      // servido só por token. `fileId` casa com o id da tabela `files` do backend.
      gated: z.boolean().optional(),
      fileId: z.string().optional(),
    })
    .refine((d) => !!d.url || !!d.pdf || (d.gated === true && !!d.fileId), {
      message: 'Informe url (externo), pdf (arquivo em public/) ou gated + fileId (backend)',
    }),
});

// Atuação — áreas de atuação profissional em cards (padrão Keynotes). Cada card tem
// título/descrição bilíngues; `url`/`pdf`/`cover` são opcionais (um card pode ser só
// descritivo). Um item por arquivo.
const atuacao = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/atuacao' }),
  schema: z.object({
    title_pt: z.string(),
    title_en: z.string(),
    description_pt: z.string().optional(),
    description_en: z.string().optional(),
    // Texto elaborado da página da área: parágrafos + destaques (bilíngue).
    body_pt: z.array(z.string()).optional(),
    body_en: z.array(z.string()).optional(),
    highlights_pt: z.array(z.string()).optional(),
    highlights_en: z.array(z.string()).optional(),
    url: z.string().url().optional(),
    pdf: z.string().optional(),
    cover: z.string().optional(),
    order: z.number().optional(),
    // Ícone temático do card (renderizado por AtuacaoIcon.astro).
    icon: z
      .enum([
        'governance',
        'project',
        'process',
        'risk',
        'crisis',
        'continuity',
        'change',
        'ai',
        'portfolio',
        'data',
      ])
      .optional(),
  }),
});

// Livros — publicações do tipo livro. Capa opcional; `url` (compra/leitura) ou
// `pdf` (arquivo em public/) opcionais. Um item por arquivo.
const livros = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/livros' }),
  schema: z.object({
    title: z.string(),
    author: z.string().optional(),
    year: z.number().int().gte(1900).lte(2100).optional(),
    publisher: z.string().optional(),
    description_pt: z.string().optional(),
    description_en: z.string().optional(),
    cover: z.string().optional(),
    url: z.string().url().optional(),
    pdf: z.string().optional(),
    order: z.number().optional(),
  }),
});

// Strings de interface — um arquivo por idioma (pt.json, en.json).
const ui = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/ui' }),
  schema: z.object({
    locale: z.enum(['pt', 'en']),
    strings: z.record(z.string()),
  }),
});

export const collections = { profile, certifications, articles, keynotes, atuacao, livros, ui };
