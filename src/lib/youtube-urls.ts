// Helpers puros para URLs do YouTube (sem chamadas de rede/API).

/** Extrai o ID da playlist (parâmetro `list`) de uma URL do YouTube; null se ausente. */
export function extractPlaylistId(url: string): string | null {
  const match = url.match(/[?&]list=([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
}

/** Extrai o ID de um vídeo (watch?v=, youtu.be/, embed/) de uma URL; null se ausente. */
export function extractVideoId(url: string): string | null {
  const patterns = [
    /[?&]v=([a-zA-Z0-9_-]{11})/,
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    /embed\/([a-zA-Z0-9_-]{11})/,
  ];
  for (const re of patterns) {
    const m = url.match(re);
    if (m) return m[1];
  }
  return null;
}

/** URL da miniatura de um vídeo do YouTube (sem API). */
export function thumbnailUrl(videoId: string, quality: 'hq' | 'mq' | 'max' = 'hq'): string {
  const file = quality === 'max' ? 'maxresdefault' : quality === 'mq' ? 'mqdefault' : 'hqdefault';
  return `https://img.youtube.com/vi/${videoId}/${file}.jpg`;
}
