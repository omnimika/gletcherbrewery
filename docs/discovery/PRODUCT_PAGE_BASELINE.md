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

## Evidence (31.10.2026, Cursor A01–A03 + QA)

Baseline commit `6f84465` + dirty tree (без commit): A01 min-h `#about`,
A02 dialog shell, A03 focus trap, product `localeHrefs` peer slugs.

- lint / tsc / build PASS (Node 25.5.0); `next start` localhost:3000.
- 36/36 canonical detail HTTP 200 + single H1.
- Browser: Friday/Ausweis/Cynic `#about`; 1280×500 / 1024×600 без clip;
  menu dialog contains locale/close; resize keeps focus; Brainstorm/MoA
  RU↔EN peer slug + `#about`; related + Back/Forward.
- Missing glass (no hover): cynic, underground-ale, brut-grapefruit,
  tour-de-grapefruit.

Подробности: `docs/CURSOR_NEXT_STEPS.md`. Sign-off — владелец.

## Verification and acceptance matrix (Codex follow-up)

Historical review: [clean 6f84465](../reviews/2026-10-31-product-acceptance.md).
Product template and A01–A03 were subsequently accepted/closed in `0df9706`.
Current work is [home](../reviews/2026-11-01-home-and-sprints.md); this matrix is
retained for regression QA, not a request to repeat product visual acceptance.
The MCP provenance above was recorded by Cursor, not independently repeated
by Codex. Public RU/EN Friday content was read; no new pixel-comparison was made.
`/beer` and this template are owner-accepted. Cynic visual polish stays with owner.

| Variant | Example | Required check |
|---|---|---|
| Embedded wordmark | Friday RU/EN | One H1, no duplicate visual wordmark, cover crop |
| Separate logo | Ausweis RU/EN | One H1 despite logo image, readable scale/spacing |
| No cover/logo | Cynic RU/EN | Bottle fallback, H1, missing keg safely omitted |
| Different localized slug | MoA / Brainstorm | Header language switch preserves product ID and canonical target |

All 36 canonical detail need content/SEO/media checks. Visual matrix minimum:
390×844 and 1440×900 plus short viewport, 200% zoom, keyboard/touch.
T01 is fixed: in-memory React render confirms one H1 for all 36 RU/EN heroes.
All 48 cover/logo/glass references exist; 14 products have glass, missing cases
above are intentional. Below-fold priority has been removed (T05).
Check A01 fixed-height overflow: long RU/EN copy must remain fully readable at
1024×600, 1280×500 and 200% zoom. Check header/modal scope, stable focus, hero
anchor and locale/hash navigation, especially MoA/Brainstorm and Back/Forward.

Related `first 12 other cards` is temporary **Proposed** editorial policy,
not a confirmed recommendation rule. Record a decision before finalizing it.
Append actual source/screenshot artifacts with date, viewport, page/record IDs
and editor/published state per [workflow](TILDA_MCP_WORKFLOW.md).
