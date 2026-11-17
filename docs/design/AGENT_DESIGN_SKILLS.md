# Локальные design skills для агентов

Дата: **16.11.2026**. Статус: **Proposed** (локальный tooling; не меняет
продуктовый дизайн-контракт). Связано: [DESIGN_SYSTEM](DESIGN_SYSTEM.md),
[ADR 0010](../adr/0010-design-system-and-section-layout.md), [AGENTS.md](../../AGENTS.md).

## Что установлено локально

Три внешних набора skills стоят в рабочей копии для craft UI/motion и **не
являются частью поставки сайта**. Каталоги и lockfile в `.gitignore`.

| Источник | Назначение | Где лежит после `npx skills add` |
|---|---|---|
| [pbakaus/impeccable](https://github.com/pbakaus/impeccable) | Critique/audit/polish/harden/animate; опциональные hooks | `.agents/skills/impeccable`, копии/агенты в `.cursor/` и `.claude/` |
| [Leonxlnx/taste-skill](https://github.com/Leonxlnx/taste-skill) → `design-taste-frontend` | Anti-slop gate для marketing/landing | `.agents/skills/design-taste-frontend` |
| [emilkowalski/skills](https://github.com/emilkowalski/skills) | Motion craft (animate, review, improve, choreograph, …) | `.agents/skills/*` |

`skills-lock.json` пинит commit hashes Taste/Animation; Impeccable ставится
отдельным add и может не попадать в lock. Не коммитить ни lock, ни skill trees.

## Переустановка (Node ≥ 22.20)

CLI `skills` требует Node `>=22.20` (`fs/promises.glob`). В этом проекте для
npm-скриптов допустимы `^20.19 \|\| ^22.13 \|\| >=24` — для skill CLI
отдельно:

```sh
nvm use 22   # или другая установленная ≥22.20
npx skills add https://github.com/pbakaus/impeccable
npx skills add https://github.com/Leonxlnx/taste-skill --skill "design-taste-frontend"
npx skills add https://github.com/emilkowalski/skills
```

После установки skills остаются только локально. CI/clone без них валидны.

## Приоритет источников правды (обязателен)

Skills **не заменяют** migration baseline и бренд Gletcher.

1. Owner Confirmed + текущий спринт (`docs/CURSOR_NEXT_STEPS.md`, §7 AGENTS.md).
2. Source baselines: Tilda/MCP, `/about`, home, product templates.
3. `docs/design/DESIGN_SYSTEM.md` + ADR 0010 (токены, сетки, motion, a11y).
4. Локальные design skills — только как craft/review помощники на UI-задачах.

Если skill предлагает новый «visual world», SaaS-палитру, другую сетку,
scroll-hijack, целый UI-scale или игнорирует reduced-motion — **отклонить**
в пользу дизайн-кода и source parity.

## Когда вызывать

| Ситуация | Что использовать | Что не делать |
|---|---|---|
| M2 data/CRM/backend (текущий поток) | Ничего из design skills | Не уходить в redesign ради polish |
| Точечный polish существующей секции | `impeccable` → critique / polish / harden / quieter | Не `new-work` / полная замена identity без запроса владельца |
| Anti-generic review публичной landing | `design-taste-frontend` как checklist | Не запускать greenfield taste pipeline и не менять brand tokens |
| Motion на Gletcher UI | `animate`, `review-animations`, `improve-animations`, `choreograph`, `animation-performance`, `find-animation-opportunities` | Не ставить новую motion-библиотеку без нужды; сначала токены DESIGN_SYSTEM |
| Owner явно просит redesign поверхности | `impeccable` shape/new-work **после** явного brief | Не смешивать с Tilda source-parity без решения владельца |

### Не использовать в этом репозитории без отдельного запроса

`write-swift`, `apple-design`, `animate-expo`, `mobile-native`, `pick-ui-library`
(стек уже Next/TS/Tailwind), полный taste greenfield для «нового сайта».

## Как формулировать задачу агенту

Коротко и явно, чтобы skill не перехватил миграционный приоритет:

```text
Используй skill animate (emilkowalski) только для <компонент>.
Сохрани docs/design/DESIGN_SYSTEM.md токены и reduced-motion.
Не меняй brand palette / section grid / source copy.
```

```text
Сделай impeccable critique/polish для <маршрут>, mode Operate|Persuade.
Baseline: DESIGN_SYSTEM + существующий бренд. Без new-work redesign.
```

## Hooks

Impeccable может поставить local hooks (`.cursor/hooks.json`, `.codex/hooks.json`,
`.claude/settings.local.json`). Они локальные и gitignored. На backend-only
задачах hooks обычно no-op или дёшево проверяют UI edits; при мешании —
временно отключить локально, не коммитить.

Taste-skill gate ожидает Node 22+ и Chromium; не делать его обязательным
CI/DoD для data-stream спринтов.

## Связь с продуктовым DoD

Публичный UI по-прежнему принимается по DESIGN_SYSTEM, route baselines и
owner visual acceptance. Наличие skills на машине разработчика **не** закрывает
Stage4 `/about`, home или design-system acceptance.
