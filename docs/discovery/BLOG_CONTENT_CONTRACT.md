# Blog content & URL contract (sprint 2–3)

> Дата: **01.11.2026**  
> Статус: **Proposed** foundation; sprint 3 article body uses typed blocks (Puck-ready).  
> Snapshot feeds: RU `921152316206` (141 posts MCP), EN `370831704951` (44) — not a live guarantee.

## 1. Public URL families (Confirmed)

| Pattern | Role | Notes |
|---|---|---|
| `/blog`, `/en/blog` | Curated listing / entry | Production title «Блог \| Gletcher Brewery»; CTA «Все новости» → `/blog-all` |
| `/blog-all`, `/en/blog-all` | Full feed archive | Title «Блог: Все записи…»; Tilda `js-feed` |
| `/blog-all/tpost/{id}-{slug}` | Article (modern) | Do not invent short slugs; keep 301 if path changes |
| `/blog/{slug}`, campaign roots | Legacy / special | Inventory separately; not assumed peers |
| `/en/blog-all/tpost/...` | EN article | Same feed model; IDs differ from RU |

**Local Next:** `/blog` listing; articles with bodies at `/blog-all/tpost/{localSlug}`
(same path family as production). Unmigrated cards still link to production.

## 2. Entity model (Proposed → code fixtures)

```text
BlogPost
  id                 stable string (not Tilda page id alone)
  categoryId         library | news | events   (locale-invariant)
  translations[locale]
    status           published | draft | missing
    title
    categoryLabel    localized display (БИБЛИОТЕКА / NEWS / …)
    publishedAt      ISO date (Confirmed from source when known)
    productionPath   /blog-all/tpost/... or /en/blog-all/tpost/...
    localSlug        production postdefaulturl segment when body is local

BlogArticleBody (per locale)
  slug, title, description, cover{src,alt}
  blocks[]           typed — see §4 / ADR 0005
```

Rules (aligned with ADR 0001):

- Missing/draft translation → **no** public local article URL, **no** hreflang;
  LocaleSwitch falls back to `/blog` (or `/en/blog`), never invents a peer.
- Fallback copy must not create a fake published peer URL.
- Category **id** ≠ localized label.
- `publishedAt` is data; UI formats via `Intl`.

## 3. Confirmed sample peers (01.11.2026)

| id | RU | EN | Local body |
|---|---|---|---|
| `beer-pizza` | `…/913cadd4f1-9-oktyabrya-…` | `…/5od5iaktd1-october-9-…` | **RU+EN** sprint 3 |
| `homebrew-day` | `…/homebrewing-craft-beer-history` | — | **RU-only** (missing EN peer) |
| `barrel-aged` / `afisha-winepark` | production | — | listing only |
| EN-only teasers | — | moa-na / aging / tour-de-grapefruit | listing → production |

## 4. Rich body (typed blocks → future Puck)

Owner preference (**Confirmed**): CRM will use [Puck](https://puckeditor.com/docs);
block types mirror Tilda feed editor. ADR: `docs/adr/0005-cms.md` (**Proposed**,
no package install yet).

Tilda feed `text` field = entity-encoded JSON array of `{ ty, te|url, … }`.

| Tilda `ty` | App block `type` | Notes |
|---|---|---|
| `preface` | `preface` | Lead; DOM often `blockquote.t-redactor__preface` |
| `text` | `paragraph` | Inline allowlist: `strong`, `em`, `a`, `br` |
| `heading` + `le` | `heading` | `level` 2–4; DOM `h3.t-redactor__h3` etc. |
| `image` | `image` | `src`/`alt`/`caption`/`width`/`height` |
| quote / list / video | reserved | Map when seen in corpus |

- **No** trusted raw production HTML document via `dangerouslySetInnerHTML`.
- Fixture `html` strings are pre-allowlisted at import; renderer is not a sanitizer.
- Cover stays metadata (`image` / `mediadata`), not a body block.
- Internal beer links rewritten to local `/beer/...` where present.

## 5. Listing + article DoD

- Local `/blog` + `/en/blog`; migrated cards → local tpost path; others → production.
- Archive CTA → production `/blog-all`.
- Article: pizza RU/EN pair + homebrew RU-only; switcher peer rules as §2.
- Nav/menu → local `/blog`.
- No Puck/CMS/ORM/Auth install in this stage.

## 6. Open

- Full peer map for all feed posts.
- Whether `/blog` stays curated vs full archive locally.
- Legacy `/blog/{slug}` 301 table.
- Puck install + CRM routes when stage 5/CMS gate opens.
