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
        .array(z.object({ label: z.string(), url: z.string().url() }))
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

// Strings de interface — um arquivo por idioma (pt.json, en.json).
const ui = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/ui' }),
  schema: z.object({
    locale: z.enum(['pt', 'en']),
    strings: z.record(z.string()),
  }),
});

export const collections = { profile, certifications, articles, ui };
