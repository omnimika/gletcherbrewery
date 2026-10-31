# ADR 0001 — i18n routing and content model

> Status: **Proposed** (31.10.2026)  
> Stage: Design Foundation / content fixtures (before product detail routes)

## Context

Production site already publishes **RU** (default, `/…`) and **EN** (`/en/…`) with a header locale switcher. Owner expects future locales: **Serbian (sr), Armenian (hy), Georgian (ka), German (de)** — exact market priority and go-live dates are **Open**.

Catalog product pages hold locale-sensitive copy (taste, about, food pairing, fermentation labels) and locale-invariant specs (ABV, OG, IBU, style, malts, hops, volumes). RU↔EN slug pairs are **not** always identical (Observed).

## Decision

1. **Routing** — Next.js App Router with a locale segment strategy compatible with current URLs:
   - `ru` (default): unprefixed paths (`/beer`, `/beer/[slug]`) to preserve production SEO.
   - other locales: `/{locale}/…` (`/en/beer/...`, later `/de/beer/...`).
   - **Proposed** implementation: `src/app/[locale]/...` with middleware rewrite so `ru` is omitted from the public URL; alternatives (next-intl / custom) remain open until stage 4.
2. **Locale codes** — BCP 47 language tags: `ru`, `en`, `sr`, `hy`, `ka`, `de`. Region variants (`sr-Latn` vs `sr-Cyrl`) are **Open** until owner confirms script.
3. **Content shape** — separate **specs** (shared) from **copy** (`LocalizedText` per field). Do **not** duplicate ABV/IBU per language. UI chrome strings (nav, filters, legal) live in message catalogs; product body copy lives with product records (`src/content/product-props.ts` → later CMS/PostgreSQL).
4. **Slug map** — each product stores `slugs: { ru, en, … }`. Resolvers accept any known slug and redirect to the canonical slug for the active locale (301) when mismatched.
5. **Fallbacks** — missing translation: fall back `requested → en → ru` for copy; never invent copy. Empty planned locales are valid until filled.
6. **SEO** — emit `hreflang` + `x-default` for every public page with locale peers; fix Observed empty hreflang on Tilda. Keep absolute canonicals on `www`.
7. **CMS later** — NocoDB/admin may edit localized fields as columns or JSON; schema must remain locale-keyed (`taste.ru`, `taste.en`, …), not parallel product rows per language.

## Confirmed from scrape (31.10.2026)

| RU slug | EN slug | Notes |
|---|---|---|
| `milk-of-amnesia-v-tropic` | `milk-of-amnesia` | Different path |
| `brainstorm` | `brainstorm-apa-alcohol-free` | Different path |
| `ausweis` | `ausweis` | EN page exists (HTTP 200) though historically Disallow / sitemap gaps |
| others | same as RU | Incl. `milk-of-amnesia-non-alco`, `cynic`, … |

Full props: `tmp/Gletcher beer categories and props.csv`, `docs/discovery/_raw/product_props.json`.

## Consequences

- Product detail work must use `product-props` + locale helpers, not hard-coded Russian strings in components.
- Adding `sr`/`hy`/`ka`/`de` is additive (messages + optional slug overrides + translations), not a redesign.
- Until middleware/`[locale]` lands, `/beer` fixture may stay RU-only; the **data model** is locale-ready now.
- Owner must confirm: default fallback language, Cyrillic/Latin for Serbian, and whether EN remains the bridge language for incomplete locales.

## Open

- Library choice (`next-intl`, `next-i18n-router`, custom).
- Whether members/LK and checkout emails need the same locale set on day one.
- Legal age-gate copy per jurisdiction (18+ RF vs other markets).
