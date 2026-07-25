// Helpers puros de i18n (sem dependência de astro:content, para serem testáveis).

export const LOCALES = ['pt', 'en'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'pt';

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

/** Extrai o locale do primeiro segmento do path; cai no default se ausente/desconhecido. */
export function getLocaleFromPath(pathname: string): Locale {
  const first = pathname.replace(/^\/+/, '').split('/')[0] ?? '';
  return isLocale(first) ? first : DEFAULT_LOCALE;
}

/** Retorna o outro idioma. */
export function otherLocale(locale: Locale): Locale {
  return locale === 'pt' ? 'en' : 'pt';
}

/**
 * Troca o segmento de locale de um path (sem base). Se o path não começa com um
 * locale, prefixa o alvo. Preserva a barra final.
 */
export function switchLocalePath(pathname: string, target: Locale): string {
  const parts = pathname.split('/'); // ['', 'pt', ...]
  if (parts.length > 1 && isLocale(parts[1] ?? '')) {
    parts[1] = target;
    return parts.join('/');
  }
  return `/${target}${pathname}`;
}

/**
 * Resolve uma string de UI, com fallback para o outro idioma e, por fim, a própria
 * chave (atende ao edge case "idioma sem tradução").
 */
export function t(
  strings: Record<string, string>,
  key: string,
  fallback?: Record<string, string>,
): string {
  if (strings && typeof strings[key] === 'string' && strings[key] !== '') {
    return strings[key];
  }
  if (fallback && typeof fallback[key] === 'string' && fallback[key] !== '') {
    return fallback[key];
  }
  return key;
}
