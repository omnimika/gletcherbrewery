# Tilda `/beer` catalog — Zero Block audit

> Source: Tilda MCP `get_zero_block` / `get_page_records`  
> Project: `1212341` (Gletcher Brewery)  
> Page: `16494049` · alias `beer` · title «Каталог | Пивоварня Глетчер»  
> Status: **Confirmed** from live editor data (2026-10-31)

## Page block order (first screen relevant)

| # | recordid | tplid | Role |
|---|----------|-------|------|
| 1 | `762301358` | 396 | Header/chrome Zero Block |
| 2 | `735254792` | 396 | **Hero + filters + arrows** |
| 3–4 | `806402823`, `806404794` | 131 | Code / HTML helpers |
| 5 | `802918687` | 396 | **Bottle carousel (ALL)** |
| … | filter-specific ZBs | 396 | CLASSIC / CRAFT / LIMITED carousels |
| … | `753207250` | 396 | «Есть идеи?» lead form (below fold) |

EN catalog: page `50623499` · alias `en/beer`.

## Hero Zero Block `735254792`

- `ab_height`: ~120–140px by breakpoint (compact strip under site header)
- `ab_bgcolor`: `#e6eefc`
- Contents: eyebrow, title, subtitle, filter pills (`ВСЕ` / `CLASSIC` / `CRAFT` / `LIMITED`), left/right arrow shapes
- Arrows live **in the hero**, not inside the bottle artboard

## Carousel Zero Block `802918687` (ALL)

### Artboard

| Key | Value | Notes |
|-----|-------|--------|
| `ab_bgcolor` | `#e6eefc` | Same ice as site |
| `ab_height` | 876 / 700 / 630 / 520 / 500 / 596 | px fallbacks by breakpoint |
| **`ab_height_vh`** | **80** | desktop / 1400 |
| `ab_height_vh-res-1200` | (inherits 80) | |
| `ab_height_vh-res-960` | **100** | |
| `ab_height_vh-res-640` | 50 | |
| `ab_height_vh-res-480` | 50 | |
| `ab_height_vh-res-320` | 70 | |
| `ab_valign` | `stretch` | |
| `ab_ovrflw` | `auto` | horizontal scroll |
| `ab_upscale` | `window` | |

First screen implication: header + ~130px hero + **80svh carousel** ≫ 100svh → lead form stays below the fold. Bottles may be clipped by the viewport bottom (production behavior).

### Bottle items (`.catalogItem`)

| Breakpoint | width `%` | cols | height `%` | top (px) |
|------------|-----------|------|------------|----------|
| 1200 / default | 20 | 5 | 85 | 105 |
| 960 | 25 | 4 | 85 | 74 |
| 640 | 33 | 3 | 86 | 63 |
| 480 | 50 | 2 | 80 | 96 |
| 320 | 100 | 1 | 85 | 80 |

- `heightunits`: `%` of artboard → bottle slot ≈ **85% of stage height**
- `widthunits`: `%` of artboard → column count as above
- Horizontal strip of shapes; overflow scrolls (`ab_ovrflw: auto`)

### Filter-specific carousels

Separate Zero Blocks (e.g. `789496632`) reuse the same `ab_height_vh` / item geometry with a different subset/order of bottles (CLASSIC, etc.).

## Lead form Zero Block `753207250`

- Title «Есть идеи?» / «Напишите нам!»
- Placed **after** carousel blocks → not part of first viewport when carousel is 80svh

## Next.js mapping (Confirmed targets)

1. Catalog stage height ≈ Tilda `ab_height_vh` (80svh desktop; 50svh tablet; 70svh mobile; 100svh near 960).
2. Visible columns: 5 / 4 / 3 / 2 / 1 matching width %.
3. Bottle image area ≈ 85% of stage height, `object-contain`.
4. Center row when `products.length ≤ cols`.
5. Lead form must start at or below `100svh` (no peek on first paint).
