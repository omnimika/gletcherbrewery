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

## Historical implementation verification (01.11.2026)

Accepted architecture is distinct from owner acceptance and verification.
`/beer` and product template are owner-accepted (`0df9706`). Current `2c1a9d0`
is assessed in the [home review](../reviews/2026-11-01-home-and-sprints.md)
and [Cursor task](../CURSOR_NEXT_STEPS.md). Lint/typecheck pass; new product
components are server-rendered, UI labels and Intl formatting are implemented.
Home RU/EN v1 is implemented and awaits its own gate. Earlier product
overflow/modal/focus findings A01–A03 are closed by code; don't reopen them.
Home messages have matching 140/140 keys; this does not publish new languages.
HTTP 308 aliases must not be described as 301 legacy redirects.

Implementation detail replacing the earlier portal description in section 6:
menu now uses one dialog shell containing header controls and panel; it inerts
`#site-content`, while age gate outside the page still inerts `#site-root`.
The accepted UX is preserved. Hash state now re-syncs on pathname changes;
keep locale/hash/client-navigation checks in regression QA.

Before enabling another language, also address current implementation limits:

- `catalog.ts` builds translations and product alternates by explicitly iterating
  RU/EN. Expand those paths through the approved registry and publication model;
  adding a registry item alone is not sufficient today.
- `LocaleSwitch` must distinguish a missing published page peer from a missing
  optional override. Its current Partial<string> input falls back to pathname
  for undefined; its null check does not match the declared type. The existing
  complete RU/EN dataset does not exercise that case. Product peers are now
  passed through SiteShell to the header, avoiding an unnecessary cross-slug
  redirect for complete translations. Missing/draft peer entries still need an
  explicit contract. Resolve this before partial blog translation publication.
- Recheck required message coverage, locale font glyphs, number formatting,
  draft/missing pages, SEO and 404 for the newly enabled locale.
- Home/listing metadata also hard-code RU/EN peers. Derive them from publication
  state. UI messages currently load only the active JSON; define required keys
  and fallback policy separately from the product-copy fallback.

Future-locale work remains gated by translation/script/font approval; these
notes do not enable `sr`, `hy`, `ka` or `de` or choose new business rules.

The proposed [sprint series](../SPRINT_PLAN.md) applies this publication model to
blog entities before article batches; it does not select/install a CMS or backend.

## Implementation verification (05.11.2026, d6011d2)

The earlier paragraph is historical: blog entities/listing/article batches and
public templates are now implemented. Current gaps and route availability:
[review](../reviews/2026-11-05-public-integrity.md),
[route matrix](../discovery/PUBLIC_ROUTE_MATRIX.md). Do not repeat blog migration.

Q1 R02 (05.11.2026) implemented the explicit contract in `src/i18n/locales.ts`:
`LocaleHrefTarget = string | { fallback: string } | null`. LocaleSwitch transfers
fragments only for peer `string` targets; `{fallback}` never keeps a foreign hash;
`null` hides the locale option. RU-only pages (incl. russian-craft-beer) use
`{ fallback: "/" }` or listing fallbacks. Peer pathnames for next-intl `Link`
must omit the `/en` prefix (Link + `locale` adds it).

RU-only shop is deliberate: source EN peer unpublished. Agent/Horeca/contacts/
legal and other RU-only cases must stay absent from EN SEO unless a real peer
is published. Q3 adds route/publication-driven sitemap, metadata and legacy
URL checks. A fallback home destination is not a translation peer/hreflang.

sr/hy/ka/de remain planned. Before enabling one, expand hardcoded RU/EN content
builders and peer loops, load/validate messages, prove publication/draft cases,
font/script/line-height and legal content. Registry inclusion alone remains
insufficient. This follow-up does not change the Accepted routing decision.
