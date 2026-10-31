# ADR 0001 — i18n routing and content model

> Status: **Accepted** (31.10.2026)  
> Stage: Design Foundation → start of Public Migration (RU/EN slice)  
> Supersedes conflicting ROADMAP backlog label «0001 Database» (Database ADR renumbered to **0002** in ROADMAP).

## Context

Production already ships **RU** (unprefixed) and **EN** (`/en/…`). Owner plans **sr**, **hy**, **ka**, **de**. Catalog holds locale-invariant specs and localized copy; RU↔EN slugs sometimes differ. UI strings were hard-coded in components. Menu overlays incorrectly shared `inert` with their own controls.

## Decision

### 1. Locale registry (`src/i18n/locales.ts`)

| Set | Locales | Role |
|---|---|---|
| `ALL_LOCALES` | `ru`, `en`, `sr`, `hy`, `ka`, `de` | Type + content keys |
| `PUBLISHED_LOCALES` | `ru`, `en` | Routed URLs, switcher, sitemap, hreflang |
| `PLANNED_LOCALES` | `sr`, `hy`, `ka`, `de` | Reserved; **no routes** until translation + fonts |

- **Default locale:** `ru` (no URL prefix).
- **Serbian script:** **Open** — `sr-Latn` / `sr-Cyrl` / both. Until decided, `sr` stays planned only; Latn/Cyrl are **scripts**, not regions.
- Language is independent of country, currency, assortment, and commercial terms (those are separate config later).

### 2. Routing (next-intl + Next.js 16 `src/proxy.ts`)

- Library: **next-intl** (dependency justified: App Router locale segment, `localePrefix: 'as-needed'`, typed navigation).
- `localePrefix: 'as-needed'` → `/beer`, `/en/beer`, later `/de/beer` when published.
- `localeDetection: false` → language **only from URL** (no Accept-Language / cookie redirects).
- `alternateLinks: false` → hreflang via Metadata API (only published peers).
- App tree: `src/app/[locale]/…`; `<html lang>` set in locale layout from `LOCALE_HTML_LANG`.

### 3. Content vs UI messages

- **UI chrome** (nav, age gate, filters, footer, a11y): `messages/{locale}.json` via next-intl.
- **Product body**: `src/content/catalog.ts` over fixtures in `product-props.ts` — stable **`id`**, shared **specs/image/badges/category**, per-locale **translations** with `status: published | draft | missing`.
- Listing: `getCatalogCards(locale)` — server prepares cards for one locale; client gallery does not receive all translations.
- Resolver: `resolveProduct(locale, slug)` — match `(locale, slug)` or aliases; cross-locale slug finds entity for redirect to canonical slug of the **active** locale.
- Locale switch keeps the **same product id** via `localeHrefs` (e.g. RU `milk-of-amnesia-v-tropic` ↔ EN `milk-of-amnesia`).

### 4. Fallback vs publication (separated)

| Concern | Rule |
|---|---|
| Missing **string** | Fallback chain `active → en → ru`; never invent copy |
| Missing / draft **translation** | **No public URL**, no switcher link, no hreflang, `notFound()` on that locale path |
| Planned locale | Not in `routing.locales`; `productPublicPath('de', …)` must not be linked |

Legal/consent strings require full published translation before enabling a locale (**Open** checklist per locale).

### 5. Numbers

- Store scraped display strings (`"5,2"`) for audit.
- UI formatting of normalized numbers: `Intl.NumberFormat(locale)` (follow-up when detail UI is polished).

### 6. Overlays / a11y

- `#site-root` = page chrome; `#portal-root` = age gate + main nav (portal).
- `inert` applies only to `#site-root` while overlays are open so menu/locale controls stay usable.

### 7. Typography / design-system (requirements)

- Current WOFF stacks lack verified Armenian/Georgian coverage; Serbian specials may fall back to system fonts — **blocker** before publishing `hy`/`ka`/`sr`.
- Per-script font stacks + tests for long German compounds, diacritics, `hy`, `ka`.
- Re-check global `uppercase`, weight 900, tight `line-height` per script.
- Prefer compact language picker when >2 published locales.

### 8. Future DB

Compatible with `products` + `product_translations` (one entity, many locales). JSON fixtures are temporary.

## Consequences

- Stage 4 starts with RU/EN slice under this contract; adding a language is registry + messages + translations + fonts, not per-component rewrites.
- ROADMAP ADR backlog: Database becomes **0002**, subsequent numbers shift (+1).
- Owner still confirms: Serbian script, fallback bridge language, legal copy completeness gates.

## Confirmed slug pairs (scrape)

| id / RU slug | EN slug |
|---|---|
| `milk-of-amnesia-v-tropic` | `milk-of-amnesia` |
| `brainstorm` | `brainstorm-apa-alcohol-free` |
| others | same as RU |
