# `/horeca` — source baseline

Дата: **01.11.2026**. Sprint 5 B2B SEO landing (distinct from `/russian-craft-beer`).
Обновлено: MCP media/anim pass (тот же день).

## Provenance

| Field | Value |
|-------|--------|
| Public URL | https://www.gletcherbrewery.com/horeca |
| Tilda page | `103271966` |
| Project | `1212341` |
| Records | 12 |
| Alias | `horeca` |
| `nosearch` | off (indexable) |
| EN peer | **none** — locale switch → EN `/` |
| Distinct from | `/russian-craft-beer` page `26419950` |

Tools: MCP `get_page_settings` / `get_page_records` / `get_zero_block` +
`zero_block_animation_instructions`; public browser; raw `page__horeca.html`.

## Zero Blocks (media/anim Confirmed)

| Record | Role |
|--------|------|
| `1702039591` | Hero: gletcher/HORECA `zoomin`, badges fade L/R, bottle **video** HTML (visible), slogan-red rotate SBS, why copy |
| `1701412511` | Compare: dual faces per card, **hover 200ms opacity** import→Gletcher |
| `1701927591` | Audience + Hop Dragon image |
| `1701992171` | Distribution copy + MapChart map image |
| `1701996001` | Form lead + Klin May Fest formname stub |
| `1681699141` | Trailing partnership-clone ZB — **omit** (not the live form) |

### Hero video (ZB `1702039591`, elem visible)

- HEVC: `https://files.gletcherbrewery.com/vid/comp-960-hevc-safari.mp4`
- VP9: `https://files.gletcherbrewery.com/vid/comp-960-vp9-chrome.webm`
- Source also has `animprx: scroll` / `animprxs: 120` — local v1: appear fade-up, no scroll parallax yet.

### Appear effects (map to CSS)

| Source | Local |
|--------|--------|
| `animstyle: zoomin` + `animscale: 0.7` | `.animate-horeca-zoomin` |
| `fadeinleft` / `fadeinright` | `.animate-horeca-fade-left/right` |
| `fadeinup` (video) | `.animate-horeca-fade-up` |
| `animmobile: y` | play on mobile too |

## Sections (local v1 → DS-2 pilot)

Stable hashes (new, intentional): `#hero` `#compare` `#audience`
`#distribution` `#request` — см. `src/content/horeca-sections.ts`.

1. Hero: `100svh` under header; wordmark ~90% ink width (cqi); bubbles absolute;
   bottle cover/contain by breakpoint; custom frame (не SectionFrame).
2. Compare: six cards in `CardGrid`; default import face; hover/tap → Gletcher;
   DS-B inert/tabIndex on hidden face; «Искать» → `/beer/{slug}`.
3. Audience: `CompositionGrid` halves-x + Hop Dragon.
4. Distribution: halves-x + map image.
5. Request: form stub + `LinkButton` catalog/wholesale.

DS-2 adds opt-in document proximity snap + Reveal on body sections.
B2B measure stays `max-w-[1100px]` until DS-3 token pass.

## Open

- Scroll parallax on bottle video.
- Step-by-step rotate on slogan (SBS) — static rotate OK for now.
- Source formname still Klin May Fest.
- Owner visual acceptance of DS-2 layout (not claimed by Cursor alone).

## Acceptance

- Hero shows bottle video + wordmark motion.
- Compare cards show catalogue + import images; hidden face not tabbable.
- Distribution map visible; `#distribution` deep-link focuses section.
- lint / typecheck / build / browser smoke.
