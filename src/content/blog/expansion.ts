/**
 * Alias page `/blog/expansion` — Tilda page `30187221` (RU published).
 * Feed shell `yvr9000yd1` has empty `text` + `directlink=/blog/expansion`.
 * EN page `30190578` / feed `ebr5zugm31` unpublished — no local EN route.
 * Provenance: MCP get_page_settings/records + public page 01.11.2026.
 */

export const EXPANSION_PAGE = {
  id: "expansion",
  locale: "ru" as const,
  path: "/blog/expansion",
  productionPath: "/blog/expansion",
  publishedAt: "2022-09-08",
  categoryId: "news" as const,
  categoryLabel: "НОВОСТИ",
  title: "Расширяем производство!",
  heroTitle: "РАСШИРЯЕМСЯ!",
  description:
    "Большие планы требуют больших перемен! Мы начинаем новую главу развития российского крафта и расширяем производство.",
  cover: {
    src: "https://static.tildacdn.com/tild3461-3034-4838-b166-623530386365/088A2981.jpg",
    alt: "",
  },
  heroImage: {
    src: "https://static.tildacdn.com/tild6166-3738-4766-b162-386631383532/088A2977.jpg",
    alt: "",
  },
  lead: [
    "Большие планы требуют больших перемен!",
    "Мы начинаем новую главу развития российского крафта и расширяем производство.",
  ],
  stats: [
    {
      value: "9",
      label:
        "новых ЦКТ (Цилиндро-конический танков) установлено на нашем производстве",
      icon: "https://static.tildacdn.com/tild6335-6164-4131-a466-303231323636/image.png",
    },
    {
      value: "55 000",
      label: "литров вмещает каждый из ЦКТ",
      icon: "https://static.tildacdn.com/tild3162-3961-4430-b335-616333616338/image.png",
    },
    {
      value: "756 000",
      label:
        "на столько больше бутылок пива будут радовать наших потребителей",
      icon: "https://static.tildacdn.com/tild6231-6336-4439-a236-343637623035/beer_2.png",
    },
  ],
  pullQuote: "Нам есть куда расти и есть новые возможности воплощать мечты.",
  bodyHtml:
    "Наконец-то приехали новые, большие танки для брожения - девять огромных ёмкостей, по 550 гл каждая, и нам не терпится их наполнить будущим пивом!<br /><br />Теперь мы сможем обеспечить всех любителей пенного богатым выбором на любой вкус.<br /><br />Помимо новых сортов, которые так ждут поклонники дегустаций, в регулярную линейку обязательно вернутся уже полюбившиеся сорта, такие как <a href=\"/beer/nut-butter\">Nut Butter</a>, <a href=\"/beer/rouge-de-fleur\">Rouge de Fleur</a>, <a href=\"/beer/friday-avenue-apa\">Friday Avenue APA</a>. Кроме того, сезонные сорта пива также не будут забыты.<br /><br />Очень скоро: традиционная классика и экспериментальная экзотика, привычное и необычное!<br /><br />Присоединяйтесь, пробуйте, открывайте новое вместе с нами!",
} as const;
