# Реестр архитектурных решений

Статус `Proposed` описывает предложение, не принятое окончательное решение.
Допуск к конкретной реализации определяется текущим заданием/инструкцией
владельца: в DS-1 разрешено подготовить reviewable showcase с Proposed values.
`Confirmed` применяется только к явно утверждённой части решения.

| Файл | Область | Статус |
|---|---|---|
| [0000-frontend-bootstrap.md](0000-frontend-bootstrap.md) | Заказанный Next.js/TS/Tailwind/npm стек | Confirmed |
| [0000-site-migration-strategy.md](0000-site-migration-strategy.md) | Общие шаблоны и порядок переноса | Proposed |
| [0001-i18n-routing-and-content.md](0001-i18n-routing-and-content.md) | URL, переводы, публикация и SEO | **Accepted** |
| [0005-cms.md](0005-cms.md) | Rich-content / Puck / Tilda block map | **Proposed** (editor preference Confirmed) |
| [0010-design-system-and-section-layout.md](0010-design-system-and-section-layout.md) | Design tokens, секции/сетка/anchors/UI/state/motion | **Direction Confirmed**, technical values/API Proposed |

Два исторических файла с префиксом `0000` сохранены по существующим путям.
В ссылках использовать полное имя файла. Резерв `0002`–`0004`, `0006`–`0009` — в
[ROADMAP](../ROADMAP.md#5-решения-которые-ещё-нужно-принять-adr-backlog).
`0001` занят i18n; `0005` занят CMS sketch; `0010` занят design system.
Не использовать эти номера для Database.

Backend/hosting ADR оформляются при приближении соответствующего этапа.
Установка Puck/CMS отложена до CRM-этапа; публичный рендерер блоков — раньше.
