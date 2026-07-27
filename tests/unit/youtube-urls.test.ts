import { describe, it, expect } from 'vitest';
import { extractPlaylistId, extractVideoId, thumbnailUrl } from '../../src/lib/youtube-urls';

describe('youtube-urls helpers', () => {
  it('extractPlaylistId pega o parâmetro list', () => {
    expect(
      extractPlaylistId('https://www.youtube.com/playlist?list=PLvuCUpGxDPkOpqOv8QPBumPSbh7aY7fV7'),
    ).toBe('PLvuCUpGxDPkOpqOv8QPBumPSbh7aY7fV7');
    expect(extractPlaylistId('https://www.youtube.com/watch?v=abc&list=PL123')).toBe('PL123');
  });

  it('extractPlaylistId retorna null sem list', () => {
    expect(extractPlaylistId('https://www.youtube.com/watch?v=abcdefghijk')).toBeNull();
  });

  it('extractVideoId cobre formatos comuns', () => {
    expect(extractVideoId('https://www.youtube.com/watch?v=NbABMisHU3A')).toBe('NbABMisHU3A');
    expect(extractVideoId('https://youtu.be/NbABMisHU3A')).toBe('NbABMisHU3A');
    expect(extractVideoId('https://www.youtube.com/embed/NbABMisHU3A')).toBe('NbABMisHU3A');
  });

  it('extractVideoId retorna null quando não há vídeo', () => {
    expect(extractVideoId('https://www.youtube.com/playlist?list=PL123')).toBeNull();
  });

  it('thumbnailUrl monta a URL da miniatura', () => {
    expect(thumbnailUrl('NbABMisHU3A')).toBe(
      'https://img.youtube.com/vi/NbABMisHU3A/hqdefault.jpg',
    );
    expect(thumbnailUrl('NbABMisHU3A', 'max')).toBe(
      'https://img.youtube.com/vi/NbABMisHU3A/maxresdefault.jpg',
    );
  });
});
