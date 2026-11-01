/**
 * `/partnership` + `/en/partnership` content.
 * Provenance: docs/discovery/PARTNERSHIP_PAGE_BASELINE.md (01.11.2026).
 */

import type { PublishedLocale } from "@/i18n/locales";

export type PartnerTypeOption = {
  value: string;
  label: string;
};

export type PartnershipMaterial = {
  id: string;
  title: string;
  description: string;
  href: string;
};

export type PartnershipPillar = {
  title: string;
  body: string;
};

export type PartnershipCopy = {
  path: string;
  metaTitle: string;
  metaDescription: string;
  materialsIntro: string;
  materials: PartnershipMaterial[];
  downloadLabel: string;
  heroTitle: string;
  /** HTML-safe spans already resolved to plain parts for React. */
  lead: string;
  leadAccent?: string;
  pillars: PartnershipPillar[];
  formTitle: string;
  partnerTypes: PartnerTypeOption[];
  fields: {
    company: string;
    city: string;
    name: string;
    email: string;
    phone: string;
    comment: string;
  };
  policyHtml?: boolean;
  policyBefore?: string;
  policyLink: string;
  policyAfter?: string;
  submit: string;
  note: string;
  success: string;
  error: string;
  catalogCta: string;
  catalogHref: "/beer";
  discount?: { label: string; href: string };
};

const FILES = {
  priceTags: "https://files.gletcherbrewery.com/Gletcher-PriceTags.zip",
  bierdeckels: "https://files.gletcherbrewery.com/Gletcher-Brewery-Bierdeckel.zip",
  brandbook: "https://files.gletcherbrewery.com/Gletcher-Brandbook.zip",
  sortLogos: "https://files.gletcherbrewery.com/Gletcher-Brewery-Sort.zip",
  bottles: "https://files.gletcherbrewery.com/Gletcher-Brewery-Bottles-Images.zip",
  presentation: "https://files.gletcherbrewery.com/Gletcher-Brewery-Presentation.pdf",
} as const;

const RU: PartnershipCopy = {
  path: "/partnership",
  metaTitle:
    "Партнёрам | Пивоварня Глетчер | Gletcher Brewery — поставки крафтового пива в кегах и бутылках для HoReCa, баров и магазинов | Оптовые поставки пива",
  metaDescription:
    "Профессиональные поставки крафтового пива от Gletcher Brewery — кеги и бутылки для баров, ресторанов, HoReCa и розничных точек. Стратегические партнерские программы, гибкие условия опта, доставка и поддержка.",
  materialsIntro:
    "Здесь мы размещаем документы и материалы, которые вам пригодятся.",
  materials: [
    {
      id: "catalog",
      title: "Каталог",
      description: "Презентация Gletcher [ PDF ]",
      href: FILES.presentation,
    },
    {
      id: "menu-images",
      title: "Для меню",
      description: "Продуктовые фотографии для HoReCa [ PNG, бутылки и бокалы ]",
      href: FILES.bottles,
    },
    {
      id: "brandbook",
      title: "Брендбук",
      description:
        "Логотипы пивоварни, палитра и другие материалы для дизайнера [ PDF, AI, PSD ]",
      href: FILES.brandbook,
    },
    {
      id: "sort-logos",
      title: "Сортовые лого",
      description: "Логотипы и обложки по сортовым брендам [ PNG, SVG ]",
      href: FILES.sortLogos,
    },
    {
      id: "price-tags",
      title: "Ценники",
      description: "Стилизованные ценники под печать [ PDF ]",
      href: FILES.priceTags,
    },
    {
      id: "bierdeckels",
      title: "Бирдекели",
      description: "Макеты [ PDF, PNG, JPG ]",
      href: FILES.bierdeckels,
    },
  ],
  downloadLabel: "Скачать",
  heroTitle: "Российское крафтовое пиво оптом и на любой вкус",
  lead:
    "Наше пиво уже доступно во многих городах страны, но мы стремимся находить новых партнеров по дистрибуции и расширять зону торговли, чтобы поставлять достаточное количество вкусного и качественного пива всем желающим.",
  leadAccent:
    "Если вы являетесь розничным или оптовым продавцом, желающим приобрести нашу продукцию, пожалуйста, оставьте заявку и мы свяжемся с вами в самые кратчайшие сроки.",
  pillars: [
    {
      title: "Широкая сеть дистрибуции",
      body: "Мы имеем собственные филиалы и представительства в крупных городах России: Москва, Санкт-Петербург, Нижний Новгород, Екатеринбург, Челябинск, Краснодар, Геленджик, Крым. Кроме того, с нами работают более 80 официальных дистрибьюторов по всей территории России. Наша служба доставки найдёт вас, где бы вы ни находились.",
    },
    {
      title: "Оборудование «под ключ»",
      body: "Мы предоставляем полный комплект оборудования для розлива пива, а так же оказываем непосредственную помощь при монтаже. Наш опыт позволяет найти инженерное решение под любой проект и задачу! Мы гарантируем индивидуальный подход, маркетинговую поддержку и регулярное техническое обслуживание. Кроме того, вы можете заказать у нас всё необходимое: стаканы, посуду, костеры, элементы оформления и аксессуары для бара.",
    },
    {
      title: "Богатая палитра сортов",
      body: "Мы предлагаем широкий ассортимент по приемлемым ценам. Мы экспериментируем c различными видами солода и хмеля, смело используем специи и фрукты. В результате по качеству и продуктовой линейке Gletcher составляет достойную конкуренцию европейским и американским пивоварням. Множество стилей — каждый найдет себе то, что ему по душе.",
    },
  ],
  formTitle: "Заявка партнёра",
  partnerTypes: [
    { value: "bar", label: "Бар" },
    { value: "shop", label: "Магазин" },
    { value: "distributor", label: "Дистрибьютор" },
  ],
  fields: {
    company: "Юридическое лицо",
    city: "Город",
    name: "Ваше имя",
    email: "Email",
    phone: "Телефон",
    comment: "Комментарий",
  },
  policyHtml: true,
  policyBefore: "Я согласен с ",
  policyLink: "политикой конфиденциальности",
  policyAfter: " и принимаю условия обработки моих персональных данных.",
  submit: "Отправить заявку",
  note: "Форма пока не отправляет данные — серверный обработчик подключится отдельно. Онлайн-продажу алкоголя мы не осуществляем.",
  success: "Спасибо! Заявка принята локально (заглушка — сервер ещё не подключён).",
  error: "Проверьте обязательные поля и согласие на обработку данных.",
  catalogCta: "Смотреть каталог",
  catalogHref: "/beer",
};

const EN: PartnershipCopy = {
  path: "/en/partnership",
  metaTitle: "Partnership | Gletcher Brewery",
  metaDescription:
    "Wholesale craft beer from Gletcher Brewery — kegs and bottles for bars, restaurants, HoReCa and retail. Partner materials and enquiry form.",
  materialsIntro:
    "Here we post documents and materials that may be useful in your work.",
  materials: [
    {
      id: "catalog",
      title: "Catalogue",
      description: "Gletcher presentation [ PDF ]",
      href: FILES.presentation,
    },
    {
      id: "menu-images",
      title: "HoReCa",
      description:
        "Product images [ PNG, bottles, glasses and bierdeckels ]",
      href: FILES.bottles,
    },
    {
      id: "brandbook",
      title: "Brandbook",
      description: "Logos, color palette & other design files [ PDF, AI, PSD ]",
      href: FILES.brandbook,
    },
    {
      id: "price-tags",
      title: "Price tags",
      description: "Print-ready price tags [ PDF ]",
      href: FILES.priceTags,
    },
  ],
  downloadLabel: "Download",
  // EN source has no H1 (meta inventory); use Confirmed page title.
  heroTitle: "Partnership",
  lead:
    "Our beer is already available in many cities of Russia, but we strive to find new distribution partners and expand the trade area in order to supply a sufficient amount of delicious and quality beer to everyone who wants it.",
  leadAccent: undefined,
  // Pillars not Observed on EN source — omit.
  pillars: [],
  formTitle: "Partner enquiry",
  partnerTypes: [
    { value: "bar-shop", label: "Bar / Shop" },
    { value: "distributor", label: "Distributor" },
  ],
  fields: {
    company: "Company name",
    city: "City, Country",
    name: "Name",
    email: "Email",
    phone: "Phone",
    comment: "Comment",
  },
  policyHtml: false,
  policyLink: "Privacy policy",
  submit: "Send request",
  note: "This form does not submit yet — server handler comes later. We do not sell alcohol online.",
  success: "Thanks! Request recorded locally (stub — server not connected).",
  error: "Please check the required fields.",
  catalogCta: "View catalogue",
  catalogHref: "/beer",
  discount: {
    label: "First order discount 10%",
    href: "/russian-craft-beer",
  },
};

export function getPartnershipCopy(locale: PublishedLocale): PartnershipCopy {
  return locale === "en" ? EN : RU;
}

export const PARTNERSHIP_LOCALE_HREFS = {
  ru: "/partnership",
  en: "/en/partnership",
} as const;
