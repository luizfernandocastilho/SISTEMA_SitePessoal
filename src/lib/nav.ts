import { getRelativeLocaleUrl } from 'astro:i18n';
import type { Locale } from './i18n';

/**
 * Itens do menu principal. Cada item tem um `slug` por idioma (URLs localizadas) e
 * uma chave de string de UI para o rótulo. A home usa slug vazio.
 * Build-only (usa astro:i18n) — a lógica pura/testável de i18n fica em `i18n.ts`.
 */
export interface NavItem {
  key: string;
  labelKey: string;
  slugs: Record<Locale, string>;
}

export const NAV_ITEMS: NavItem[] = [
  { key: 'home', labelKey: 'navAbout', slugs: { pt: '', en: '' } },
  {
    key: 'certifications',
    labelKey: 'navCertifications',
    slugs: { pt: 'certificacoes', en: 'certifications' },
  },
  { key: 'articles', labelKey: 'navArticles', slugs: { pt: 'artigos', en: 'articles' } },
];

/** URL (base-prefixada) de um item no idioma dado. */
export function navUrl(item: NavItem, locale: Locale): string {
  return getRelativeLocaleUrl(locale, item.slugs[locale]);
}

/** URL da mesma página no outro idioma (preserva a página no toggle de idioma). */
export function counterpartUrl(navKey: string, target: Locale): string {
  const item = NAV_ITEMS.find((i) => i.key === navKey);
  return getRelativeLocaleUrl(target, item ? item.slugs[target] : '');
}
