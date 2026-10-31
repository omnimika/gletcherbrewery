# Product page baseline — Friday Avenue APA

Дата: 31.10.2026. Provenance: production + MCP Tilda (read-only).

## Source

| Item | Value |
|------|-------|
| Public URL | https://www.gletcherbrewery.com/beer/friday-avenue-apa |
| EN | https://www.gletcherbrewery.com/en/beer/friday-avenue-apa |
| Tilda page id | `13179167` |
| Hero Zero Block | `749204501` (cover + wordmark, vh≈100, window upscale) |
| Content Zero Block | `749116853` |

## Section order (Confirmed via live scroll + MCP + ZB coords)

1. **Hero** — `100svh` cover; wordmark SVG bottom-center.
2. **Content** ZB `749116853` (desktop 1200×931):
   - Left ~380px: G watermark + bottle (+ glass hover on Tilda; hover Open).
   - Right: «Чего ожидать» + taste (full content width).
   - Row: «О вкусе»+about (~300px) | «советуем вместе»→ + pills.
   - Style name; circles ABV/OG/IBU; fermentation + vols; malt/hops column right.
3. **Related** — «Попробуйте также» strip.
4. Drink-responsibly note.

No category chip and no in-page locale switch / back-link on production content block.

## Assets (local)

- Covers: `public/catalog/covers/*.png` (from `assets/catalog/covers`)
- Logos: `public/catalog/logos/*.{svg,png}`
- Bottles: existing `public/catalog/bottles/`
- Map: `src/content/product-media.ts` by stable product `id`
- Cynic: no cover/logo in delivery → bottle fallback

## Interactions (Confirmed production)

- Hero cover / wordmark click → smooth scroll to `#about`.
- Bottle hover → glass fade-in (~400ms); assets from owner delivery
  `tmp/БОКАЛЫ GLETCHER` → `public/catalog/glasses/{id}.png`.
- Volume row uses `/svg_bottle.svg` + `/svg_keg.svg`.

## Implementation notes

- Template: `src/app/[locale]/beer/[slug]/page.tsx` + `src/components/product/*`
- Specs display via `formatSpecNumber` (Intl; F07 soft)
- Always one document H1 (sr-only when wordmark is visual).
- Pixel-perfect Tilda Zero Block geometry is **not** required for v1;
  structure and visual language must match production.

## Evidence (31.10.2026 Cursor)

- Build PASS; 36/36 canonical detail HTTP 200 + single H1 on `localhost:3000`.
- Browser spot-check: `/beer/friday-avenue-apa`, `/beer/ausweis` (logo overlay + H1).
- Missing glass files (no hover): cynic, underground-ale, brut-grapefruit,
  tour-de-grapefruit.

## Verification and acceptance matrix (Codex follow-up)

Current review: [9e0ee8e + working tree](../reviews/2026-10-31-product-template.md).
The MCP provenance above was recorded by Cursor, not independently repeated
by Codex. Public RU/EN Friday content was read; no new pixel-comparison was made.
`/beer` is already owner-accepted; this template has a separate acceptance gate.

| Variant | Example | Required check |
|---|---|---|
| Embedded wordmark | Friday RU/EN | One H1, no duplicate visual wordmark, cover crop |
| Separate logo | Ausweis RU/EN | One H1 despite logo image, readable scale/spacing |
| No cover/logo | Cynic RU/EN | Bottle fallback, H1, missing keg safely omitted |
| Different localized slug | MoA / Brainstorm | Header language switch preserves product ID and canonical target |

All 36 canonical detail need content/SEO/media checks. Visual matrix minimum:
390×844 and 1440×900 plus short viewport, 200% zoom, keyboard/touch.
Current template has no H1 in 16 logo-overlay products (T01); fix before sign-off.
Check physical bottle size with padded source PNG (contain vs Tilda cover),
hero/header first paint/resize/navigation, and below-fold preload.

Related `first 12 other cards` is temporary **Proposed** editorial policy,
not a confirmed recommendation rule. Record a decision before finalizing it.
Append actual source/screenshot artifacts with date, viewport, page/record IDs
and editor/published state per [workflow](TILDA_MCP_WORKFLOW.md).
