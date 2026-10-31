# Home page baseline — `/` and `/en`

Дата: 31.10.2026. Provenance: production browser + MCP Tilda (read-only).
Editor ≠ published: settings/records from MCP editor; visual/text from live site.

## Source

| Item | RU | EN |
|------|----|----|
| Public URL | https://www.gletcherbrewery.com/ | https://www.gletcherbrewery.com/en |
| Tilda page id | `49072461` | `50620901` |
| Alias | `` (index) | `en` |
| Project | `1212341` | same |
| MCP records | 21 blocks | 19 blocks |
| Published (MCP epoch) | `1775888761` | `1775888764` |
| EN flags | — | `noheader`/`nofooter` on page settings (chrome via project/header pages) |

### SEO (Confirmed MCP + live HTML)

| | RU | EN |
|--|----|----|
| Title | Gletcher Brewery \| Пивоварня Глетчер | Gletcher Brewery \| Official Website |
| Description | Крафт-пивоварня… (meta_descr truncated in Tilda field) | Empty in MCP; live may differ |
| OG image | `tild3735-…/2024-03-16_15-02-47.png` | same |
| Canonical | `https://www.gletcherbrewery.com` | `…/en` |

## Section order (Confirmed live 1440 + SITE_INVENTORY 4.1)

Shared chrome: SiteShell header (RU/EN, logo, Agent, Menu) + footer — already accepted.

1. **Hero** (~100svh, ZB `749387570` RU): ice `#e6eefc`; seal `slogan-red.png` («QUI QUAERIT, REPERIT!»); oversized **Пивоварня** (H2) / **gletcher** (H1) with bottle **video** between layers; clickable layer → `/beer`; lead under fold.
2. **MOA non-alco banner** — ZB `1060490961` → `/beer/milk-of-amnesia-non-alco` (`public/home/banner-moa-nonalco.png`). RU Confirmed; EN peer Open (shown on both in v1).
3. **B2B + sales map** — ZB `749421571` RU / `762053147` EN: two bordered ice cards → `/russian-craft-beer` and `/map` (EN `/en/map`).
4. **Tours CTA** — ZB `749426691` RU / `762053148` EN: title + 3 points + crocodile (`public/home/crocodile.png`) + «Забронировать экскурсию» → `/tours`.
5. **Menu flex grid** — ZB `749502712`: 3×2 cards (продукция / новости / партнёрам / география / экскурсии / магазин) with `menu-*.png` thumbs → local `/beer` or production peers.
6. **Blog teasers** — 4 posts (Tilda Feed); categories БИБЛИОТЕКА / НОВОСТИ / МЕРОПРИЯТИЯ.
7. **Newsletter / subscribe** — ZB `751210003` (EN peer `762056776`): crocodile (`crodile-subscribe.png`) + form + privacy note → `/policy`. Submit backend Open.
8. Footer (SiteShell).

EN live is leaner: hero BREWERY (H1) / GLETCHER (H2) — **heading tags inverted vs RU**; B2B/map cards; fewer mid bands; blog + newsletter. Match locale-specific copy; do not force RU block count onto EN. Seasonal fest banners deferred.

### Window upscale (Confirmed Tilda + Next)

Mid-blocks (MOA, B2B/map, features, blog, newsletter) use `HomeWindowStage`: matched artboard screen 320…1400, `scale = windowWidth / screen` — same as header `ab_upscale: window`. Hero stays viewport-fluid (`vw` / `svh`).

## Media

| Asset | Source | Local |
|-------|--------|-------|
| Bottle video | Owner delivery | Delivery: `public/vid/herobottle/{bottle.webm,bottle.mp4,bottle-alpha.webm}`. Masters/scratch under `.tmp/vid/herobottle/` (opaque black matte). Contour flood-fill: `scripts/herobottle-contour-alpha.py`. Hero cuts matte by **border-connected** contour (keeps dark glass). CDN later via `NEXT_PUBLIC_HERO_BOTTLE_BASE`. |
| Seal | `static.tildacdn.com/.../slogan-red.png` | `public/home/slogan-red.png` |
| MOA banner | ZB `1060490961` / owner PNG | `public/home/banner-moa-nonalco.png` |
| Partnership icon | Tilda PNG (CDN 403 from agent) | `public/home/partnership-icon.png` |
| Map pin | Tilda `Group_64.svg` (local copy) | `public/home/map-pin.svg` |
| Bottle height | ≥ 60svh (target ~70–78svh) | `HomeHeroBottle` |

## RU block map (MCP `get_page_records`, tplid)

| # | recordid | tplid | Role (Observed) |
|---|----------|-------|-----------------|
| 1 | 775078832 | 654 | Cover/T123-like |
| 2 | 762247593 | 396 | Fixed header chrome duplicate (window upscale) |
| 3 | 749387569 | 131 | Spacer |
| 4 | **749387570** | **396** | **Hero** (`ab_height_vh:100`, video HTML, seal, H1/H2) |
| 5–14 | 902518015…755121193 | 396 | Mid content / feature ZBs |
| 15 | 755121284 | 897 | Feed / blog |
| 16–21 | … | 131/354/396 | Spacers, form, closing |

EN first ZBs: `762189788` / `762189818` (hero family); feed `762053151` (897).

## Interactions

- Hero bottle video: autoplay muted loop playsinline; reduced-motion → static fallback (Proposed: pause / hide video).
- Hero artboard link → `/beer` (RU ZB shape).
- Age-gate / menu — existing SiteShell.
- Newsletter POST — **Open** (no Next handler in v1; UI only + note).
- Blog cards → production `blog-all/tpost/...` until feed migrated.

## Acceptance criteria (home v1)

- One document H1; RU/EN titles/descriptions/canonical/hreflang.
- Hero reads as brand composition (ПИВОВАРНЯ/GLETCHER or EN peers + bottle + seal); not stub gradients.
- Feature CTAs reach `/beer` locally and production map/tours/shop/partners/blog via `productionHref` (or local when ready).
- Blog strip shows ≥3 teasers with real production URLs.
- Newsletter visible; no fake success without backend.
- Mobile 390 + desktop 1440; no regression on `/beer` or product template.
- Pixel-perfect Zero Block **not** required.

## Status

| Item | Status |
|------|--------|
| Page IDs / SEO / hero ZB | Confirmed |
| Full EN parity of every RU mid-band | Observed leaner — Open to refine after v1 |
| Newsletter backend | Open |
| Blog CMS | Deferred (static fixture from live) |
| Cynic / product pages | Out of scope (accepted; Cynic owner) |
