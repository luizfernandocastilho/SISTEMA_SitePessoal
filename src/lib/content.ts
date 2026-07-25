import { getCollection, getEntry } from 'astro:content';
import { DEFAULT_LOCALE, otherLocale, type Locale } from './i18n';
import { getChannelVideos, type Video } from './youtube';

const CHANNEL_ID = process.env.CHANNEL_ID ?? '';
const MAX_VIDEOS = Number(process.env.MAX_VIDEOS ?? 6);

// Memoiza o fetch para uma única chamada de API por build (compartilhada por pt/en).
let videosPromise: Promise<Video[]> | null = null;

/** Vídeos do canal, obtidos em build (com fallback em cache). */
export function getVideos(): Promise<Video[]> {
  if (!videosPromise) {
    videosPromise = getChannelVideos({
      channelId: CHANNEL_ID,
      apiKey: process.env.YOUTUBE_API_KEY,
      maxVideos: Number.isFinite(MAX_VIDEOS) ? MAX_VIDEOS : 6,
      cachePath: 'src/data/youtube-cache.json',
    });
  }
  return videosPromise;
}

/** URL do canal (para o link "visitar canal"), ou null se não configurado. */
export function getChannelUrl(): string | null {
  return CHANNEL_ID ? `https://www.youtube.com/channel/${CHANNEL_ID}` : null;
}

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
  return all
    .map((e) => e.data)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || b.year - a.year);
}

/** Artigos ordenados por `order` (asc) e depois data desc. */
export async function getArticles() {
  const all = await getCollection('articles');
  return all
    .map((e) => e.data)
    .sort(
      (a, b) =>
        (a.order ?? 0) - (b.order ?? 0) ||
        b.publishedAt.getTime() - a.publishedAt.getTime()
    );
}

export { DEFAULT_LOCALE, type Locale };
