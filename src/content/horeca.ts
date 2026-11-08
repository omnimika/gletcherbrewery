/**
 * RU-only SEO landing `/horeca`.
 * Provenance: docs/discovery/HORECA_PAGE_BASELINE.md
 * Media/anim Confirmed via MCP ZB 1702039591 / 1701412511 / 1701927591 / 1701992171 (01.11.2026).
 */

export const HORECA_PATH = "/horeca" as const;

export type HorecaCompareCard = {
  slug: string;
  name: string;
  taste: string;
  stats: string;
  styleLabel: string;
  /** Short lead on the default (import) face. */
  importLead: string;
  imports: string[];
  /** Style art behind Gletcher face (ZB card bgimg). */
  artImage: string;
  /** Gletcher catalogue bottle (Tilda shape bgimg). */
  productImage: string;
  /** Import reference bottle/can art from compare ZB. */
  importImage: string;
};

export const HORECA_PAGE = {
  path: HORECA_PATH,
  metaTitle: "Российское крафтовое пиво оптом | Пивоварня Глетчер",
  metaDescription:
    "Широчайший выбор сортов от пивоварни и оборудование для бара под ключ. Мы имеем собственные филиалы и представительства в крупных городах России.",
  brandWord: "gletcher",
  heroWord: "HORECA",
  /** Center bubble between brandWord and heroWord — owner Confirmed 01.11.2026. */
  badgeFor: "ДЛЯ",
  badgeQuality: "Качественное пиво — дешевле импорта",
  badgeSave: "Экономьте на закупках — сохраняйте качество.",
  /** Hero bottle loop — ZB `1702039591` html elem (visible). */
  heroVideo: {
    hevc: "https://files.gletcherbrewery.com/vid/comp-960-hevc-safari.mp4",
    webm: "https://files.gletcherbrewery.com/vid/comp-960-vp9-chrome.webm",
  },
  sloganImage: {
    /** Same seal as home hero; circular «QUI QUAERIT, REPERIT!» frames the R. */
    src: "/pages/home/slogan-red.png",
    alt: "",
  },
  whyTitle: "Почему импортное пиво больше не выгодно?",
  whyBody: [
    "Импортное пиво дорожает, логистика усложняется, цены для баров и магазинов растут. Это удар по прибыли и марже.",
    "Gletcher Brewery — надёжный поставщик: отечественное пиво премиального качества, по цене заметно ниже импортной.",
  ],
  compareTitle: "Наши сорта VS популярное импортное пиво",
  compareLead:
    "Выбирайте пиво, которое даёт тот же вкус и стиль, что импорт — но стоит дешевле. Сравните сами.",
  /** Import-face CTA — reveals Gletcher face (source: «СМЕНИ НА GLETCHER!»). */
  switchCta: "Смени на Gletcher!",
  /** Gletcher-face CTA — source «ИСКАТЬ» → product. */
  findCta: "Искать",
  catalogCta: "В каталог",
  audienceTitle: "Кому подходит наше пиво?",
  audience: [
    "Бары, пабы, рестораны, отели — которые хотят стабильного поставщика и выгодное пиво.",
    "Магазины (в том числе магазины пива, гастро-магазины).",
    "Магазины разливного пива, витрины, уголки крафта — бутылочное и кеговое.",
    "Дистрибуторы и оптовые покупатели, которые закупают пиво оптом и мелким оптом.",
  ],
  audienceImage: {
    src: "/pages/horeca/hop_dragon.png",
    alt: "Hop Dragon",
  },
  distributionTitle: "Широкая сеть дистрибуции",
  distributionBody:
    "Мы имеем собственные филиалы и представительства в крупных городах России: Москва, Санкт-Петербург, Нижний Новгород, Екатеринбург, Челябинск, Краснодар, Геленджик, Крым.",
  distributionExtra:
    "Кроме того, с нами работают более 80 официальных дистрибьюторов по всей территории России. Наша служба доставки найдёт вас, где бы вы ни находились. Мы открыты для сотрудничества с дистрибьюторами, оптовыми и розничными продавцами, представителями HoReCa и импортёрами по всему миру.",
  distributionMap: {
    src: "/pages/horeca/mapchart_map_3.png",
    alt: "Карта присутствия Gletcher",
  },
  formLead:
    "Получите прайс-лист. Закажите пробную поставку. Рост цен на импорт продолжится — зафиксируйте выгодную цену уже сегодня.",
  formTitle: "Заявка HoReCa",
  fields: {
    city: "Город",
    company: "Компания",
    name: "Имя",
    inn: "ИНН",
    email: "Email",
    phone: "Телефон",
    comment: "Комментарий",
  },
  policyLabel: "Согласен с политикой обработки персональных данных",
  submit: "Отправить заявку",
  note: "Форма пока не отправляет данные. На источнике Tilda formname указывает на Klin May Fest — локальный stub без POST.",
  unavailable:
    "Онлайн-отправка пока недоступна. Ваши данные сохранены в форме — свяжитесь напрямую:",
  error: "Проверьте обязательные поля и согласие.",
  wholesaleCta: "Оптовая заявка",
  wholesaleHref: "/russian-craft-beer" as const,
  catalogHref: "/beer" as const,
  compare: [
    {
      slug: "underground-ale",
      name: "Underground Ale",
      taste:
        "Ощутимо солодовый вкус со смолистыми и карамельными нотами и легкой хмелевой горчинкой",
      stats: "4,7% ALC | 27 IBU",
      styleLabel: "Английский эль",
      importLead: "Тёмный эль, насыщенный вкус, барная классика:",
      artImage:
        "/pages/horeca/underground_ale.png",
      productImage:
        "/pages/horeca/catalogue__0003_unde.png",
      importImage:
        "/pages/horeca/4f7f6d875214635dba9f.png",
      imports: [
        "Fuller’s London Pride",
        "Newcastle Brown Ale",
        "Hobgoblin (Wychwood)",
        "Old Speckled Hen",
      ],
    },
    {
      slug: "ausweis",
      name: "Ausweis",
      taste:
        "Полное пшеничное тело, завершающееся нотками спелого банана, гармоничная вкусо-ароматическая композиция",
      stats: "5,2% ALC | 15 IBU",
      styleLabel: "Пшеничное",
      importLead:
        "Weissbier, Weizenbier, Hefeweizen, Bière blanche, белое пиво:",
      artImage:
        "/pages/horeca/ausweis.png",
      productImage:
        "/pages/horeca/catalogue__0016_ausw.png",
      importImage:
        "/pages/horeca/schneider_weisse_tap.png",
      imports: [
        "Edelweiss Weissbier",
        "Weihenstephaner Hefeweiss",
        "Franziskaner",
        "Hoegaarden White",
      ],
    },
    {
      slug: "bowler-ipa",
      name: "Bowler IPA",
      taste:
        "Indian Pale Ale, являясь родственником классического эля, отличается более ощутимой горечью, ароматом и плотностью",
      stats: "6,1% ALC | 70 IBU",
      styleLabel: "IPA",
      importLead: "Indian Pale Ale, насыщенный вкус, популярный стиль:",
      artImage:
        "/pages/horeca/croco__2.png",
      productImage:
        "/pages/horeca/catalogue__0014_bowl.png",
      importImage:
        "/pages/horeca/punk_ipa.png",
      imports: [
        "Punk IPA",
        "Sierra Nevada Pale Ale",
        "Lagunitas IPA",
        "Goose Island IPA",
      ],
    },
    {
      slug: "tour-de-grapefruit",
      name: "Tour De Grapefruit",
      taste:
        "Пшеничное «пушистое» пиво со свежим вкусом и выраженным цитрусово-хмелевым ароматом",
      stats: "5,4% ALC | 10 IBU",
      styleLabel: "Грейпфрутовый радлер",
      importLead:
        "Освежающий напиток, летний хит, пиво с добавлением цитрусовых соков:",
      artImage:
        "/pages/horeca/tour_de_grapefruit.png",
      productImage:
        "/pages/horeca/catalogue__0004_tour.png",
      importImage:
        "/pages/horeca/schofferhofer_grapef.png",
      imports: [
        "Schöfferhofer Grapefruit",
        "Stiegl Grapefruit",
        "Harp Radler",
        "Edelweiss Summer Fruit",
      ],
    },
    {
      slug: "heidegger-hell",
      name: "Heidegger Hell",
      taste:
        "Искрящийся, освежающий лагер с лёгкой солодовой сладостью и утонченной хмелевой горчинкой",
      stats: "4,7% ALC | 18 IBU",
      styleLabel: "Хэль лагер",
      importLead: "Светлый лагер, классика, лёгкое, востребованное пиво:",
      artImage:
        "/pages/horeca/heidegger_hell.png",
      productImage:
        "/pages/horeca/catalogue__0011_heid.png",
      importImage:
        "/pages/horeca/ayinger.png",
      imports: [
        "Ayinger",
        "Hofbräu Original",
        "Heineken",
        "Amstel",
        "Krusovice",
        "Harp Lager",
      ],
    },
    {
      slug: "ruby-road",
      name: "Ruby Road",
      taste:
        "Выразительные 7% с фруктово-вишневым, древесным, немного танинным, чуть травянистым букетом",
      stats: "7% ALC | 15 IBU",
      styleLabel: "Крепкое вишнёвое",
      importLead: "Вишнёвое крепкое пиво:",
      artImage:
        "/pages/horeca/ruby_road.png",
      productImage:
        "/pages/horeca/catalogue__0005_ruby.png",
      importImage:
        "/pages/horeca/castel_rouge232.png",
      imports: [
        "Barbar Ruby",
        "Castel Rouge",
        "Kilkenny",
        "Smithwick’s",
        "Leffe Ruby",
        "Hoegaarden Rosée",
      ],
    },
  ] satisfies HorecaCompareCard[],
} as const;
