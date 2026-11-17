# /about — section & animation manifest (A1)

Дата: **06.11.2026**. Provenance: MCP `get_page_records` /
`get_zero_block` project **1212341** page **71867465**; HTML snapshot
`_raw/page__about.html` (31.10). Status: Confirmed для состава; runtime
parity — Observed после Next ship.

## Records (content order, без header/footer)

| # | recordid | tpl | Anchor | Role | Motion (source) |
|---|---|---|---|---|---|
| 1 | 1163227346 | 131 | — | CSS: hide headerBlur | — |
| 2 | 1144144781 | 396 | hero | Hero «Пивоварня / gletcher / ВКУС…» + video | SBS `scroll` exit (my −1000…−3000 / di 1000); animmobile |
| 3 | **1144141171** | 396 | — | Editor leftover «Реализация проекта» (Inter) | **Excluded** — не brewery content |
| 4 | 1163273136 | 215 | slide1 | Anchor | — |
| 5 | 1144141176 | 396 | intro | QUI QUAERIT REPERIT | SBS `blockintoview` slogan spin; gradients NLM CSS |
| 6–7 | 1144155141 / 6096 | 131 | — | Gradient CSS inserts | CSS animation |
| 8 | 1163273586 | 215 | slide2 | Anchor | — |
| 9 | 1144141181 | 396 | history | Timeline years + cards | SBS `click` year → card (2011/2016 groups Confirmed; 2018/19/23 buttons without unique cards) |
| 10 | 1163273671 | 215 | slide3 | Anchor | — |
| 11 | 1144141186 | 396 | team | Team grid | SBS `hover` photo scale 1→1.6 / 200ms |
| 12 | 1163273926 | 215 | slide4 | Anchor | — |
| 13 | 1144190371 | 396 | video | VK video + stats | — |
| 14 | 1163274116 | 215 | slide5 | Anchor | — |
| 15 | 1144235866 | 396 | beer | AGING/LIMITED/CRAFT/CLASSIC | appear `fadeinup` |
| 16 | 1163274176 | 215 | slide6 | Anchor | — |
| 17 | 1150024191 | 396 | agent | Agent teaser | appear L/R/up + blockintoview |
| 18 | 1162973476 | 131 | — | Drag photos script (agent) | Not ported as free-drag (a11y) |
| 19 | 1163274551 | 215 | slide7 | Anchor | — |
| 20 | 1162950316 | 396 | tours | Tours CTA | appear fadeinup |
| 21 | 1163274746 | 215 | slide8 | Anchor | — |
| 22 | 1162973886 | 396 | BH | Brewer's House | appear |
| 23 | 1163319861 | 396 | fest | Klin May Fest | appear + zoomin + intoview |
| 24 | 1163342141 | 396 | fest | Brainstorm Motor Fest | appear; gallery → logo+CTA adaptation |
| 25 | 1163353951 | 396 | where | Chains + shops | appear |
| 26 | 1163840706 | 396 | export | Export map + contact | appear + hover |
| 27 | 1163274816 | 215 | slide9 | Anchor | — |
| 28 | 1168098126 | 396 | thanks | Thanks | appear |
| 29 | 1144141161 | 396 | stop | Empty artboard — NLM129 `blockNotSticky` release | Spacer / end marker (z 1801) |
| 30 | **1144141191** | 131/T123 | — | **NLM129 sticky stack** — all content ZB pin + overlay | Ported: CSS `position:sticky` + rising `--about-stack` |
| 31+ | 1168088711 + T123 | — | — | Glitch, preloader, forms CSS | See adaptations |

Published settings (MCP 06.11): `published`, alias `about`,
`animationoff` empty, `nosearch=on`, `meta_nofollow=on`.

## Next mapping

| Source effect | Next |
|---|---|
| appear fadein* / zoomin | `ZbAppear` |
| SBS intoview / blockintoview | `ZbSbs` |
| SBS scroll (hero exit) | `ZbScrollLinked` (new) |
| SBS click year cards | History tabs (native buttons; 2011/2016 copy) |
| SBS hover photo scale | CSS `:hover` / `:focus-within` scale 1.6 |
| Hero ambient video | `ManagedVideo` + files.gletcherbrewery.com |
| VK video | iframe `video_ext.php` |
| Gradient text | CSS `aboutGradientFlow` |
| NLM129 sticky stack (`#rec1144141191`) | CSS `position: sticky; top: 0` + rising z-index on each slide |
| NLM magnet / preloader / glitch | **Not ported** |
| Drag `.movePhoto` | `MovePhoto` — polaroids + receipts on slide6 (ZB 1150024191) |

## Intentional adaptations

1. NLM129 stack ported via sticky (not fixed+JS): same overlay feel, native
   scroll, `prefers-reduced-motion` → relative flow. Proximity snap removed on
   `/about` (conflicts with sticky stack).
2. History years 2018/2019/2023 reuse 2011 card until unique ZB copy exists (Open).
3. Slides 07/08/10: ZB `gallery` → `AboutGallery` (loop, autoplay 5s).
   Slide 08 BH (1162973886): fixed 444×250 cover frame + crest/wordmark/VK/TG
   CTA bar (MCP 06.11). Slide 09 Klin May: ZB `video` (VK), not photo gallery.
4. No page preloader / magnet buttons / glitch hover clone.
5. Leftover record 1144141171 omitted.
6. Metadata robots noindex/nofollow mirrors source; indexing Open for later.
7. Hero SBS scroll-exit kept as element motion inside the pinned hero slide.

## Anchors

`#hero`, `#slide1`…`#slide9` preserved for deep links.
