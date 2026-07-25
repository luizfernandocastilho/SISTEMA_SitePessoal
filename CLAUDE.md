# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repository is

`SISTEMA_SitePessoal` is a personal website (portfolio) for Luiz Fernando Castilho, built as a
**static site with [Astro](https://astro.build) 5** and managed with **GitHub Spec Kit**
(Spec-Driven Development). The homepage is bilingual (PT/EN) and shows four sections: a
professional presentation, certifications, published articles (PDF downloads), and videos pulled
from a YouTube channel at build time.

## Commands

```bash
npm install        # install dependencies
npm run dev        # local dev server (http://localhost:4321)
npm run build      # static build → dist/ (fetches YouTube videos here)
npm run preview    # serve the built dist/
npm run check      # astro check (types + content collection schemas)
npm test           # Vitest (run once); npm run test:watch for watch mode
npm run lint       # prettier --check .   (format gate)
npm run format     # prettier --write .
```

Run a single test file: `npx vitest run tests/unit/youtube.test.ts`.

Quality gate before committing: `npm run check && npm test && npm run lint`.

## Architecture (the big picture)

- **Content is data, separated from layout** (constitution Principle IV). All owner-maintained
  content lives in versioned **Astro content collections** under `src/content/`, with Zod schemas
  in `src/content.config.ts`: `profile` (single bilingual item), `certifications`, `articles`
  (metadata; the PDF itself sits in `public/articles/`), and `ui` (interface strings, one file per
  locale). Adding a certification or article means editing content only — never layout.

- **Page assembly is centralized.** `src/pages/{pt,en}/index.astro` are thin wrappers that both
  render `src/components/Home.astro` with their locale. `Home.astro` loads all data via
  `src/lib/content.ts`, decides which sections are present (empty sections are omitted, which also
  drives the header nav), and composes `Hero`, `Certifications`, `Articles`, and `Videos`.
  `src/pages/index.astro` is a static redirect to `/pt`.

- **i18n without runtime JS.** Astro i18n routing (`defaultLocale: pt`, `locales: [pt, en]`, see
  `astro.config.mjs`). The language toggle is a plain link (`LanguageToggle.astro` via
  `getRelativeLocaleUrl`). Pure, tested helpers live in `src/lib/i18n.ts`; `t(strings, key,
fallback)` resolves a UI string with fallback to the other locale then the key itself.

- **YouTube videos are fetched at build, never at runtime.** `src/lib/youtube.ts`
  (`getChannelVideos`) calls the YouTube Data API v3 during the build, normalizes results, writes
  `src/data/youtube-cache.json`, and **never throws** — on missing key or API error it falls back
  to the cache, else returns `[]` (section is then omitted). The API key stays in `YOUTUBE_API_KEY`
  and is never shipped to the browser. `content.ts` memoizes the fetch to one call per build shared
  across both locales. This is what keeps a live-data feature compatible with static hosting.

- **Only non-trivial logic is unit-tested** (`tests/unit/`): `i18n.ts` and `youtube.ts`. Static
  content and presentation are not unit-tested; the format/type gates cover the rest.

## Conventions & gotchas

- Public asset paths must be base-prefixed: use `withBase(path, import.meta.env.BASE_URL)` from
  `src/lib/paths.ts` (the site deploys under a GitHub Pages base path, e.g. `/SISTEMA_SitePessoal`).
- External links (verification, videos, channel) open in a new tab (`target="_blank"
rel="noopener noreferrer"`). Contact is links only (email/social) — no contact form.
- Video titles come from YouTube in the channel's language and are intentionally exempt from the
  bilingual requirement (see spec FR-008); everything else must have PT and EN versions with
  matching UI-string keys across `src/content/ui/pt.json` and `en.json`.
- Env vars (see `.env.example`): `YOUTUBE_API_KEY`, `CHANNEL_ID`, `MAX_VIDEOS`, `SITE_URL`,
  `BASE_PATH`. `astro.config.mjs` reads `SITE_URL`/`BASE_PATH`.
- Deploy: pushing to `main` runs `.github/workflows/deploy.yml` (build with the `YOUTUBE_API_KEY`
  secret → GitHub Pages). Sample content under `src/content/` and `public/articles/` is
  placeholder — replace with real data.

## Spec-Driven Development

Feature specs live in `specs/NNN-.../` (see `specs/001-homepage-portfolio/` for spec, plan,
research, data-model, contracts, tasks). Development is driven by `speckit-*` skills invoked as
`/speckit.*` slash commands: `constitution → specify → clarify → plan → tasks → analyze →
implement`. The project constitution is `.specify/memory/constitution.md` (v1.0.0) — its four
principles (simplicity/YAGNI, performance & accessibility, code quality & tests, content as
versioned data) govern all changes. Do not edit files under `.specify/templates/` or
`.specify/scripts/` to customize behavior — use the override/preset/extension layers.
