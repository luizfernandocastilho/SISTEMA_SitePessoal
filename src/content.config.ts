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
            icon: z.enum(['github', 'youtube', 'linkedin', 'bluesky', 'x']).optional(),
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

// Artigos — metadados; o arquivo é privado no backend (referenciado por `fileId`,
// baixado via gate por e-mail — não fica em public/).
const articles = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/articles' }),
  schema: z.object({
    title_pt: z.string(),
    title_en: z.string(),
    publishedAt: z.coerce.date(),
    venue: z.string(),
    fileId: z.string(),
    order: z.number().optional(),
  }),
});

// Recursos — links/downloads úteis. Aponta para `url` (link externo direto) OU `fileId`
// (arquivo privado no backend, baixado via gate por e-mail). Um item por arquivo.
const resources = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/resources' }),
  schema: z
    .object({
      title_pt: z.string(),
      title_en: z.string(),
      description_pt: z.string().optional(),
      description_en: z.string().optional(),
      url: z.string().url().optional(),
      fileId: z.string().optional(),
      order: z.number().optional(),
    })
    .refine((d) => !!d.url || !!d.fileId, {
      message: 'Informe url (externo) ou fileId (arquivo privado no backend)',
    }),
});

// Keynotes — apresentações/decks. Aponta para `url` (link externo direto) OU `fileId`
// (arquivo privado no backend). `cover` opcional (capa). Um item por arquivo.
const keynotes = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/keynotes' }),
  schema: z
    .object({
      title_pt: z.string(),
      title_en: z.string(),
      url: z.string().url().optional(),
      fileId: z.string().optional(),
      cover: z.string().optional(),
      date: z.coerce.date().optional(),
      order: z.number().optional(),
    })
    .refine((d) => !!d.url || !!d.fileId, {
      message: 'Informe url (externo) ou fileId (arquivo privado no backend)',
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
