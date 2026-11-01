# Текущее задание Cursor Agent

Дата: **01.11.2026**. Sprint 5 — публичные шаблоны по одному.
[План](SPRINT_PLAN.md).

## Принято владельцем

| Страница | Дата |
|----------|------|
| `/beer`, product template | ранее |
| `/partnership` RU/EN v1 | **01.11.2026** |

## Sprint 5 — ждут приёмки

| Страница | Статус |
|----------|--------|
| `/russian-craft-beer` | v1, ждёт приёмки |
| `/horeca` | v1 + MCP media/anim (hero video, compare imgs, map, fade/zoomin) |
| `/contacts` | RU-only; baseline smoke |
| `/policy` | RU-only verbatim; footer/forms → `/policy` |

### `/horeca` (после MCP enrich)

Baseline: [HORECA_PAGE_BASELINE.md](discovery/HORECA_PAGE_BASELINE.md).
Источник: page `103271966`, ZB `get_zero_block` + animation keys.
Open: scroll parallax bottle; SBS rotate slogan; formname Klin May Fest.

### `/contacts` / `/policy`

Baselines в `docs/discovery/`. Open на contacts: Mapbox iframe / retail logos.

### Приёмка

- [x] local smoke + lint / typecheck (включая horeca enrich)
- [ ] Владелец принимает

### Дальше после приёмки

1. `/shopping-rules` (оставшийся legal).
2. agent / tours / map / shop.
3. Event campaign landings.

Commit/push — только по запросу.
