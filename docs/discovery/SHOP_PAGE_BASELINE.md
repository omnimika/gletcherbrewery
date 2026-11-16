# `/shop` — source baseline

Дата: **04.11.2026**. Sprint 5 public template.

## Provenance

| Field | Value |
|-------|--------|
| Public URL | https://www.gletcherbrewery.com/shop |
| Page ID | `16494410` alias `shop` |
| SEO | title «Магазин \| Пивоварня Глетчер»; descr «Мерчандайз и прочие приятности»; tag «…сделайте предзаказ» |
| Raw HTML | `docs/discovery/_raw/page__shop.html` |
| EN peer | alias `en/shop` page `17389029` — **unpublished** (`published` empty). Live `/en/shop` resolves to home. Treat as RU-only for published SEO (like `/shopping-rules`). |

## Published UI (Observed 04.11.2026)

1. **Hours Zero Block** `410456346` — «ВРЕМЯ РАБОТЫ», ПН–ВС 10:00–19:00, phone `+7 (929) 634-50-17`, CTA → `/partnership`, gallery photos.
2. **Rules popup** `#popup:shopping-rules` (`268779097`) auto-opened via T354 — disclaimer about no remote alcohol sales + reserve/pickup in Klin; link to `/shopping-rules`.
3. **Address + Yandex map** T554 `336893547` — Klin, Терешковой 1 стр.4И; navigator + suburban schedule; ИП Мищенко…; marker `56.348616, 36.694416`.
4. Site header/footer shared.

## Store / cart (Open → deferred)

- Tilda catalog block `268779098` (tpl 951) is **`off`** in editor.
- `store_get_products_list`: 88 products, all `off: y` (hidden).
- Parts: МЕРЧ / БОКАЛЫ / СЕРТИФИКАТЫ — not shown on published page.
- **Do not** ship cart, checkout, or online alcohol sale. Preorder = phone / rules until Stage 8.

## Local v1 mapping

| Source | Next |
|--------|------|
| Hours ZB | `/shop` hours section + gallery |
| Rules popup body | Inline rules teaser → local `/shopping-rules` |
| Address card + map | Address panel + Yandex map-widget iframe |
| Catalog/cart | Explicit deferred note + phone CTA |

## Out of scope

- ЮKassa / Tilda cart / members auth
- Enabling disabled store SKUs or inventing prices
- Published EN shop until owner publishes peer
