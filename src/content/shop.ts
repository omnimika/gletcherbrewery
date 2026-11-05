/**
 * RU-only `/shop` — firm store (hours ZB, rules popup, address/map).
 * Provenance: docs/discovery/SHOP_PAGE_BASELINE.md + published HTML 04.11.2026.
 * Catalog/cart deferred: Tilda store products all `off`.
 */

export const SHOP_PATH = "/shop" as const;

export const SHOP_PAGE = {
  path: SHOP_PATH,
  metaTitle: "Магазин | Пивоварня Глетчер",
  metaDescription: "Мерчандайз и прочие приятности",
  shortTitle: "Магазин",

  hours: {
    title: "Время работы",
    label: "Мы работаем :",
    /** Production atom: ПН-<span red>ВС</span>: <em>10:00 – 19:00</em> */
    scheduleBefore: "ПН-",
    scheduleSunday: "ВС",
    scheduleAfter: ":",
    scheduleTime: "10:00 – 19:00",
    callLabel: "Позвонить в магазин:",
    phoneDisplay: "+7 (929) 634-50-17",
    phoneHref: "tel:+79296345017",
    partnershipLabel: "По вопросам сотрудничества →",
    partnershipHref: "/partnership",
  },

  gallery: [
    {
      src: "https://static.tildacdn.com/tild3933-6163-4138-b566-343434346130/1Q8A1762.jpg",
      alt: "Фирменный магазин Gletcher Brewery",
    },
    {
      src: "https://static.tildacdn.com/tild3233-3763-4261-b439-383031333832/1Q8A1770.jpg",
      alt: "Интерьер фирменного магазина Gletcher",
    },
  ],

  rules: {
    title: "Правила магазина",
    body: "Мы не осуществляем дистанционную продажу алкоголя, не продаем и не доставляем алкоголь несовершеннолетним, мы не продаем и не доставляем алкоголь в ночное время. У нас на сайте вы можете зарезервировать нужное вам количество пива и забрать самовывозом из нашего фирменного магазина в Клину.",
    moreBefore: "Подробнее – в",
    moreLinkLabel: "правилах магазина",
    moreHref: "/shopping-rules",
    closeLabel: "Закрыть",
  },

  address: {
    eyebrow: "Адрес магазина Gletcher",
    lines: [
      "Московская область,",
      "г. Клин,",
      "ул. Терешковой, 1 стр.4И",
    ],
    travelLead:
      "Есть несколько лёгких и доступных способов добраться до нашего магазина:",
    links: [
      {
        label: "Яндекс.Навигатор: Маршрут",
        href: "https://yandex.ru/maps/-/CCQxZTqdsC",
      },
      {
        label: "Расписание электричек из Москвы.",
        href: "https://rasp.yandex.ru/suburban/moscow--klin-station",
      },
    ],
    legal: [
      "ИП Мищенко Андрей Владимирович",
      "ИНН 773300218007",
      "ОГРНИП 313774621800089",
    ],
    map: {
      lat: 56.348616,
      lng: 36.694416,
      zoom: 16,
      title: "Магазин Gletcher",
    },
  },
} as const;

/**
 * Yandex map-widget. `theme=dark` approximates Tilda `bw_dark` (Observed).
 * No secret key in client.
 */
export function shopMapWidgetSrc(): string {
  const { lng, lat, zoom } = SHOP_PAGE.address.map;
  const params = new URLSearchParams({
    ll: `${lng},${lat}`,
    z: String(zoom),
    pt: `${lng},${lat},pm2rdm`,
    l: "map",
    theme: "dark",
  });
  return `https://yandex.ru/map-widget/v1/?${params.toString()}`;
}
