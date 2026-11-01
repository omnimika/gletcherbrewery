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
    src: "/home/slogan-red.png",
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
    src: "https://static.tildacdn.com/tild3632-3161-4136-a139-326434363966/Hop_Dragon.png",
    alt: "Hop Dragon",
  },
  distributionTitle: "Широкая сеть дистрибуции",
  distributionBody:
    "Мы имеем собственные филиалы и представительства в крупных городах России: Москва, Санкт-Петербург, Нижний Новгород, Екатеринбург, Челябинск, Краснодар, Геленджик, Крым.",
  distributionExtra:
    "Кроме того, с нами работают более 80 официальных дистрибьюторов по всей территории России. Наша служба доставки найдёт вас, где бы вы ни находились. Мы открыты для сотрудничества с дистрибьюторами, оптовыми и розничными продавцами, представителями HoReCa и импортёрами по всему миру.",
  distributionMap: {
    src: "https://static.tildacdn.com/tild3861-6131-4264-a336-636632396564/MapChart_Map_3.png",
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
  success: "Спасибо! Заявка принята локально (заглушка).",
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
        "https://static.tildacdn.com/tild6138-3638-4364-b134-643232623362/Underground_Ale.png",
      productImage:
        "https://static.tildacdn.com/tild6234-3135-4733-a534-386439323236/CATALOGUE__0003_Unde.png",
      importImage:
        "https://static.tildacdn.com/tild3262-6664-4133-b361-316637643630/4f7f6d875214635dba9f.png",
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
        "https://static.tildacdn.com/tild3036-6664-4039-b961-326265653838/Ausweis.png",
      productImage:
        "https://static.tildacdn.com/tild6435-6364-4261-b331-623038386631/CATALOGUE__0016_Ausw.png",
      importImage:
        "https://static.tildacdn.com/tild3530-6562-4731-a561-363136383831/Schneider_Weisse_Tap.png",
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
        "https://static.tildacdn.com/tild6434-3762-4365-b238-333062313532/CROCO__2.png",
      productImage:
        "https://static.tildacdn.com/tild3264-6663-4262-a362-366633393864/CATALOGUE__0014_Bowl.png",
      importImage:
        "https://static.tildacdn.com/tild3831-3563-4636-b939-316534343133/Punk_IPA.png",
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
        "https://static.tildacdn.com/tild6333-3662-4761-b334-643438303736/Tour_de_Grapefruit.png",
      productImage:
        "https://static.tildacdn.com/tild3835-3038-4365-a338-626433633533/CATALOGUE__0004_Tour.png",
      importImage:
        "https://static.tildacdn.com/tild6565-3965-4234-a261-333839623162/Schofferhofer_Grapef.png",
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
        "https://static.tildacdn.com/tild3432-3438-4762-b833-313238633763/Heidegger_Hell.png",
      productImage:
        "https://static.tildacdn.com/tild6561-3765-4432-b538-656536356431/CATALOGUE__0011_Heid.png",
      importImage:
        "https://static.tildacdn.com/tild6337-6662-4635-a436-306438613334/Ayinger.png",
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
        "https://static.tildacdn.com/tild3937-3164-4231-b662-393631663531/Ruby_Road.png",
      productImage:
        "https://static.tildacdn.com/tild6234-3339-4665-a232-656437396637/CATALOGUE__0005_Ruby.png",
      importImage:
        "https://static.tildacdn.com/tild6165-6330-4335-a164-633466643839/Castel_Rouge232.png",
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
