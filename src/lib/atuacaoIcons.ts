/** Chaves dos ícones temáticos das áreas de Atuação (ver AtuacaoIcon.astro). */
export const ATUACAO_ICONS = [
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
] as const;

export type AtuacaoIconName = (typeof ATUACAO_ICONS)[number];
