// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// URL final do site (ajuste para o seu domínio/GitHub Pages).
// Ex.: 'https://luizfernandocastilho.github.io' com base '/site'.
const SITE = process.env.SITE_URL || 'https://luizfernandocastilho.github.io';
const BASE = process.env.BASE_PATH || '/site';

export default defineConfig({
  site: SITE,
  base: BASE,
  trailingSlash: 'ignore',
  i18n: {
    defaultLocale: 'pt',
    locales: ['pt', 'en'],
    routing: {
      prefixDefaultLocale: true,
      redirectToDefaultLocale: false,
    },
  },
  integrations: [sitemap()],
});
