import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('node:fs/promises', () => ({
  readFile: vi.fn(),
  writeFile: vi.fn(),
}));

import { readFile, writeFile } from 'node:fs/promises';
import { getChannelVideos } from '../../src/lib/youtube';

const CACHE = '/tmp/youtube-cache.test.json';
const CHANNEL = 'UC1234567890abcdefghABCD';
const KEY = 'fake-key';

function apiItem(id: string, publishedAt: string, withThumb = true) {
  return {
    snippet: {
      title: `Vídeo ${id}`,
      publishedAt,
      resourceId: { videoId: id },
      thumbnails: withThumb ? { high: { url: `https://i.ytimg.com/${id}.jpg` } } : {},
    },
  };
}

function mockFetchOnce(payload: unknown, ok = true, status = 200) {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => ({
      ok,
      status,
      json: async () => payload,
    }))
  );
}

beforeEach(() => {
  vi.mocked(readFile).mockReset();
  vi.mocked(writeFile).mockReset();
  vi.mocked(writeFile).mockResolvedValue(undefined as never);
  vi.unstubAllGlobals();
});

describe('getChannelVideos', () => {
  it('normaliza uma resposta válida da API e grava o cache', async () => {
    mockFetchOnce({
      items: [apiItem('aaa', '2024-01-01T00:00:00Z'), apiItem('bbb', '2024-02-01T00:00:00Z')],
    });
    const videos = await getChannelVideos({ channelId: CHANNEL, apiKey: KEY, cachePath: CACHE });
    expect(videos).toHaveLength(2);
    // ordenado por data desc
    expect(videos[0].id).toBe('bbb');
    expect(videos[0].url).toBe('https://www.youtube.com/watch?v=bbb');
    expect(videos[0].thumbnail).toContain('bbb.jpg');
    expect(writeFile).toHaveBeenCalledTimes(1);
  });

  it('respeita maxVideos e ordena por data desc', async () => {
    const items = Array.from({ length: 20 }, (_, i) =>
      apiItem(`v${i}`, `2024-01-${String(i + 1).padStart(2, '0')}T00:00:00Z`)
    );
    mockFetchOnce({ items });
    const videos = await getChannelVideos({
      channelId: CHANNEL,
      apiKey: KEY,
      maxVideos: 6,
      cachePath: CACHE,
    });
    expect(videos).toHaveLength(6);
    expect(videos[0].id).toBe('v19'); // mais recente
  });

  it('sem apiKey, usa o cache existente', async () => {
    vi.mocked(readFile).mockResolvedValue(
      JSON.stringify([
        { id: 'c1', title: 'Cache 1', thumbnail: '', url: 'u', publishedAt: '2024-01-01' },
      ]) as never
    );
    const videos = await getChannelVideos({
      channelId: CHANNEL,
      apiKey: undefined,
      cachePath: CACHE,
    });
    expect(videos).toHaveLength(1);
    expect(videos[0].id).toBe('c1');
  });

  it('sem apiKey e sem cache, retorna []', async () => {
    vi.mocked(readFile).mockRejectedValue(new Error('ENOENT') as never);
    const videos = await getChannelVideos({
      channelId: CHANNEL,
      apiKey: undefined,
      cachePath: CACHE,
    });
    expect(videos).toEqual([]);
  });

  it('erro/HTTP 403 da API, cai no cache sem lançar', async () => {
    mockFetchOnce({}, false, 403);
    vi.mocked(readFile).mockResolvedValue(
      JSON.stringify([
        { id: 'c1', title: 'Cache 1', thumbnail: '', url: 'u', publishedAt: '2024-01-01' },
      ]) as never
    );
    const videos = await getChannelVideos({ channelId: CHANNEL, apiKey: KEY, cachePath: CACHE });
    expect(videos).toHaveLength(1);
    expect(videos[0].id).toBe('c1');
  });

  it('API falha e sem cache, retorna [] sem lançar', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new Error('network');
      })
    );
    vi.mocked(readFile).mockRejectedValue(new Error('ENOENT') as never);
    const videos = await getChannelVideos({ channelId: CHANNEL, apiKey: KEY, cachePath: CACHE });
    expect(videos).toEqual([]);
  });

  it('item sem thumbnail mantém o vídeo com thumbnail vazia', async () => {
    mockFetchOnce({ items: [apiItem('nothumb', '2024-01-01T00:00:00Z', false)] });
    const videos = await getChannelVideos({ channelId: CHANNEL, apiKey: KEY, cachePath: CACHE });
    expect(videos).toHaveLength(1);
    expect(videos[0].thumbnail).toBe('');
  });
});
