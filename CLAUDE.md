# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repository is

This is a personal website (portfolio) for Luiz Fernando Castilho (GitHub repo `site`,
served at `.github.io/site/`; local folder is `SISTEMA_SitePessoal`), built as a
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

- **Videos are curated playlists, no API.** The "Vídeos" section highlights YouTube playlists as
  course cards (`playlists` collection). No YouTube Data API / key is used. Cover images come from
  `img.youtube.com/vi/{coverVideoId}/hqdefault.jpg` (a public thumbnail URL, no key). Helpers to
  parse YouTube URLs and build thumbnail URLs live in `src/lib/youtube-urls.ts`. To add a course,
  drop a JSON file in `src/content/playlists/` with `title_pt`, `title_en`, `url`, `coverVideoId`.

- **Only non-trivial logic is unit-tested** (`tests/unit/`): `i18n.ts` and `youtube-urls.ts`.
  Static content and presentation are not unit-tested; the format/type gates cover the rest.

## Conventions & gotchas

- Public asset paths must be base-prefixed: use `withBase(path, import.meta.env.BASE_URL)` from
  `src/lib/paths.ts` (the site deploys under a GitHub Pages base path, e.g. `/site`).
- External links (verification, videos, channel) open in a new tab (`target="_blank"
rel="noopener noreferrer"`). Contact is links only (email/social) — no contact form.
- Video titles come from YouTube in the channel's language and are intentionally exempt from the
  bilingual requirement (see spec FR-008); everything else must have PT and EN versions with
  matching UI-string keys across `src/content/ui/pt.json` and `en.json`.
- Env vars (see `.env.example`): `SITE_URL`, `BASE_PATH` (read by `astro.config.mjs`).
- Deploy: pushing to `main` runs `.github/workflows/deploy.yml` (static build → GitHub Pages).
  Sample content under `src/content/certifications` and `src/content/articles` (+ `public/articles/`)
  is placeholder — replace with real data.

## Spec-Driven Development

Feature specs live in `specs/NNN-.../` (see `specs/001-homepage-portfolio/` for spec, plan,
research, data-model, contracts, tasks). Development is driven by `speckit-*` skills invoked as
`/speckit.*` slash commands: `constitution → specify → clarify → plan → tasks → analyze →
implement`. The project constitution is `.specify/memory/constitution.md` (v1.0.0) — its four
principles (simplicity/YAGNI, performance & accessibility, code quality & tests, content as
versioned data) govern all changes. Do not edit files under `.specify/templates/` or
`.specify/scripts/` to customize behavior — use the override/preset/extension layers.
