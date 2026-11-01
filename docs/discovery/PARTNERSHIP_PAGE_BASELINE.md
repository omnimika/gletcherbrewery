# Partnership page — source baseline

Дата: **01.11.2026**. Sprint 5 first public template (P1 inventory).

## Provenance

| Locale | Public URL | Tilda page | Records | Published |
|--------|------------|------------|---------|-----------|
| RU | https://www.gletcherbrewery.com/partnership | `16901090` | 9 | yes |
| EN | https://www.gletcherbrewery.com/en/partnership | `55450707` | 14 | yes |

Tools: MCP `get_page_settings` / `get_page_records` / `get_zero_block`; public browser snapshot.

## Section map (RU)

| Order | Source | Content |
|-------|--------|---------|
| chrome | shared header/footer | SiteShell |
| materials | ZB `751210595` (+ related) | 6 download tiles → `files.gletcherbrewery.com`; hover SBS ~200ms reveals product preview (5 tiles; catalog has none). Local previews: `/partnership-{pricetag,Bierdeckel,brandbook,logo,bottleglass}.png` |
| video | ZB `854239717` | VK `-57309563_456239063` — **Open** (no local player yet) |
| hero + form + pillars | ZB `751227593` | H1, lead, partner-type form, 3 value props |
| product strip | tpl `776` `751227826` | beer carousel → local `/beer` teaser OK |

## Downloads (Confirmed URLs)

| id | RU title | File |
|----|----------|------|
| price-tags | ЦЕННИКИ | `…/Gletcher-PriceTags.zip` |
| bierdeckels | БИРДЕКЕЛИ | `…/Gletcher-Brewery-Bierdeckel.zip` |
| brandbook | БРЕНДБУК | `…/Gletcher-Brandbook.zip` |
| sort-logos | СОРТОВЫЕ ЛОГО | `…/Gletcher-Brewery-Sort.zip` |
| menu-images | ДЛЯ МЕНЮ | `…/Gletcher-Brewery-Bottles-Images.zip` |
| catalog | КАТАЛОГ | `…/Gletcher-Brewery-Presentation.pdf` |

EN live page exposes **4** of these (price tags, brandbook, menu images, presentation). Bierdeckels + sort logos EN — missing on source → omit for EN.

## Form

- Stub only until server handler + consent contract (SPRINT_PLAN).
- RU fields Observed: type (Бар/Магазин/Дистрибьютор), company, city, name, email, phone, comment, policy checkbox → `/policy`.
- EN Observed: type (Bar/Shop, Distributor), company, city, name, email, phone, comment; policy checkbox not Observed on EN.
- Success copy on Tilda mentions Members signup — **do not** claim account creation until auth exists.

## EN gaps (Open)

- No H1 in public meta inventory; lead paragraph exists.
- Three RU pillars not Observed on EN HTML extract → RU-only in v1.
- «10% FIRST ORDER DISCOUNT» → `/russian-craft-beer` (still production until that page migrates).

## Acceptance (local v1)

- `/partnership` + `/en/partnership` with SiteShell, canonical/hreflang.
- Materials + form stub + RU pillars; catalog CTA to `/beer`.
- Nav + home menu partners → local.
- No VK player; no real form POST.
- lint / typecheck / browser smoke.
