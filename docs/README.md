# Документация проекта

Часть `docs/` **публична в git**, часть **локальная** (partial ignore в
корневом `.gitignore`). Файлы на диске у разработчика не удаляются; они просто
не уходят в публичный GitHub после `git rm --cached` + коммита.

## Публично (коммитить)

| Путь | Зачем |
|---|---|
| `docs/adr/` | Architecture Decision Records |
| `docs/design/` | Дизайн-контракт + политика локальных design skills |
| `docs/backend/` | Формы/CRM/B1 runbook — рабочие контракты кода |
| `docs/development.md` | Локальный запуск и проверки |
| `docs/discovery/*_BASELINE.md`, page/Tilda contracts | Source parity без raw dumps |
| `docs/data/RETAIL_IMPORT_CONTRACT.md` | Контракт retail import (если есть) |
| `docs/brand/README.md` | Указатель на brand assets |
| этот `README.md` | Карта видимости |

## Локально (gitignored)

| Путь | Почему |
|---|---|
| `CURSOR_NEXT_STEPS.md`, `CURSOR_REVIEW_PROMPT.md`, `SPRINT_PLAN.md`, `ROADMAP.md` | Очередь/планы агентов |
| `reviews/`, `archive/` | Внутренние ревью и устаревшие планы |
| `discovery/_raw/` | HTML/JSON/CSV dumps исходников |
| `discovery/BLOG_BATCH*_MANIFEST.md` | Операционные manifests контента |
| Loyalty/FNS/inventory markdown в `data/` и `discovery/` | Чувствительные схемы, writers, migration |
| `data/fixtures/` | Локальные synthetic fixtures |
| `brand/**/*.pdf` | Крупные brand PDF |

`AGENTS.md` ссылается и на локальные файлы: они обязательны **на машине
разработки**, но не обязаны быть в публичном remote.

## Снять уже закоммиченное с индекса (один раз)

После обновления `.gitignore`, не удаляя файлы с диска:

```sh
git rm -r --cached docs/reviews docs/archive docs/discovery/_raw
git rm --cached docs/CURSOR_NEXT_STEPS.md docs/CURSOR_REVIEW_PROMPT.md \
  docs/SPRINT_PLAN.md docs/ROADMAP.md \
  docs/brand/*.pdf \
  docs/discovery/BLOG_BATCH*_MANIFEST.md \
  docs/data/fixtures/** \
  docs/data/SOURCE_INVENTORY.md docs/data/AIRTABLE_LOYALTY_SCHEMA.md \
  docs/data/LOYALTY_WRITERS_MAP.md docs/data/LOYALTY_MIGRATION_PLAN.md \
  docs/data/PRODUCT_GTIN_CATALOG.md \
  docs/discovery/LOYALTY_OWNER_QUESTIONS.md \
  docs/discovery/FNS_OPEN_API_APPLICATION_DRAFT.md \
  docs/discovery/RECEIPT_FNS_PROVIDER_RESEARCH.md \
  docs/discovery/INTEGRATIONS_AUDIT.md \
  docs/discovery/MEMBERS_LK_INVENTORY.md \
  docs/discovery/SITE_INVENTORY.md \
  docs/discovery/CONTENT_SEO_INVENTORY.md
```

Коммит/push — только по явному запросу владельца.
