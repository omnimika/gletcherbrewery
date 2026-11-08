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
    src: "/pages/blog-misc/088a2981.jpg",
    alt: "",
  },
  heroImage: {
    src: "/pages/blog-misc/088a2977.jpg",
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
      icon: "/pages/blog-misc/asset-31323636.png",
    },
    {
      value: "55 000",
      label: "литров вмещает каждый из ЦКТ",
      icon: "/pages/blog-misc/asset-33616338.png",
    },
    {
      value: "756 000",
      label:
        "на столько больше бутылок пива будут радовать наших потребителей",
      icon: "/pages/blog-misc/beer_2.png",
    },
  ],
  pullQuote: "Нам есть куда расти и есть новые возможности воплощать мечты.",
  bodyHtml:
    "Наконец-то приехали новые, большие танки для брожения - девять огромных ёмкостей, по 550 гл каждая, и нам не терпится их наполнить будущим пивом!<br /><br />Теперь мы сможем обеспечить всех любителей пенного богатым выбором на любой вкус.<br /><br />Помимо новых сортов, которые так ждут поклонники дегустаций, в регулярную линейку обязательно вернутся уже полюбившиеся сорта, такие как <a href=\"/beer/nut-butter\">Nut Butter</a>, <a href=\"/beer/rouge-de-fleur\">Rouge de Fleur</a>, <a href=\"/beer/friday-avenue-apa\">Friday Avenue APA</a>. Кроме того, сезонные сорта пива также не будут забыты.<br /><br />Очень скоро: традиционная классика и экспериментальная экзотика, привычное и необычное!<br /><br />Присоединяйтесь, пробуйте, открывайте новое вместе с нами!",
} as const;
