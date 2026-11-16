# `/map` — source baseline

Дата: **03.11.2026**. Sprint 5 public template.

## Provenance

| Field | Value |
|-------|--------|
| Public URL | https://www.gletcherbrewery.com/map |
| EN peer | https://www.gletcherbrewery.com/en/map **Confirmed** |
| Raw HTML | `docs/discovery/_raw/page__map.html`, `page__en__map.html` |
| Style | `mapbox://styles/omnicoremaps/cknj3azmg0w2t17qqmylsfz8x` |
| Center / zoom | `[50.291418, 53.343783]` / `3.52`, `projection: globe` |

## UI (Observed from published HTML)

1. Hero copy above map (navy + `#aac3ff` accent)
2. Map in bordered frame (`#map`: ~90% width, ~80vh, 4px `#0d0f49`, radius 10)
3. Side panel «Выбор сорта»: circular 80px beer thumbs, vertical Classic/Craft/Limited labels, series backgrounds
4. Geolocate + fullscreen + geocoder
5. Click popup: `Title`, `Adress`, `Product` (**singular** — do not rename)
6. Filter: `'in', beerName, ['coalesce', ['get', 'Product'], '']` on retail layers
7. Site footer visible (not hideFooter)

## Layers (Confirmed in HTML)

`auchan-atak`, `twoaxes-drinx-beruvykhodnoy`, `selgros-miratorg-yabloko-5m7m`,
`winelab`, `eurospar`, `dixie`, `metro-globus-okey`, `azbuka`, `perekrestok`,
`magnit`, `lenta`

## Product keys (RU panel)

Classic: Ausweis, Heidegger Hell, Rouge de Fleur  
Craft: Blue Monkey … Underground Ale (incl. Milk of Amnesia non-alcoholic)  
Limited: Brut Grapefruit, Hop Dragon, Tour De Grapefruit, CYNIC  

EN panel omits Milk of Amnesia non-alcoholic + CYNIC (Observed).

## Security

- Production HTML embeds public `pk.` token — **do not commit** into the repo.
- Local: `NEXT_PUBLIC_MAPBOX_TOKEN` only. Without token → graceful empty state + link to production.

## Out of scope (later)

- PostgreSQL / NocoDB as source of truth, tileset republish, CRM edits.
- Assortment availability claims beyond Mapbox `Product` property snapshot.
