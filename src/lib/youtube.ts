import { readFile, writeFile } from 'node:fs/promises';

export interface Video {
  id: string;
  title: string;
  thumbnail: string;
  url: string;
  publishedAt: string;
}

export interface FetchVideosOptions {
  channelId: string;
  apiKey: string | undefined;
  maxVideos?: number;
  cachePath: string;
}

interface ApiThumbnails {
  maxres?: { url: string };
  standard?: { url: string };
  high?: { url: string };
  medium?: { url: string };
  default?: { url: string };
}

interface ApiItem {
  snippet?: {
    title?: string;
    publishedAt?: string;
    resourceId?: { videoId?: string };
    thumbnails?: ApiThumbnails;
  };
}

function pickThumbnail(thumbs?: ApiThumbnails): string {
  if (!thumbs) return '';
  return (
    thumbs.maxres?.url ??
    thumbs.standard?.url ??
    thumbs.high?.url ??
    thumbs.medium?.url ??
    thumbs.default?.url ??
    ''
  );
}

function normalize(items: ApiItem[]): Video[] {
  return items
    .map((it): Video | null => {
      const id = it.snippet?.resourceId?.videoId;
      if (!id) return null;
      return {
        id,
        title: it.snippet?.title ?? '',
        thumbnail: pickThumbnail(it.snippet?.thumbnails),
        url: `https://www.youtube.com/watch?v=${id}`,
        publishedAt: it.snippet?.publishedAt ?? '',
      };
    })
    .filter((v): v is Video => v !== null)
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

async function readCache(cachePath: string, maxVideos: number): Promise<Video[]> {
  try {
    const raw = await readFile(cachePath, 'utf-8');
    const parsed = JSON.parse(raw) as Video[];
    return Array.isArray(parsed) ? parsed.slice(0, maxVideos) : [];
  } catch {
    return [];
  }
}

async function writeCache(cachePath: string, videos: Video[]): Promise<void> {
  try {
    await writeFile(cachePath, JSON.stringify(videos, null, 2), 'utf-8');
  } catch {
    // Falha ao gravar cache não deve quebrar o build.
  }
}

/**
 * Retorna os vídeos do canal para exibição. Consulta a API do YouTube em build;
 * em falta de chave ou erro, cai no cache; nunca lança (ver contracts/youtube-fetch.md).
 */
export async function getChannelVideos(opts: FetchVideosOptions): Promise<Video[]> {
  const { channelId, apiKey, cachePath } = opts;
  const maxVideos = opts.maxVideos ?? 6;

  if (!apiKey || !channelId) {
    return readCache(cachePath, maxVideos);
  }

  try {
    // A "uploads playlist" de um canal UCxxxx é UUxxxx (mesmo sufixo).
    const uploadsPlaylistId = `UU${channelId.slice(2)}`;
    const url =
      'https://www.googleapis.com/youtube/v3/playlistItems' +
      `?part=snippet&maxResults=${Math.min(maxVideos, 50)}` +
      `&playlistId=${uploadsPlaylistId}&key=${apiKey}`;

    const res = await fetch(url);
    if (!res.ok) throw new Error(`YouTube API HTTP ${res.status}`);
    const data = (await res.json()) as { items?: ApiItem[] };
    const videos = normalize(data.items ?? []).slice(0, maxVideos);
    await writeCache(cachePath, videos);
    return videos;
  } catch {
    return readCache(cachePath, maxVideos);
  }
}
