# Публичные маршруты — gate этапа 4

**Owner priority09.11:** B1/B2 data/forms начинаются до завершения remaining
campaigns/public gate. Эта матрица не блокирует новый разрешённый backend scope.
Формы в коде2095221 всё ещё unavailable; Q1 устранил ложный success, но не
доставку. Новый контракт: [FORMS_DATA_PIPELINE](../backend/FORMS_DATA_PIPELINE.md),
[источники/назначения](../data/SOURCE_INVENTORY.md). Приёмки A1/публичного scope
остаются отдельными и автоматически Done не становятся.

Дата: **06.11.2026** (Q3), код поверх **0500789** / baseline ревью d6011d2.
Источник реестра в коде: `src/content/seo/public-routes.ts`.
[Ревью](../reviews/2026-11-05-public-integrity.md), [план](../SPRINT_PLAN.md),
[ADR i18n](../adr/0001-i18n-routing-and-content.md).

Implemented ≠ owner acceptance ≠ DNS cutover. HTTP evidence ниже — localhost:3000.

## Реестр (код + решения)

| ID / путь | EN peer | disposition | indexable | decision | Notes |
|---|---|---|---|---|---|
| / | /en | local | yes | Confirmed | Home |
| /beer | /en/beer | local | yes | Confirmed | + published product slugs in sitemap |
| /blog | /en/blog | local | yes | Confirmed | Full listing UX |
| /blog-all | /en/blog-all | local redirect | no | Confirmed | **308** → `/blog` / `/en/blog` (Q3) |
| /blog-all/tpost/[slug] | published peers | local | yes* | Confirmed | *only local published bodies |
| /partnership | /en/partnership | local | yes | Confirmed | |
| /tours | /en/tours | local | yes | Confirmed | YCLIENTS temp |
| /map | /en/map | local | yes | Confirmed | Mapbox FE |
| /agent | — | local | yes | Confirmed | RU-only |
| /shop | — | local | yes | Confirmed | RU-only; no cart |
| /contacts | — | local | yes | Confirmed | RU-only |
| /horeca | — | local | yes | Confirmed | RU-only; EN → 404 |
| /russian-craft-beer | — | local | no | Confirmed | noindex |
| /policy | — | local | yes | Confirmed | RU-only |
| /shopping-rules | — | local | yes | Confirmed | RU-only |
| /blog/expansion | — | local | yes | Confirmed | RU alias |
| /vacancies | — | local | no | Confirmed | noindex |
| /dev/design-system | /en/… | exclude | no | Confirmed | noindex |
| /about | — | local | no (source noindex) | Confirmed | A1 shipped; RU-only; see ABOUT baseline + SECTION_MANIFEST |
| /brainstorm-moto-fest-2023 | — | external→C1 | no | Open | Tilda 37060088 |
| /10-years | — | archive? | no | Open | contest presentation |
| /klin-may-fest-2023 | — | exclude | no | Confirmed | unpublished + password |
| /aging, /en/aging | Open | deferred | no | Open | no local route |
| /restaurant | — | deferred | no | Open | |
| /members/* | — | external | no | Confirmed | stage 7 |
| /tours/check, preorder | — | external | no | Open | ops URLs |

## SEO policy (Q3 Confirmed)

| Concern | Rule |
|---|---|
| Indexing gate | `ALLOW_SITE_INDEXING=true` required; else robots `Disallow: /`, empty sitemap |
| Origin | `NEXT_PUBLIC_SITE_ORIGIN` or default `https://www.gletcherbrewery.com` |
| Sitemap | Only indexable local static + published products + local published articles |
| Robots | Not access control; when indexing on: allow `/`, disallow `/dev/`, `/members/` |
| Preview | Must stay protected separately (auth/network), not only robots |
| hreflang | Existing page metadata; fallback home ≠ translation peer |

## HTTP evidence (localhost:3000, 06.11.2026)

| Request | Result |
|---|---|
| `GET /blog-all` | **308** `Location: /blog` |
| `GET /en/blog-all` | **308** `Location: /en/blog` |
| `GET /blog` | 200 |
| `GET /blog-all/tpost/homebrewing-craft-beer-history` | 200 |
| `GET /en/horeca` | 404 (RU-only) |
| `GET /beer/not-a-real-slug` | 404 |
| `GET /about` | 200 (A1); robots noindex/nofollow |
| `GET /robots.txt` (indexing off) | `Disallow: /` |
| `GET /sitemap.xml` (indexing off) | empty `<urlset>` |

## /about — A1 (MCP + ship 06.11.2026)

Read-only MCP page **71867465** / project **1212341** + local route:

- `alias`/`url`: `about`; title «О нас | Gletcher Brewery…»
- `published` set; `viewpassword` empty
- `nosearch=on`, `meta_nofollow=on` → Next `robots: noindex,nofollow`
- `animationoff` empty; `recordscount`: 37
- Section/animation map: `ABOUT_SECTION_MANIFEST.md`
- Local `/about` RU-only; leftover editor ZB 1144141171 excluded
- EN peer / public index decision still Open

Не публиковать и не менять Tilda из агента.
