/** Prefixa um caminho de asset público com a base configurada do site. */
export function withBase(path: string, base: string): string {
  return `${base.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
}
