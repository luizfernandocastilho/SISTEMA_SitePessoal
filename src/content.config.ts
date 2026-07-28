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
  schema: z.object({
    title_pt: z.string(),
    title_en: z.string(),
    publishedAt: z.coerce.date(),
    venue: z.string(),
    pdf: z.string(),
    order: z.number().optional(),
  }),
});

// Recursos — links/downloads úteis. Cada item aponta para `url` (externo) ou `pdf`
// (arquivo em public/). Um item por arquivo.
const resources = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/resources' }),
  schema: z
    .object({
      title_pt: z.string(),
      title_en: z.string(),
      description_pt: z.string().optional(),
      description_en: z.string().optional(),
      url: z.string().url().optional(),
      pdf: z.string().optional(),
      order: z.number().optional(),
    })
    .refine((d) => !!d.url || !!d.pdf, {
      message: 'Informe url (externo) ou pdf (arquivo em public/)',
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
    })
    .refine((d) => !!d.url || !!d.pdf, {
      message: 'Informe url (externo) ou pdf (arquivo em public/)',
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

export const collections = { profile, certifications, articles, resources, keynotes, ui };
