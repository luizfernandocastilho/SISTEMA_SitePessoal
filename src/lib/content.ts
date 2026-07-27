import { getCollection, getEntry } from 'astro:content';
import { DEFAULT_LOCALE, otherLocale, type Locale } from './i18n';

/** Carrega as strings de UI do idioma + as do idioma de fallback. */
export async function getUi(locale: Locale) {
  const entry = await getEntry('ui', locale);
  const fallbackEntry = await getEntry('ui', otherLocale(locale));
  return {
    strings: (entry?.data.strings ?? {}) as Record<string, string>,
    fallback: (fallbackEntry?.data.strings ?? {}) as Record<string, string>,
  };
}

/** Perfil (item único). */
export async function getProfile() {
  const all = await getCollection('profile');
  return all[0]?.data ?? null;
}

/** Certificações ordenadas por `order` (asc) e depois ano desc. */
export async function getCertifications() {
  const all = await getCollection('certifications');
  return all.map((e) => e.data).sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || b.year - a.year);
}

/** Artigos ordenados por `order` (asc) e depois data desc. */
export async function getArticles() {
  const all = await getCollection('articles');
  return all
    .map((e) => e.data)
    .sort(
      (a, b) =>
        (a.order ?? 0) - (b.order ?? 0) || b.publishedAt.getTime() - a.publishedAt.getTime(),
    );
}

/** Playlists/cursos curados, ordenados por `order` (asc). */
export async function getPlaylists() {
  const all = await getCollection('playlists');
  return all.map((e) => e.data).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

export { DEFAULT_LOCALE, type Locale };
