# UI Component Audit — Gletcher Brewery

> Дата: **31 октября 2026**  
> Визуальный осмотр: Cursor IDE Browser, viewport **1440×900** (desktop) и **390×844** (mobile).  
> Статусы: **Confirmed** / **Observed** / **Assumed** / **Unknown**

## 1. Визуальная система (Observed)

| Токен | Значение | Источник |
|---|---|---|
| Фон страницы | `rgb(230, 238, 252)` ≈ `#E6EEFC` | computed `body` |
| Primary navy | `rgb(13, 15, 73)` ≈ `#0D0F49` | H1 / UI |
| Accent red | `rgb(229, 55, 60)` ≈ `#E5373C` | logo/CTA/border |
| Белый | `#FFFFFF` | age-gate card, text on red |
| Display font | `Gratimo-ABCGravity`, fallback Arial | computed styles |
| Body/UI font | Arial / Helvetica stack | Tilda defaults |
| H1 hero (desktop) | ~116px, weight 900, uppercase | home |
| Radius | преимущественно «острые» кнопки; lang — pill; filter — pill | Observed |
| Background atmosphere | light cool blue field; hero photography; oversized type layers | home/beer |

**Не использовать** типичные AI-defaults (purple gradients, cream+terracotta) — бренд уже задан navy/red/cool-blue.

### Шрифты — поставлены владельцем (31.10.2026)

Runtime на сайте: `Gratimo-ABCGravity` (+ Arial fallback).

Локально в проекте (`assets/brand/fonts/`):

| Набор | Путь | Заметки |
|---|---|---|
| Site-used | `assets/brand/fonts/site-used/` | ABC Gravity widths (Compressed…Wide) **Trial** `.otf` + `WOFF/`; GratimoClassic Regular/Bold woff |
| Gratimo | `assets/brand/fonts/gratimo/` | Classic Black/Regular/LightItalic ttf+woff; demo-bold |
| Gravity | `assets/brand/fonts/gravity/` | полное семейство + `Gravity_License.pdf` |
| Cera Pro | `assets/brand/fonts/CeraPro-*.ttf` | возможно для UI/вторичного текста |

**Open:** какие width ABC Gravity реально стоят на `/beer` (Condensed vs ExtraCondensed); можно ли Trial в production; нужен ли Cera Pro на вебе.

### Motion — Observed

- Tilda animation CSS/JS (`tilda-animation-2.0`).
- Overlay menu open/close.
- Age-gate popup.
- Mobile catalog slider arrows.
- Home: product bottle + large type layering (parallax/scroll — **Assumed**, не профилировалось).

Для Next: 2–3 осознанных motion (age-gate, menu, hero entrance), без копирования всего Tilda animation runtime.

## 2. Глобальные компоненты → React candidates

| Компонент | Где | Состояния | Приоритет |
|---|---|---|---|
| `AgeGate` | все публичные | closed (cookie/local), open modal, confirm CTA | P0 |
| `SiteHeader` | все | default, scrolled?, menu-open | P0 |
| `LocaleSwitch` | header/menu | RU active / EN active | P0 |
| `MainNavOverlay` | `#menuclick` | closed/open; desktop+mobile layouts | P0 |
| `AgentShortcut` | header «А / АГЕНТ» | link to `/agent` | P0 |
| `AuthCtas` | menu | login / signup → Tilda Members | P1 |
| `LkShell` / wallet / receipt form | `/members/lk` | см. MEMBERS_LK_INVENTORY — **не этап эталона** | P3 |
| `SiteFooter` | все | contacts, policy, social, 18+, rating badge | P0 |
| `Button` / `ButtonLink` | CTA | primary red, secondary outline navy, ghost | P0 |
| `SectionHeading` | секции | oversized condensed uppercase | P0 |
| `NewsletterForm` | home | idle/loading/success/error (не тестировалось) | P1 |
| `LeadForm` | beer/partnership/contacts | fields vary | P1 |
| `ProductCard` | `/beer`, home teasers | image, optional NEW badge, link | P0 |
| `ProductFilterChips` | `/beer` | ALL/CLASSIC/CRAFT/LIMITED active | P0 |
| `ProductGallery/Slider` | `/beer` mobile | arrows, swipe | P1 |
| `ProductSpecs` | product page | ABV/IBU/density/style/volumes | P1 |
| `BlogCard` / `BlogList` | home, `/blog` | category label, date, excerpt | P1 |
| `MapPageShell` | `/map` | filters UI TBD; map canvas | P2 |
| `ToursPricingCards` | `/tours` | group/VIP | P2 |
| `YclientsEmbed` | `/tours` | iframe wrapper | P2 temporary |
| `StoreGrid` / `Cart` | `/shop` | Tilda store parity TBD | P2 |
| `LegalNotice18` | footer | static | P0 |
| `SocialLinks` | footer | TG, VK (+possibly others) | P1 |

## 3. Header / Menu — Observed

**Desktop header (поверх контента):**

- Слева: RU/EN pill.
- Центр: logo mark + wordmark «Gletcher» / «since BREWERY 2011».
- Справа/верх: иконка/ссылка Агент, кнопка «МЕНЮ».

**Overlay menu:**

- Полноэкранный cool-blue фон.
- Крупные right-aligned пункты: ПРОДУКЦИЯ, ПАРТНЁРАМ, ЭКСКУРСИИ, КАРТА ПРОДАЖ, БЛОГ.
- Снизу: красная CTA «ВОЙТИ В ЛИЧНЫЙ КАБИНЕТ»; вторичная регистрация.
- Lang switch остаётся доступным.

**Mobile (390):**

- Logo center; lang compact; hamburger circle.
- Каталог: filter chips + bottle slider with navy arrow buttons.

## 4. Типографика и сетка — Observed / Assumed

- Display: ultra-condensed, heavy, all-caps, tight leading — бренд-сигнал №1.
- Body: обычный grotesque (Arial), читаемый.
- Секции часто full-bleed, крупные вертикальные ритмы; не «карточный dashboard».
- Карточки каталога — скорее product photography на плоскости, без тяжёлых card chrome (**Observed**).

**Assumed breakpoints:** Tilda стандарт (~960/640); точные media queries не извлечены. Для Next предложить: `sm 640 / md 768 / lg 1024 / xl 1440`, сверить на эталоне.

## 5. Формы — Observed (поля; submit не вызывался)

| Место | Поля | CTA |
|---|---|---|
| Home newsletter | E-mail | ПОДПИСАТЬСЯ |
| `/beer` ideas | Имя, Email, Комментарий | Отправить |
| `/partnership` / `/contacts` | Tilda form fields (см. raw HTML) | Отправить / аналог |
| `/tours` | 3 forms + YCLIENTS | ЗАБРОНИРОВАТЬ* |

Нужны: согласие на обработку ПДн, endpoint замены Tilda forms, антиспам.

## 6. Модалки и оверлеи

| UI | Тип | Поведение |
|---|---|---|
| Age-gate `t658` | Modal confirm | Блокирует сайт до «ДА. ПЕРЕЙТИ НА САЙТ.» |
| Main menu | Fullscreen overlay | По `#menuclick` |
| Map popups | Mapbox popup | `Title` property |
| Store cart | Tilda cart drawer/page | `/shop` only — детали Unknown |

## 7. Уникальные / сложные поверхности

| Поверхность | Почему сложно | Когда трогать |
|---|---|---|
| Home hero | oversized type + photo composition + motion | После design tokens; или как эталон №2 |
| `/map` | Mapbox style/filters/data | Этап 6 |
| `/tours` | YCLIENTS + pricing + legal | Этап 8 для логики |
| `/agent` + members | Collabza auth | Этап 7 |
| `/shop` | Store/cart + alcohol law | Отдельное решение |
| `/aging`, campaigns | one-off art direction | После шаблонов |

## 8. Адаптив — Confirmed visually

| Viewport | Что проверено |
|---|---|
| 1440×900 | Age-gate, home hero, menu overlay |
| 390×844 | Home/beer mobile chrome; beer filters + slider |

**Не снято полностью:** все секции home mobile scroll, product page mobile, map mobile gestures, tours booking UI. Рекомендуется добрать скриншоты владельцем или агентом перед приёмкой эталона.

## 9. Доступность — Observed issues

- Age-gate: контент за модалкой; нужен focus trap / Esc / явная кнопка.
- Карточки `/beer`: ссылки без текстового имени (пустой accessible name).
- Oversized text как H1 «gletcher» — OK для бренда; убедиться что скрытый/видимый текст не дублируется плохо для screen readers.
- Контраст navy на `#E6EEFC` — выглядит достаточным; проверить red-on-white CTAs.

## 10. Технические замечания для реализации

1. Не копировать Tilda DOM/классы (`t-rec`, `tn-atom`) — воссоздать семантикой.
2. Zero Block layouts → CSS Grid/Flex + абсолютные слои только где нужно для hero.
3. Изображения: `next/image`, источники после экспорта; сейчас Tilda CDN.
4. Видео home/agent: `files.gletcherbrewery.com` (mp4/webm) — сохранить или перенести в Object Storage.
5. Аналитические скрипты — через consent strategy (Open / юр.).

## 11. Рекомендуемый порядок сборки UI

1. Tokens (color, type, space)  
2. `Button`, `LocaleSwitch`, `LegalNotice18`  
3. `AgeGate` + `SiteHeader` + `MainNavOverlay` + `SiteFooter`  
4. `ProductFilterChips` + `ProductCard`  
5. Секции эталонной страницы  
6. Forms primitives  

