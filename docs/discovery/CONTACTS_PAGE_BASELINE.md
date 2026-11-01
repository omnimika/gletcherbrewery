# `/contacts` — source baseline

Дата: **01.11.2026**. Sprint 5 informational template after B2B landings.

## Provenance

| Locale | Public URL | Tilda page | Records | Published |
|--------|------------|------------|---------|-----------|
| RU | https://www.gletcherbrewery.com/contacts | `8475727` | 11 | yes |
| EN | `en/contacts` page `17388958` | — | 13 | **no** (unpublished) |

Tools: MCP settings/records/ZB; raw `page__contacts.html`; public extract.

## Sections (published RU)

1. Hero H1 `КОНТАКТЫ` (ZB `359318611`, brewery photo bg).
2. Company card tpl `554` `248270998` — OOO «ГЛЕТЧЕР», ИНН, address, phones, emails, travel links.
3. «СВЯЖИТЕСЬ С НАМИ» intro tpl `795` + lead form ZB `229774030` (`formname=contact-us`).
4. Editor-only / not in published HTML: Mapbox iframe ZB, retail logos strip, breadcrumb ZB — **omit in v1**.

## Confirmed contact facts

- Legal: OOO «ГЛЕТЧЕР», ИНН `7729664700`
- Address: `141602, Московская область, г. Клин, ул. Терешковой, д.1 стр.2`
- Brand manager: Алексей Котельников, `+7 (963) 921-10-51`
- Office: `+7 (495) 989-24-14`
- Shop: `+7 (929) 634-50-17`
- Emails: `info@svamgroup.ru`, `info@gletcherbrewery.com`
- Yandex Navigator / bus / suburban schedule links (Observed URLs in HTML)

## Form (stub)

Source fields: name*, email*, phone*, city, юрлицо, фасовка, сорт select, qty, comment.
Local v1: core fields + comment; assortment/qty/packaging deferred (stale SKU list on source).
No real POST.

## Acceptance (local v1)

- `/contacts` RU-only; `/en/contacts` → 404; EN switcher → `/`.
- H1, company block, form stub, travel links.
- lint / typecheck / browser smoke.
