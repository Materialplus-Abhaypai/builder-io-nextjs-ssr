# Builder App (Next.js + Builder.io)

Production-ready Next.js app integrated with Builder.io (REST API). Supports ISR and full static export, article detail pages, and dynamic "page" model routing.

## Quick Start

1) Set env vars (Settings > Env):
- NEXT_PUBLIC_BUILDER_API_KEY

2) Develop
- npm run dev → http://localhost:3000

3) Build / Run
- npm run build && npm start

## Rendering Overview

- Page model (REST): app/[[...page]]/page.tsx
  - Renders by data.url (e.g., "/", "/home").
  - ISR: revalidate=60
  - Static params generated up to 100k paths (batched).

- Article model (REST):
  - List: app/article/page.tsx
  - Detail: app/article/[slug]/page.tsx (matches by data.url, then data.slug; shows title, image, date)
  - ISR: revalidate=60
  - Static params generated up to 100k slugs (batched).

- Navigation (REST): src/components/site-header.tsx
  - Reads first "navigation-links" entry; auto-detects links array with url/link + text.

## Project Structure

- src/app
  - [[...page]]/page.tsx → Page model renderer (dynamic segments)
  - article/
    - page.tsx → Article listing (paginated)
    - [slug]/page.tsx → Article detail
  - globals.css, layout.tsx
- src/components
  - builder.tsx → RenderBuilderContent wrapper
  - site-header.tsx → Reusable header
- src/lib
  - builder-rest.ts → Central REST data-access (SDK init, helpers, pagination, normalization)
- builder-registry.ts → Builder component registry

## Data Access (REST-only)

Centralized in src/lib/builder-rest.ts:
- fetchPageByPath(urlPath)
- fetchNavigationLinks()
- fetchArticleByUrl(url), fetchArticleBySlug(slug), fetchArticleByScan(url)
- fetchArticlesPaginated(limit, offset)
- fetchAllPagePaths(max, limit), fetchAllArticleSlugs(max, limit)
- REVALIDATE_SECONDS = 60

These helpers ensure:
- Normalized URLs (leading/trailing slash handling)
- noTargeting + includeRefs for consistent fetches
- Safe batching for up to 100k+ entries

## Static Generation Modes

- ISR (default)
  - Revalidate after 60s
  - generateStaticParams uses batched getAll

- Full Static Export (optional)
  - Set NEXT_OUTPUT_MODE=export (see next.config.ts)
  - Build: NEXT_OUTPUT_MODE=export npm run build
  - Output: out/

## Conventions

- Styling: preserve existing class names, variables, media queries; use utility classes; avoid inline styles.
- Components: small, composable, and typed where appropriate.
- Data: do not hardcode content; always fetch from Builder.
- Routing: slugs and URLs are normalized; unknown paths 404 in export mode.

## Troubleshooting

- 404 on /article/{slug}: ensure article.data.url matches (e.g., "/first-article") and is Published.
- Failed to fetch: verify NEXT_PUBLIC_BUILDER_API_KEY; check network requests in DevTools.
- No navigation: ensure a "navigation-links" entry exists with list items containing url/link and text.

## Scripts

- dev: next dev
- build: next build
- start: next start
- lint: eslint

## License

MIT
