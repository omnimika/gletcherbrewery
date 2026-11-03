# `/tours` — source baseline

Дата: **03.11.2026**. Sprint 5 public template.

## Provenance

| Field | Value |
|-------|--------|
| Public URL | https://www.gletcherbrewery.com/tours |
| EN peer | https://www.gletcherbrewery.com/en/tours **Confirmed** |
| Tilda RU | `9644391` (`alias=tours`) |
| Tilda EN | `61456185` (`alias=en/tours`, `noheader`/`nofooter`) |
| Editor | https://tilda.ru/page/?pageid=9644391&projectid=1212341 |

## Structure (local v1)

1. Hero title stack (RU: экскурсия / на пивоваренный / завод; EN: GUIDED TOURS / OF THE / BREWERY)
2. Intro + bullets + facts + pricing cards + CTA → `#booking`
3. YCLIENTS embeds (personal + group widgets) — temporary
4. How to get (RU Confirmed from ZB `749545371`; EN omit until peer section Confirmed)
5. Reviews / impressions — ZB `750881518` (`#reviews`): typography stack, parallax stickers (`wow`/`peace`/`eyes`), CTA → Yandex reviews
6. Legal / prepay notice — ZB `862067954` (RU)
7. Request form stub + phone

**Open / deferred:** gift-certificate ZB `750921145` + payment forms `750984870` / `751007056` (Stage 8).

Related Tilda aliases `tours/check`, `tours/preorder` — **not** in this slice.

## Booking / prices

- YCLIENTS: `n1347695.yclients.com` company `1225539` — temporary iframe.
- RU prices from live ZB `750691212` (VIP 5000+2100 / group 2100).
- EN published HTML prices differ (VIP 3500+1600) — kept locale-specific; **Observed**, do not auto-merge.
- Do not invent prepayment/% rules; Stage 8 replaces booking.

## Acceptance

- `/tours` + `/en/tours`; nav/home CTA local.
- lint/tsc; browser smoke hero + booking iframes.
- Signup/payment backend **out of scope**.
