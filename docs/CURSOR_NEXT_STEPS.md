# Текущее задание Cursor — M1 Mapbox CRM follow-up

Дата: **10.11.2026**.

## Приоритет владельца

Довести **карту + Mapbox CRM** до конца. **M2 Airtable/loyalty не начинать**,
пока retail map/CRM не закрыт.

## Done (10.11)

- B1–B3 forms + staff triage
- M1-0/M1-1 assortment matrix
- M1-2a Product adapter + dry-run
- **Live Product publish** run `e3f969c2-c493-404d-9e55-60523636ee94`
  - MTS: twoaxes, metro-globus-okey, azbuka, auchan-atak, winelab, eurospar,
    aromatny-mir, maksi, hmel-i-solod → `published`
  - Studio: perekrestok, lenta, selgros-miratorg-yabloko-5m7m, magnit, dixie,
    yarche → `upload_started` (async processing)
  - Patch: 7909/7914 features; unmatched only `5M Гурман` / `7М Безцен`
  - Gate returned to `MAPBOX_ALLOW_TILESET_PUBLISH=false`

## Следом

1. Verify `/map` beer+chain filters after Mapbox tile cache settles (несколько минут)
2. After Studio jobs finish: confirm `yarche` style `source-layer` stays `yarche`
   (Studio replace previously flipped it back to `Yarchefinal-2d64rg` — re-fixed)
3. Store-level CRM / remaining CRM-only chains — отдельным этапом

## Explicitly deferred

- M2 Airtable / «Агент Глетчер»
- Production tileset mutate without allow flag

## Git

Commit/push по запросу. Не коммитить `.env.local` / tokens.
