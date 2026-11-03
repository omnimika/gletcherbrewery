# `/agent` — source baseline

Дата: **03.11.2026**. Bonus program landing (Sprint 5).

## Provenance

| Field | Value |
|-------|--------|
| Public URL | https://www.gletcherbrewery.com/agent |
| Tilda project | `1212341` |
| Tilda page | `44414247` (`alias=agent`, `nofooter=on`) |
| EN peer | **none** Confirmed |
| Editor URL | https://tilda.ru/page/?pageid=44414247&projectid=1212341 |

## Zero Blocks (published order)

| Record | Role |
|--------|------|
| `711680591` | Hero — Стань агентом / gletcher / bottle video / pills / slogan seal |
| `720411103` | Purchases — регистрируй / ПОКУПКИ |
| `720628054` | Bircoins — ЗАРАБАТЫВАЙ / БИРКОИНЫ + coin stickers |
| `720648821` | Partner — ИГРАЙ ЗА НАС / 3 cards |
| `720675280` | Status — ПОДНИМАЙ СТАТУС / privileges |
| `720952281` | Finale — CTA + coin/registration video + login |

tpl `215` covers between ZBs are visual separators only (not reimplemented as content).
Draft ZB `718523054` is an old long dump — **not** the published path.

## Motion / fonts / z-index

- Font: `Gratimo-ABCGravity` → local `font-display` (same family stack).
- Motion via `zb-motion`: viewport appear (`animstyle` + duration/delay/distance/scale) and SBS (`sbsopts` + `blockintoview`), plus scroll/mouse parallax where ZB sets `animprx`.
- Hero: zoomin 0.5/0.8 + 1/0.7; pills fadein*; CTA/video fadeinup; seal SBS → −120°; video `animprxs=120`.
- Purchases/coins/partner/status: SBS scale-in titles + coin `bounceFin`; receipt mouse parallax.
- Hero z-order Confirmed: title 3 → brand 4 → pills 8–10 → CTA 14 → bottle video 15 → seal 16.
- Page `nofooter=on` → SiteShell `hideFooter`.
- Signup/login remain production `/members/*` until auth migrates.

## Local assets

`public/agent/*.png` downloaded from Tilda CDN 03.11.2026.
Videos stream from `files.gletcherbrewery.com` (same as production).

## Acceptance (local v1)

- `/agent` RU-only; EN switcher → `/`.
- Six screen slides + proximity snap; header АГЕНТ → local `/agent`.
- lint / typecheck / browser smoke vs production composition.
