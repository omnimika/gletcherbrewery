# Текущее задание Cursor Agent

Дата: **01.11.2026**. База ревью Codex: `2c1a9d0`. После sprint 1 Cursor
закрыл H01–H04 в рабочем дереве; **home ждёт приёмки владельцем**.
[Ревью](reviews/2026-11-01-home-and-sprints.md), [план спринтов](SPRINT_PLAN.md),
[baseline](discovery/HOME_PAGE_BASELINE.md), [промпт](CURSOR_REVIEW_PROMPT.md).

## Статус gates

| Gate | Статус |
|------|--------|
| `/beer` каталог | **Принят** 31.10.2026 |
| `/beer/{slug}` product template | **Принят** 31.10.2026 (`0df9706`) |
| Cynic visual polish | **Owner follow-up** |
| Home `/`, `/en` | **Ready for owner acceptance** (H01–H04 done; lint/tsc/build PASS) |

## Sprint 1 — сделано

1. **H01:** RU teasers → Confirmed tpost URLs from published home (see baseline).
2. **H02:** PNG stays until first successful canvas frame; draw/readback errors restore PNG.
3. **H03:** pause RAF + video when offscreen or tab hidden; reduced-motion/Save-Data already disable video plan.
4. **H04:** client email validity + `newsletterInvalid`; pending note only on valid submit (no backend).
5. Checks: `npm run lint`, `npx tsc --noEmit --incremental false`, `npm run build`; local `/` `/en`;
   browser teasers/newsletter; 390×844 and 1440×900 screenshots. MCP Tilda unavailable this session.
6. CPU/Network/LCP **not** instrumented — do not treat as PASS.

## После приёмки home

Спринт 2 (Proposed): blog source/content/i18n contract + один listing —
см. [SPRINT_PLAN](SPRINT_PLAN.md). Не начинать до согласия владельца.
Commit/push — только по запросу.

## Не сейчас

map/agent/tours backend, NocoDB, новые локали, Cynic polish, CMS/БД.
