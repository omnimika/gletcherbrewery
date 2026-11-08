/**
 * `/about` — brewery landing with source animation/interaction.
 * Provenance: Tilda project 1212341, page 71867465 (alias about).
 * MCP + HTML snapshot 06.11.2026. RU-only; EN peer Open.
 * Editor leftover record 1144141171 ("Реализация проекта") excluded — not brewery content.
 * Media: local `public/pages/about/**`.
 */

export const ABOUT_PATH = "/about" as const;

/** Local public paths for /about media (no Tilda CDN). */
const A = "/pages/about" as const;

export const ABOUT_PAGE = {
  path: ABOUT_PATH,
  metaTitle: "О нас | Gletcher Brewery | Пивоварня Глетчер",
  metaDescription:
    "Мы — Gletcher Brewery. Создаём пиво для тех, кто ищет новые вкусы. История, команда, экскурсии и фестивали в Клину.",
  /** Source: nosearch/meta_nofollow on — keep noindex until publication decision. */
  robots: { index: false, follow: false } as const,

  videos: {
    hero: {
      hevc: "https://files.gletcherbrewery.com/vid/comp-960-hevc-safari.mp4",
      webm: "https://files.gletcherbrewery.com/vid/comp-960-vp9-chrome.webm",
    },
  },

  assets: {
    logoMark: `${A}/brand/logo-mark.png`,
    slogan: `${A}/brand/slogan-red.png`,
    introPhoto: `${A}/intro/photo.jpg`,
    historyPhoto: `${A}/history/photo.png`,
    videoPoster: `${A}/video/poster.jpg`,
    festMay: `${A}/fest/klin-may.jpg`,
    festMayPoster: `${A}/fest/klin-may/poster.jpg`,
    festMayLogo: `${A}/fest/klin-may-logo.png`,
    brainstormLogo: `${A}/fest/brainstorm-logo.png`,
    brainstormPhoto: `${A}/fest/brainstorm-photo.jpg`,
    brewersHousePhoto: `${A}/brewers-house/interior.jpeg`,
    /** ZB 1162973886 — crest / wordmark / social (MCP + owner export 06.11) */
    brewersHouseCrest: `${A}/brewers-house/crest.png`,
    brewersHouseWordmark: `${A}/brewers-house/wordmark.png`,
    brewersHouseVk: `${A}/brewers-house/vk.png`,
    brewersHouseTelegram: `${A}/brewers-house/telegram.png`,
    /** ZB 1162950316 gallery — 8 slides, autoplay 5s */
    toursGallery: [
      `${A}/tours/gallery-01.jpg`,
      `${A}/tours/gallery-02.jpg`,
      `${A}/tours/gallery-03.jpg`,
      `${A}/tours/gallery-04.jpg`,
      `${A}/tours/gallery-05.jpg`,
      `${A}/tours/gallery-06.jpg`,
      `${A}/tours/gallery-07.jpg`,
      `${A}/tours/gallery-08.jpg`,
    ] as const,
    /** ZB 1162973886 gallery — 12 slides */
    brewersHouseGallery: [
      `${A}/brewers-house/gallery-01.jpg`,
      `${A}/brewers-house/gallery-02.jpg`,
      `${A}/brewers-house/gallery-03.jpg`,
      `${A}/brewers-house/gallery-04.jpg`,
      `${A}/brewers-house/gallery-05.jpg`,
      `${A}/brewers-house/gallery-06.jpg`,
      `${A}/brewers-house/gallery-07.jpg`,
      `${A}/brewers-house/gallery-08.jpg`,
      `${A}/brewers-house/gallery-09.jpg`,
      `${A}/brewers-house/gallery-10.jpg`,
      `${A}/brewers-house/gallery-11.jpg`,
      `${A}/brewers-house/gallery-12.jpg`,
    ] as const,
    /** ZB 1163342141 gallery — 14 slides */
    brainstormGallery: [
      `${A}/fest/brainstorm/gallery-01.jpg`,
      `${A}/fest/brainstorm/gallery-02.jpg`,
      `${A}/fest/brainstorm/gallery-03.jpg`,
      `${A}/fest/brainstorm/gallery-04.jpg`,
      `${A}/fest/brainstorm/gallery-05.jpg`,
      `${A}/fest/brainstorm/gallery-06.jpg`,
      `${A}/fest/brainstorm/gallery-07.jpg`,
      `${A}/fest/brainstorm/gallery-08.jpg`,
      `${A}/fest/brainstorm/gallery-09.jpg`,
      `${A}/fest/brainstorm/gallery-10.jpg`,
      `${A}/fest/brainstorm/gallery-11.jpg`,
      `${A}/fest/brainstorm/gallery-12.jpg`,
      `${A}/fest/brainstorm/gallery-13.jpg`,
      `${A}/fest/brainstorm/gallery-14.jpg`,
    ] as const,
    exportMap: `${A}/export/map.png`,
    thanks: `${A}/thanks/photo.jpg`,
    /**
     * ZB 1150024191 collage — positions as % of artboard 1200×662 (MCP 06.11).
     * Polaroids = img.movePhoto; receipts = shape.movePhoto; coins = SBS bounce.
     */
    agentCollage: {
      receipts: [
        {
          src: `${A}/agent/side-right.png`,
          left: 49.58,
          top: 62.69,
          width: 21.33,
          z: 4,
          appear: "fadeinleft" as const,
          dx: 40,
          dy: -40,
        },
        {
          src: `${A}/agent/side-left.png`,
          left: -2.5,
          top: 56.19,
          width: 22.42,
          z: 12,
          appear: "fadeinright" as const,
          dx: -40,
          dy: 40,
        },
      ],
      polaroids: [
        {
          src: `${A}/agent/polaroid-01.png`,
          left: 37.83,
          top: 34.89,
          width: 17.67,
          z: 5,
        },
        {
          src: `${A}/agent/polaroid-02.png`,
          left: 6.08,
          top: 70.54,
          width: 14.75,
          z: 6,
        },
        {
          src: `${A}/agent/polaroid-03.png`,
          left: 32.0,
          top: 60.73,
          width: 15.58,
          z: 7,
        },
        {
          src: `${A}/agent/polaroid-04.png`,
          left: 1.92,
          top: 25.68,
          width: 21.25,
          z: 8,
        },
        {
          src: `${A}/agent/polaroid-05.png`,
          left: 21.67,
          top: 19.64,
          width: 20.17,
          z: 9,
        },
        {
          src: `${A}/agent/polaroid-06.png`,
          left: 14.92,
          top: 54.38,
          width: 22.33,
          z: 11,
        },
      ],
      stickers: [
        {
          src: `${A}/agent/sticker-01.png`,
          left: 33.67,
          top: 16.31,
          width: 8.0,
          z: 10,
          from: { mx: -5, my: 70, sx: 0.9, sy: 0.9, op: 0, ro: -36 },
          to: { mx: 0, my: 0, sx: 1, sy: 1, op: 1, ro: 5, ti: 400, ea: "bounceFin", dt: 800 },
        },
        {
          src: `${A}/agent/sticker-02.png`,
          left: 6.67,
          top: 22.66,
          width: 8.0,
          z: 19,
          from: { mx: 50, my: 50, sx: 0.9, sy: 0.9, op: 0, ro: -5 },
          to: { mx: 0, my: 0, sx: 1, sy: 1, op: 1, ro: 5, ti: 400, ea: "bounceFin", dt: 800 },
        },
        {
          src: `${A}/agent/sticker-03.png`,
          left: 20.92,
          top: 37.16,
          width: 8.0,
          z: 20,
          from: { mx: 50, my: 50, sx: 0.9, sy: 0.9, op: 0, ro: 0 },
          to: { mx: 0, my: 0, sx: 1, sy: 1, op: 1, ro: 5, ti: 400, ea: "bounceFin", dt: 800 },
        },
        {
          src: `${A}/agent/sticker-04.png`,
          left: 41.33,
          top: 41.39,
          width: 8.0,
          z: 21,
          from: { mx: -20, my: 50, sx: 0.9, sy: 0.9, op: 0, ro: -36 },
          to: { mx: 0, my: 0, sx: 1, sy: 1, op: 1, ro: 5, ti: 400, ea: "bounceFin", dt: 800 },
        },
        {
          src: `${A}/agent/sticker-05.png`,
          left: 66.33,
          top: 17.52,
          width: 8.0,
          z: 22,
          from: { mx: -150, my: 50, sx: 0.9, sy: 0.9, op: 0, ro: 61 },
          to: { mx: 0, my: 0, sx: 1, sy: 1, op: 1, ro: 5, ti: 400, ea: "bounceFin", dt: 800 },
        },
      ],
    },
    chains: [
      { src: `${A}/chains/vkusvill.svg`, alt: "ВкусВилл" },
      { src: `${A}/chains/metro.svg`, alt: "METRO" },
      { src: `${A}/chains/lenta.svg`, alt: "Лента" },
      { src: `${A}/chains/globus.svg`, alt: "Глобус" },
      { src: `${A}/chains/yarche.svg`, alt: "Ярче" },
      { src: `${A}/chains/perekrestok.svg`, alt: "Перекрёсток" },
      { src: `${A}/chains/auchan.svg`, alt: "Ашан" },
      { src: `${A}/chains/spar.svg`, alt: "SPAR" },
      { src: `${A}/chains/magnit.svg`, alt: "Магнит" },
      { src: `${A}/chains/dixie.svg`, alt: "Дикси" },
    ] as const,
  },

  hero: {
    line1: "Пивоварня",
    brand: "gletcher",
    tagLeft: "ДЛЯ ТЕХ,",
    tagMid: "ВКУС",
    tagRight: "КТО ИЩЕТ",
  },

  intro: {
    anchor: "slide1",
    num: "01",
    latin: "QUI QUAERIT REPERIT!",
    slogan: "КТО ИЩЕТ — ТОТ ВСЕГДА НАЙДЁТ.",
    body: [
      "Мы — Gletcher Brewery. Нас объединяет страсть к настоящему пиву, свободе творчества и поиску новых вкусов.",
      "Мы создаём пиво для тех, кто не боится пробовать новое, кто жаждет открытий и разнообразия.",
      "В основе наших сортов — экспертиза, честность, качественные ингредиенты и современные ремесленные технологии.",
      "Мы здесь для вас — искателей, партнёров, друзей.",
    ] as const,
    emailLabel: "Напишите на email → info@gletcherbrewery.com",
    emailHref: "mailto:info@gletcherbrewery.com",
  },

  history: {
    anchor: "slide2",
    num: "02",
    title: "История",
    years: ["2011", "2016", "2018", "2019", "2023"] as const,
    /**
     * 2011/2016 copy Confirmed (ZB 1144141181). 2018/2019/2023 — placeholder
     * lorem until owner facts. Per-year photos: replace `photo-{year}.png` in
     * `public/pages/about/history/` when assets arrive (currently stand-ins).
     */
    cards: {
      "2011": {
        year: "2011",
        brand: "Gletcher",
        photo: `${A}/history/photo-2011.png`,
        body: "Любовь к хорошему пиву привела к тому, что в 2011 году в городе Клин появилась пивоварня Gletcher.\n\nСвоей продукцией мы хотим передать нашу страсть другим людям. Нам нравится экспериментировать. Мы успели поработать с лидерами российского и западного пивного рынка.\n\nВ погоне за новым мы не забываем о главном — качестве: тщательно подбираем ингредиенты, соблюдаем все тонкости производства, тестируем пиво в собственной лицензированной лаборатории.",
      },
      "2016": {
        year: "2016",
        brand: "Gletcher",
        photo: `${A}/history/photo-2016.png`,
        body: "Любовь к хорошему пиву привела к тому, что в 2011 году в городе Клин появилась пивоварня Gletcher.\n\nСвоей продукцией мы хотим передать нашу страсть другим людям. Нам нравится экспериментировать. Мы успели поработать с лидерами российского и западного пивного рынка.\n\nВ погоне за новым мы не забываем о главном — качестве: тщательно подбираем ингредиенты, соблюдаем все тонкости производства, тестируем пиво в собственной лицензированной лаборатории.",
      },
      "2018": {
        year: "2018",
        brand: "Gletcher",
        photo: `${A}/history/photo-2018.png`,
        body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.\n\nUt enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.\n\nExcepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Placeholder — текст года заменим фактурой владельца.",
      },
      "2019": {
        year: "2019",
        brand: "Gletcher",
        photo: `${A}/history/photo-2019.png`,
        body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero. Sed cursus ante dapibus diam.\n\nSed nisi. Nulla quis sem at nibh elementum imperdiet. Duis sagittis ipsum. Praesent mauris. Fusce nec tellus sed augue semper porta.\n\nMauris massa. Vestibulum lacinia arcu eget nulla. Placeholder — текст года заменим фактурой владельца.",
      },
      "2023": {
        year: "2023",
        brand: "Gletcher",
        photo: `${A}/history/photo-2023.png`,
        body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur sodales ligula in libero. Sed dignissim lacinia nunc.\n\nCurabitur tortor. Pellentesque nibh. Aenean quam. In scelerisque sem at dolor. Maecenas mattis. Sed convallis tristique sem.\n\nProin ut ligula vel nunc egestas porttitor. Placeholder — текст года заменим фактурой владельца.",
      },
    } as const,
  },

  team: {
    anchor: "slide3",
    num: "03",
    title: "Команда",
    lead: "Мы не смогли бы пройти этот путь без команды — увлечённых, профессиональных, неравнодушных.",
    sub: "Каждый из них — не просто должность, а личная история, связанная с Gletcher. Мы ценим людей, стоящих за пивом.",
    members: [
      {
        name: "Патрис Усманович",
        role: "экспортный представитель",
        bio: "Открывает для Gletcher новые рынки и страны. Если наш напиток пьют в другом часовом поясе — значит, он уже успел там побывать.",
        photo: `${A}/team/patris-usmanovich.png`,
      },
      {
        name: "Вячеслав Картавин",
        role: "генеральный директор ООО «ГЛЕТЧЕР»",
        bio: "Эксперт по многозадачности и планированию. Инженер потока и мастер организации. Руководство для него — не работа, а призвание.",
        photo: `${A}/team/vyacheslav-kartavin.png`,
      },
      {
        name: "Андрей Мищенко",
        role: "основатель и владелец",
        bio: "Создал философию пивоварни и ведёт команду вперёд. Gletcher для него — не просто бизнес, а дело вкуса, смысла и профессионализма.",
        photo: `${A}/team/placeholder.png`,
      },
      {
        name: "Михаил Юсим",
        role: "генеральный директор ООО «СВАМ Групп»",
        bio: "Руководит процессами, цифрами и стратегиями роста. Следит, чтобы всё работало как часы — точно и эффективно.",
        photo: `${A}/team/placeholder.png`,
      },
      {
        name: "Василий Мищенко",
        role: "директор по маркетингу",
        bio: "Продвигает бренд точно и со вкусом. Знает, где должно быть пиво, чтобы его захотелось попробовать, и как об этом рассказать правильно.",
        photo: `${A}/team/vasiliy-mischenko.png`,
      },
      {
        name: "Алексей Котельников",
        role: "бренд-менеджер",
        bio: "Рассказывает миру нашу историю — ярко, стильно и с душой. Следит, чтобы бренд звучал точно в унисон с тем, кто мы есть.",
        photo: `${A}/team/alexey-kotelnikov.jpg`,
      },
      {
        name: "Инна Скворцова",
        role: "заведующая лабораторией и ведущий экскурсовод",
        bio: "От зерна до дрожжей — в её зоне ответственности каждый элемент качества. На экскурсиях превращает сложную науку в захватывающую магию.",
        photo: `${A}/team/inna-skvortsova.jpeg`,
      },
      {
        name: "Анора Павлова",
        role: "главный пивовар",
        bio: "Сердце и главный талисман пивоварни. Создаёт авторские рецепты, влюбляет во вкус и знает о пиве всё.",
        photo: `${A}/team/anora-pavlova.jpg`,
      },
    ] as const,
  },

  videoTour: {
    anchor: "slide4",
    num: "04",
    title: "Видео-тур",
    welcome: "Добро пожаловать на нашу пивоварню!",
    vkVideoId: "-57309563_456239063",
    stats: [
      { value: "29", label: "ЦКТ (20л/40л)" },
      { value: "962 640", label: "декалитров / год" },
    ] as const,
  },

  beer: {
    anchor: "slide5",
    num: "05",
    title: "Наше пиво",
    /**
     * L→R order + bottle galleries from Tilda ZB 1144235866 (MCP 06.11).
     * Local product bottles under `public/products/{slug}/bottle.png`.
     */
    categories: [
      {
        id: "classic",
        name: "CLASSIC",
        body: "Знакомые стили, сваренные правильно. Чистота, баланс, традиции. Пиво, к которому хочется возвращаться.",
        href: "/beer#classic",
        autoplayMs: 2000,
        bottles: [
          {
            src: "/products/ausweis/bottle.png",
            alt: "Ausweis weissbier",
            href: "/beer/ausweis",
          },
          {
            src: "/products/heidegger-hell/bottle.png",
            alt: "Heidegger Hell",
            href: "/beer/heidegger-hell",
          },
          {
            src: "/products/rouge-de-fleur/bottle.png",
            alt: "Rouge de Fleur",
            href: "/beer/rouge-de-fleur",
          },
        ],
      },
      {
        id: "craft",
        name: "CRAFT",
        body: "Современные стили с фирменным подходом. Настоящие находки для искателей.",
        href: "/beer#craft",
        autoplayMs: 2000,
        bottles: [
          {
            src: "/products/milk-of-amnesia-v-tropic/bottle.png",
            alt: "Milk of Amnesia",
            href: "/beer/milk-of-amnesia-v-tropic",
          },
          {
            src: "/products/nut-butter/bottle.png",
            alt: "Nut Butter",
            href: "/beer/nut-butter",
          },
          {
            src: "/products/blue-monkey/bottle.png",
            alt: "Blue Monkey",
            href: "/beer/blue-monkey",
          },
          {
            src: "/products/bowler-ipa/bottle.png",
            alt: "Bowler IPA",
            href: "/beer/bowler-ipa",
          },
          {
            src: "/products/friday-avenue-apa/bottle.png",
            alt: "Friday Avenue APA",
            href: "/beer/friday-avenue-apa",
          },
          {
            src: "/products/brainstorm/bottle.png",
            alt: "Brainstorm",
            href: "/beer/brainstorm",
          },
          {
            src: "/products/underground-ale/bottle.png",
            alt: "Underground Ale",
            href: "/beer/underground-ale",
          },
          {
            src: "/products/ruby-road/bottle.png",
            alt: "Ruby Road",
            href: "/beer/ruby-road",
          },
          {
            src: "/products/iron-woods-dry-stout/bottle.png",
            alt: "Iron Woods Dry Stout",
            href: "/beer/iron-woods-dry-stout",
          },
          {
            src: "/products/iron-woods-milk-stout/bottle.png",
            alt: "Iron Woods Milk Stout",
            href: "/beer/iron-woods-milk-stout",
          },
        ],
      },
      {
        id: "limited",
        name: "LIMITED",
        body: "Экспериментальные партии, сезонные релизы, коллаборации. Нечто новое на взыскательный вкус.",
        href: "/beer#limited",
        autoplayMs: 4000,
        bottles: [
          {
            src: "/products/tour-de-grapefruit/bottle.png",
            alt: "Tour De Grapefruit",
            href: "/beer/tour-de-grapefruit",
          },
          {
            src: "/products/hop-dragon/bottle.png",
            alt: "Hop Dragon",
            href: "/beer/hop-dragon",
          },
          {
            src: "/products/brut-grapefruit/bottle.png",
            alt: "Brut Grapefruit",
            href: "/beer/brut-grapefruit",
          },
        ],
      },
      {
        id: "aged",
        name: "AGED",
        body: "Выдержанные сорта в бочках. Глубина, сложность, раскрытая во времени.",
        href: "/beer#aged",
        autoplayMs: 0,
        bottles: [
          {
            src: "/products/cynic/bottle.png",
            alt: "Cynic",
            href: "/beer/cynic",
          },
        ],
      },
    ] as const,
  },

  agent: {
    anchor: "slide6",
    num: "06",
    title: "Агент Глетчер",
    kicker: "БУДЬ С НАМИ – ПОЛУЧАЙ ПРИЗЫ",
    program: "бонусная программа Gletcher Brewery",
    lead: "Регистрируй чеки покупок Gletcher в личном кабинете, накапливай биркоины, стань амбассадором Gletcher и выиграй годовой запас пива!",
    body: "«Агент Глетчер» — это программа для тех, кто любит наше пиво и готов рекомендовать его другим. Рассказывай друзьям, делись впечатлениями в соцсетях, принимай участие в активностях и получай подарки, фирменный мерч и эксклюзивные сорта.",
    coins:
      "Теперь пивооткрыватели и пивонтюристы всей страны смогут накапливать «биркоины» – уникальную валюту, которую можно обменивать на любимое пиво и крутые призы от Gletcher!",
    cta: "зарегистрироваться",
    href: "/agent",
  },

  tours: {
    anchor: "slide7",
    num: "07",
    title: "Экскурсии",
    lead: "Увидеть, как рождается пиво — особый опыт.",
    body: "Мы приглашаем на экскурсию по нашей пивоварне: от варочного цеха до лаборатории, от ферментации до розлива. Вас встретят наши специалисты и расскажут, как всё устроено на самом деле.\n\nЗавершает тур дегустация в ресторане Brewer’s House — в антураже настоящего английского паба.",
    cta: "забронировать экскурсию",
    href: "/tours",
  },

  brewersHouse: {
    anchor: "slide8",
    num: "08",
    title: "Brewer's House",
    tagline: "Дом Пивовара — Территория мероприятий",
    /** Left column under gallery (ZB text #1751907619193) */
    aside:
      "Мы продумали все, чтобы вам было интересно, комфортно и очень вкусно. Ресторан предлагает широкий выбор блюд на заказ, приготовленных только из качественных фермерских продуктов.",
    body: [
      "Приглашаем Вас в удивительную локацию при нашем пивоваренном заводе в городе Клин — Brewer’s House — это паб, ресторан, банкетный зал и концертная площадка в английском стиле, в котором можно попробовать наше пиво, отдохнуть у камина, устроить гастроужин, концерт, презентацию или свадьбу.",
      "Brewer’s House — финальный штрих экскурсий по пивоварне и центр притяжения для наших гостей. Банкеты, фестивали, презентации, бизнес завтраки, интеллектуальные игры, концерты, Stand Up, это мы уже делали и делаем! Всегда открыты к предложениям, мы поможем Вам разработать концепцию любого события!",
    ] as const,
    ctaLabel: "подробнее:",
    links: [
      {
        label: "VK",
        href: "https://vk.com/brewershouse",
        icon: "vk" as const,
      },
      {
        label: "Telegram",
        href: "https://t.me/brewershouse",
        icon: "telegram" as const,
      },
    ] as const,
  },

  klinFest: {
    num: "09",
    title: "КЛИН МАЙ FEST",
    tagline: "Крупнейший крафтовый фестиваль России — в Клину.",
    lead: "Каждую весну десятки российских и зарубежных пивоварен съезжаются в Клин, чтобы представить свои лучшие сорта. Gletcher — организатор и активный участник фестиваля с первых дней.",
    /** ZB 1163319861 video (not gallery) — VK oid_id */
    vkVideoId: "-57309563_456239066",
    stats: [
      { year: "2019", guests: "15 000", volume: "15 т" },
      { year: "2021", guests: "22 000", volume: "22 т" },
      { year: "2023", guests: "32 000", volume: "28 т" },
      { year: "2024", guests: "40 000", volume: "30 т" },
      { year: "2025", guests: "45 000", volume: "30 т" },
    ] as const,
    body: "Фудкорты, концерты, конкурсы, шоу, тёплая атмосфера и десятки тысяч счастливых гостей. Это день для тех, кто ценит вкус, атмосферу и живое общение.",
    cta: "ПОДРОБНЕЕ О ФЕСТИВАЛЕ",
    /** Source `/events/klin-may-fest-2025` not local yet; point to published results article. */
    href: "/blog/2025-06-03-klin-mai-fest-2025-itogi",
  },

  brainstorm: {
    num: "10",
    title: "BRAINSTORM MOTOR FEST",
    tagline: "Скорость. Стиль. Пиво.",
    lead: "Ежегодный фестиваль байкеров, кастом-культуры и рока на территории Gletcher Brewery. Автомобили, мотоциклы, рокабилли, барбершопы, фудтраки и, конечно, вкусное пиво.",
    body: "Brainstorm Motor Fest — это сочетание автомобильной и мото‑культуры, ремесла, рок-н-ролла и рокабилли, и нашего безалкогольного Brainstorm.\n\nЭто день, когда моторы ревут, пенное льётся янтарным потоком, а вокруг только свои: фанаты скорости, свободы, крафта и хорошей музыки.",
    cta: "ПОДРОБНЕЕ О ФЕСТИВАЛЕ",
    href: "https://brainstormfest.ru/",
  },

  where: {
    anchor: "slide9",
    num: "11",
    title: "ГДЕ КУПИТЬ?",
    tagline: "Gletcher рядом. Найди нас легко.",
    chainsLead: "Мы представлены в крупнейших ритейл-сетях по всей стране:",
    mapCta: "НАЙТИ НА КАРТЕ",
    mapHref: "/map",
    shops: [
      {
        title: "МАГАЗИН ПРИ ПИВОВАРНЕ",
        city: "КЛИН",
        address:
          "Московская область, г. Клин, ул. Терешковой, д. 1, стр. 2",
        phone: "+7 (929) 634-50-17",
        phoneHref: "tel:+79296345017",
        shopHref: "/shop",
        mapsHref:
          "https://yandex.ru/maps/?text=%D0%9C%D0%BE%D1%81%D0%BA%D0%BE%D0%B2%D1%81%D0%BA%D0%B0%D1%8F%20%D0%BE%D0%B1%D0%BB%D0%B0%D1%81%D1%82%D1%8C%2C%20%D0%9A%D0%BB%D0%B8%D0%BD%2C%20%D1%83%D0%BB.%20%D0%A2%D0%B5%D1%80%D0%B5%D1%88%D0%BA%D0%BE%D0%B2%D0%BE%D0%B9%2C%201%2C%20%D1%81%D1%82%D1%80.%202",
      },
      {
        title: "Эксклюзивный дистрибьютор",
        city: "МОСКВА",
        address:
          "г. Москва, Новомещерский проезд, д. 9, стр. 1 (1‑й этаж), район Солнцево",
        phone: "+7 (495) 989‑24‑14",
        phoneHref: "tel:+74959892414",
        shopHref: "https://svamgroup.ru/contacts",
        mapsHref:
          "https://yandex.ru/maps/?text=%D0%9C%D0%BE%D1%81%D0%BA%D0%B2%D0%B0%2C%20%D0%9D%D0%BE%D0%B2%D0%BE%D0%BC%D0%B5%D1%89%D0%B5%D1%80%D1%81%D0%BA%D0%B8%D0%B9%20%D0%BF%D1%80%D0%BE%D0%B5%D0%B7%D0%B4%2C%209%2C%20%D1%81%D1%82%D1%80%201",
      },
    ] as const,
  },

  export: {
    num: "12",
    title: "ЭКСПОРТ",
    tagline: "Наше пиво ценят далеко за пределами России.",
    body: "Мы открыты для сотрудничества с дистрибьюторами, оптовыми и розничными продавцами, представителями HoReCa и импортёрами по всему миру. Ассортимент Gletcher включает лёгкие лагеры, крафтовые эли, крепкое пиво и даже премиальные напитки — у нас есть продукция под любой рынок и любую аудиторию. Мы уже работаем с зарубежными партнёрами и готовы расширять географию поставок. Свяжитесь напрямую с нашим экспортным менеджером.",
    contactRole: "представитель по экспортным контрактам",
    contactName: "Патрис Усманович",
    email: "t.patris@gmail.com",
    phone: "+7 (777) 031-8357",
    phoneHref: "tel:+77770318357",
    countries: [
      "Чили (до 2022)",
      "Сербии",
      "Кыргызстане",
      "Казахстане",
      "Грузии",
      "Белоруссии",
      "Армении",
    ] as const,
  },

  thanks: {
    num: "13",
    title: "СПАСИБО",
    lead: "Пусть ваше следующее пиво будет открытием.",
    body: "Мы всегда рады делиться тем, что любим.\n\nЕсли у вас есть предложения, идеи, вопросы или просто добрые слова — напишите нам.",
  },
} as const;