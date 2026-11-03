/**
 * `/tours` + `/en/tours` — brewery excursion landing.
 * Provenance: Tilda RU `9644391`, EN `61456185` (MCP + published HTML 03.11.2026).
 * Prices/copy = source snapshot Confirmed from published pages; do not treat as
 * immutable business rules (booking/payment Stage 8+). EN VIP price text differs
 * from current RU ZB — keep locale-specific, do not merge.
 */

import type { PublishedLocale } from "@/i18n/locales";

export const TOURS_PATH = "/tours" as const;
export const TOURS_PATH_EN = "/en/tours" as const;

export const TOURS_LOCALE_HREFS = {
  ru: TOURS_PATH,
  en: TOURS_PATH_EN,
} as const;

/** Temporary YCLIENTS embeds — replace when booking migrates (Stage 8). */
export const TOURS_YCLIENTS = {
  personal:
    "https://n1347695.yclients.com/company/1225539/personal/select-services?o=",
  group: "https://n1347695.yclients.com/group-events-widget?o=",
} as const;

export type ToursCopy = {
  path: string;
  metaTitle: string;
  metaDescription: string;
  hero: {
    line1: string;
    line2: string;
    line3: string;
  };
  invite: string;
  bullets: readonly string[];
  pricingTitle: string;
  facts: readonly { label: string; value: string }[];
  cards: readonly {
    id: string;
    title: string;
    detail: string;
    price: string;
  }[];
  bookCta: string;
  bookingTitle: string;
  bookingLead: string;
  howTitle?: string;
  how?: readonly {
    title: string;
    body: string;
    links: readonly { label: string; href: string }[];
  }[];
  requestTitle: string;
  requestLead: string;
  requestFields: {
    name: string;
    phone: string;
    date: string;
    guests: string;
    email: string;
    wishes: string;
    submit: string;
    ok: string;
  };
  phone: { label: string; href: string };
  /** ZB 750881518 — «Поделитесь впечатлениями» */
  reviews: {
    lead: string;
    line1: string;
    line2: string;
    line3: string;
    line4: string;
    note: string;
    cta: string;
    href: string;
  };
  /** ZB 862067954 — operator / prepay notice (RU Confirmed). */
  legalNotice?: {
    operator: string;
    inn: string;
    bank: string;
    corr: string;
    warning: string;
  };
  gastroNote?: string;
};

export const TOURS_REVIEW_STICKERS = {
  wow: "/tours/sticker-wow.png",
  peace: "/tours/sticker-peace.png",
  eyes: "/tours/sticker-eyes.png",
} as const;

const RU: ToursCopy = {
  path: TOURS_PATH,
  metaTitle:
    "Экскурсии | Gletcher Brewery | Пивной тур с дегустацией на пивоварне Глетчер",
  metaDescription:
    "Экскурсия на пивоваренный завод – это отличный способ провести время с друзьями, коллегами или деловыми партнерами! Вас ждёт незабываемое путешествие по всем этапам производства, а также дегустация всех доступных сортов пива на нашем пивзаводе. ",
  hero: {
    line1: "экскурсия",
    line2: "на пивоваренный",
    line3: "завод",
  },
  invite:
    "Приглашаем вас в настоящее путешествие в город Клин на пивоваренный завод GLETCHER!",
  bullets: [
    "На экскурсии вы познакомитесь со всеми этапами пивоварения: посетите цеха дробления, розлива пива в кеги и бутылки, варочный порядок и цех брожения.",
    "Вы узнаете какие химические процессы происходят во время изготовлениях пива, зачем нужна микробиологическая лаборатория и чем она отличается от физико-химической лаборатории.",
    "А в конце экскурсии вы попробуете все актуальные на данный момент сорта, выпускаемые нашей пивоварней!",
  ],
  pricingTitle: "Стоимость экскурсии с дегустацией:",
  facts: [
    { label: "Продолжительность экскурсии", value: "2 часа" },
    { label: "Минимальный возраст", value: "18 лет" },
    {
      label: "Не забудьте взять паспорт",
      value: "Для участия в дегустации",
    },
    {
      label: "разрешена фото-и видеосъемка",
      value: "На территории завода",
    },
  ],
  cards: [
    {
      id: "vip",
      title: "ИНДИВИДУАЛЬНАЯ ЭКСКУРСИЯ (VIP)",
      detail: "Выбор даты и времени определяется гостями. Группы от 1 до 50 человек.",
      price: "5000₽ ЗА ЭКСКУРСОВОДА И ПО 2 100₽ С ЧЕЛОВЕКА",
    },
    {
      id: "group",
      title: "ГРУППОВАЯ ЭКСКУРСИЯ (Регулярная)",
      detail:
        "Точные дата и время согласовываются при формировании группы. Группа от 4 до 30 человек.",
      price: "2 100 ₽ С ЧЕЛОВЕКА",
    },
  ],
  bookCta: "ЗАБРОНИРОВАТЬ",
  bookingTitle: "Онлайн-запись",
  bookingLead:
    "Выберите удобный слот в виджете. Полная замена YCLIENTS — отдельный этап.",
  howTitle: "КАК ДОБРАТЬСЯ?",
  how: [
    {
      title: "НА МАШИНЕ",
      body: "Добраться до нас на машине – самый комфортный вариант. Но имейте в виду, что в часы пик дорога до нас из центра Клина может занять до 30 минут. Кстати, совсем рядом с нами есть АЗС.",
      links: [
        {
          label: "Яндекс.Навигатор: Маршрут",
          href: "https://yandex.ru/maps/-/CCQxZTqdsC",
        },
      ],
    },
    {
      title: "НА ОБЩЕСТВЕННОМ ТРАНСПОРТЕ",
      body: "Если вы собираетесь приехать к нам на общественном транспорте из другого города, – то добирайтесь поездом до станции Клин, а затем ещё немного на такси до пивоварни.",
      links: [
        {
          label: "Расписание электричек из Москвы",
          href: "https://rasp.yandex.ru/suburban/moscow--klin-station",
        },
        {
          label: "Расписание электричек из Твери",
          href: "https://rasp.yandex.ru/suburban/tver--klin-station",
        },
      ],
    },
    {
      title: "НА ВЕЛОСИПЕДЕ",
      body: "Мы большие поклонники велосипедного спорта. Если вы приезжаете в теплое время года, то пивоварня находится в нескольких минутах езды на велосипеде от центра города, вокзала и автобусной станции.",
      links: [],
    },
  ],
  requestTitle: "Оставить заявку",
  requestLead:
    "Опишите пожелания — менеджер свяжется с вами. Отправка на сервер пока stub (этап бронирований).",
  requestFields: {
    name: "Ваше имя",
    phone: "Телефон",
    date: "Желаемая дата",
    guests: "Количество гостей",
    email: "Email",
    wishes: "Опишите ваши пожелания",
    submit: "ОТПРАВИТЬ",
    ok: "Заявка принята локально. Мы ещё не отправляем её на сервер.",
  },
  phone: { label: "+7 (926) 549-97-24", href: "tel:+79265499724" },
  reviews: {
    lead: "ПОСЛЕ ТАКОЙ ЭКСКУРСИИ ВЫ НЕСОМНЕННО СМОЖЕТЕ БЛЕСНУТЬ ЗНАНИЯМИ О ПРОЦЕССЕ ИЗГОТОВЛЕНИЯ ПИВА ПЕРЕД СВОИМИ ДРУЗЬЯМИ. МЫ ЖДЁМ ВАС!",
    line1: "ПОдеЛИТЕСЬ",
    line2: "ВПЕЧАТЛЕНИЯМИ",
    line3: "О НАШЕЙ ПРОДУКЦИИ",
    line4: "ИЛИ О ВИЗИТЕ НА НАШУ ПИВОВАРНЮ",
    note: "Каждый отзыв важен для нас, потому что вы помогаете нам стать лучше",
    cta: "ОСТАВИТЬ ОТЗЫВ",
    href: "https://yandex.ru/maps/org/1395871323/reviews?utm_source=badge&utm_medium=rating&utm_campaign=v1",
  },
  legalNotice: {
    operator: "Экскурсионная деятельность осуществляется ИП ПАВЛОВ АЛЕКСАНДР ВИТАЛЬЕВИЧ",
    inn: "ИНН 772473839311 · ОГРНИП 325774600120159",
    bank: "Расчётный счёт 40802810700007929034 · Банк АО «ТБанк» · БИК 044525974",
    corr: "Корр. счёт банка 30101810145250000974 · ИНН банка 7710140679",
    warning:
      "ВНИМАНИЕ! Точное время экскурсии согласовывается с экскурсоводом. Экскурсия считается подтверждённой и забронированной после внесения 100% предоплаты.",
  },
};

const EN: ToursCopy = {
  path: TOURS_PATH_EN,
  metaTitle: "Tours on brewery | Gletcher Brewery",
  metaDescription:
    "An excursion to the brewery is a great way to spend time with friends, colleagues or business partners! You will have an unforgettable journey through all stages of production, as well as a tasting of all available beers at our brewery.",
  hero: {
    line1: "GUIDED TOURS",
    line2: "OF THE",
    line3: "BREWERY",
  },
  invite:
    "We invite you to take a inspiring trip to the GLETCHER brewery in the city of Klin!",
  bullets: [
    "On the tour, you will get acquainted with all the stages of brewing: visit the crushing and bottling of beer in kegs and bottles, the brewing order and the fermentation workshop.",
    "You will learn what chemical processes occur during beer production, why a microbiological laboratory is needed and how it differs from a physico-chemical laboratory.",
    "And at the end of the tour you will taste all the currently relevant varieties produced by our brewery!",
  ],
  pricingTitle: "The cost of the DEGUSTATION tour",
  facts: [
    { label: "Duration", value: "2 hours" },
    { label: "Minimal age", value: "18 YEARS" },
    {
      label: "Don't forget to bring your passport",
      value: "to participate in degustation",
    },
    {
      label: "PHOTO & VIDEO ARE ALLOWED",
      value: "on our territory",
    },
  ],
  // EN published HTML prices (Observed older than RU ZB 03.11) — keep as-is.
  cards: [
    {
      id: "vip",
      title: "INDIVIDUAL TOUR",
      detail: "FROM 1 TO 5 PERSONS",
      price: "3500₽ PER GUIDE AND 1600₽ PER PERSON",
    },
    {
      id: "group",
      title: "GROUP TOUR",
      detail: "FROM 6 PERSONS",
      price: "2100₽ PER PERSON",
    },
  ],
  bookCta: "BOOKING",
  bookingTitle: "Online booking",
  bookingLead:
    "Pick a slot in the widget. YCLIENTS replacement is a later stage.",
  requestTitle: "GOT QUESTIONS?",
  requestLead: "CALL ME TO HELP YOU!",
  requestFields: {
    name: "Your name",
    phone: "Phone",
    date: "Preferred date",
    guests: "Number of guests",
    email: "Email",
    wishes: "Your wishes",
    submit: "SEND",
    ok: "Saved locally. Server submit is not wired yet.",
  },
  phone: { label: "+7 (926) 549-97-24", href: "tel:+79265499724" },
  reviews: {
    lead: "After such an excursion, you will undoubtedly be able to impress your friends with your knowledge of the beer-making process. We are looking forward to seeing you!",
    line1: "share your",
    line2: "expressions",
    line3: "about our products",
    line4: "or about your visit to the brewery",
    note: "Every feedback is important to us because you are helping us to become better.",
    cta: "LEAVE A REVIEW",
    href: "https://yandex.ru/maps/org/1395871323/reviews?utm_source=badge&utm_medium=rating&utm_campaign=v1",
  },
  gastroNote:
    "What is a gastro-TOUR in our BREWER'S HOUSE restaurant? A factory tour plus a tasting of 7 beers with dishes from our chef. FROM 10 PEOPLE — see production widget for current offers.",
};

export function getToursCopy(locale: PublishedLocale): ToursCopy {
  return locale === "en" ? EN : RU;
}

export const TOURS_HERO_IMAGE = {
  src: "/tours/hero-brewery.png",
  alt: "",
} as const;
