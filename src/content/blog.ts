import type { PublishedLocale } from "@/i18n/locales";
import { DEFAULT_LOCALE } from "@/i18n/locales";
import { PRODUCTION_ORIGIN } from "@/lib/site-links";
import {
  findArticleBodyBySlug,
  getArticleBody,
  listLocalArticleParams,
} from "@/content/blog/articles";
import type { BlogArticleBody } from "@/content/blog/blocks";
import type { BlogCategoryId } from "@/content/blog-categories";

export type { BlogCategoryId } from "@/content/blog-categories";

/**
 * Blog fixtures — listing + local article bodies (sprint 2–4).
 * See docs/discovery/BLOG_CONTENT_CONTRACT.md,
 * BLOG_BATCH1–14_MANIFEST.md, ADR 0005.
 * Categories: `src/content/blog-categories.ts` (Tilda feed parts).
 */

export type BlogTranslationStatus = "published" | "draft" | "missing";

export type BlogPostTranslation = {
  status: BlogTranslationStatus;
  title: string;
  /** Localized category chip as on production home/listing. */
  categoryLabel: string;
  /** ISO calendar date when Confirmed; display formatting is UI concern. */
  publishedAt?: string;
  /**
   * Production path including locale prefix for EN
   * (e.g. `/blog-all/tpost/...` or `/en/blog-all/tpost/...`).
   */
  productionPath: string;
  /**
   * Public slug under `/blog-all/tpost/{slug}` when a local body exists.
   * Matches production `postdefaulturl` segment.
   */
  localSlug?: string;
};

export type BlogPost = {
  id: string;
  categoryId: BlogCategoryId;
  translations: Partial<Record<PublishedLocale, BlogPostTranslation>>;
};

export type BlogListCard = {
  id: string;
  categoryId: BlogCategoryId;
  categoryLabel: string;
  title: string;
  publishedAt?: string;
  /** Preformatted display date (server-stable; avoids client Intl hydration drift). */
  dateLabel?: string;
  /** Feed excerpt from local article body when migrated. */
  description?: string;
  /** Cover from local article body when migrated. */
  cover?: { src: string; alt: string };
  /**
   * Local pathname when body is migrated; otherwise absolute production URL.
   */
  href: string;
  local: boolean;
};

export const BLOG_POSTS: BlogPost[] = [
  {
    id: "beer-pizza",
    categoryId: "news",
    translations: {
      ru: {
        status: "published",
        title: "9 октября — День пива и пиццы: идеальные сочетания от Gletcher",
        categoryLabel: "НОВОСТИ",
        publishedAt: "2026-10-09",
        productionPath:
          "/blog-all/tpost/913cadd4f1-9-oktyabrya-den-piva-i-pitstsi-idealnie",
        localSlug: "913cadd4f1-9-oktyabrya-den-piva-i-pitstsi-idealnie",
      },
      en: {
        status: "published",
        title:
          "October 9 — International Beer and Pizza Day: perfect pairings by Gletcher",
        categoryLabel: "NEWS",
        publishedAt: "2026-10-09",
        productionPath:
          "/en/blog-all/tpost/5od5iaktd1-october-9-international-beer-and-pizza-d",
        localSlug: "5od5iaktd1-october-9-international-beer-and-pizza-d",
      },
    },
  },
  {
    id: "homebrew-day",
    categoryId: "library",
    translations: {
      ru: {
        status: "published",
        title:
          "День легализации домашнего пивоварения: как homebrew изменил крафтовое пиво",
        categoryLabel: "БИБЛИОТЕКА",
        publishedAt: "2026-10-14",
        productionPath: "/blog-all/tpost/homebrewing-craft-beer-history",
        localSlug: "homebrewing-craft-beer-history",
      },
      en: { status: "missing", title: "", categoryLabel: "", productionPath: "" },
    },
  },
  {
    id: "barrel-aged",
    categoryId: "library",
    translations: {
      ru: {
        status: "published",
        title: "Barrel-Aged Beer Day: День выдержанного в бочках пива",
        categoryLabel: "БИБЛИОТЕКА",
        publishedAt: "2026-10-02",
        productionPath: "/blog-all/tpost/barrel-aged-beer-day-2026",
        localSlug: "barrel-aged-beer-day-2026",
      },
      en: { status: "missing", title: "", categoryLabel: "", productionPath: "" },
    },
  },
  {
    id: "afisha-winepark",
    categoryId: "events",
    translations: {
      ru: {
        status: "published",
        title: "Афиша Gletcher Brewery: WINEPARK, Поляна Пикник и Chicano Day",
        categoryLabel: "МЕРОПРИЯТИЯ",
        publishedAt: "2026-09-23",
        productionPath:
          "/blog-all/tpost/cf46mag0n1-afisha-gletcher-brewery-winepark-polyana",
        localSlug: "cf46mag0n1-afisha-gletcher-brewery-winepark-polyana",
      },
      en: { status: "missing", title: "", categoryLabel: "", productionPath: "" },
    },
  },
  {
    id: "moa-na",
    categoryId: "releases",
    translations: {
      ru: {
        status: "published",
        title: "Безалкогольное Milk of Amnesia!",
        categoryLabel: "РЕЛИЗЫ",
        publishedAt: "2026-03-26",
        productionPath:
          "/blog-all/tpost/u7ezeg5ax1-bezalkogolnoe-milk-of-amnesia",
        localSlug: "u7ezeg5ax1-bezalkogolnoe-milk-of-amnesia",
      },
      en: {
        status: "published",
        title: "Milk of Amnesia Non-Alcoholic",
        categoryLabel: "RELEASES",
        publishedAt: "2026-03-26",
        productionPath:
          "/en/blog-all/tpost/za6t88elj1-milk-of-amnesia-non-alcoholic",
        localSlug: "za6t88elj1-milk-of-amnesia-non-alcoholic",
      },
    },
  },
  {
    id: "aging",
    categoryId: "releases",
    translations: {
      en: {
        status: "published",
        title: "Gletcher Aging: Aged to Perfection",
        categoryLabel: "RELEASES",
        publishedAt: "2026-01-22",
        productionPath:
          "/en/blog-all/tpost/93l8iii9y1-gletcher-aging-aged-to-perfection",
        localSlug: "93l8iii9y1-gletcher-aging-aged-to-perfection",
      },
      // Not the same entity as RU Cynic story `uvgfhv9ec1` — peer remains Open.
      ru: { status: "missing", title: "", categoryLabel: "", productionPath: "" },
    },
  },
  {
    id: "tour-de-grapefruit",
    categoryId: "releases",
    translations: {
      ru: {
        status: "published",
        title: "Tour De Grapefruit: пшеничный цитрусовый эль",
        categoryLabel: "РЕЛИЗЫ",
        publishedAt: "2025-02-07",
        productionPath:
          "/blog-all/tpost/6euma1kok1-tour-de-grapefruit-pshenichnii-tsitrusov",
        localSlug: "6euma1kok1-tour-de-grapefruit-pshenichnii-tsitrusov",
      },
      en: {
        status: "published",
        title: "Tour De Grapefruit: citrus wheat ale",
        categoryLabel: "RELEASES",
        publishedAt: "2025-02-07",
        productionPath:
          "/en/blog-all/tpost/9i3ig0g2r1-tour-de-grapefruit-citrus-wheat-ale",
        localSlug: "9i3ig0g2r1-tour-de-grapefruit-citrus-wheat-ale",
      },
    },
  },
  {
    id: "kenig-kraft-fest",
    categoryId: "events",
    translations: {
      ru: {
        status: "published",
        title: "Едем в Калининград на Kenig Kraft Fest!",
        categoryLabel: "МЕРОПРИЯТИЯ",
        publishedAt: "2026-08-14",
        productionPath:
          "/blog-all/tpost/zd1a4a40u1-edem-v-kaliningrad-na-kenig-kraft-fest",
        localSlug: "zd1a4a40u1-edem-v-kaliningrad-na-kenig-kraft-fest",
      },
      en: { status: "missing", title: "", categoryLabel: "", productionPath: "" },
    },
  },
  {
    id: "gorky-craft",
    categoryId: "events",
    translations: {
      ru: {
        status: "published",
        title:
          "Горечь, крафт и рок-н-ролл: как мы оторвались на «Горьком Крафте»!",
        categoryLabel: "МЕРОПРИЯТИЯ",
        publishedAt: "2026-07-08",
        productionPath:
          "/blog-all/tpost/5hportmx81-gorech-kraft-i-rok-n-roll-kak-mi-otorval",
        localSlug: "5hportmx81-gorech-kraft-i-rok-n-roll-kak-mi-otorval",
      },
      en: { status: "missing", title: "", categoryLabel: "", productionPath: "" },
    },
  },
  {
    id: "arkhangelsk-craft-fest",
    categoryId: "events",
    translations: {
      ru: {
        status: "published",
        title: "Едем в Архангельск на CRAFT FEST!",
        categoryLabel: "МЕРОПРИЯТИЯ",
        publishedAt: "2026-02-09",
        productionPath:
          "/blog-all/tpost/gacdootci1-edem-v-arhangelsk-na-craft-fest",
        localSlug: "gacdootci1-edem-v-arhangelsk-na-craft-fest",
      },
      en: { status: "missing", title: "", categoryLabel: "", productionPath: "" },
    },
  },
  {
    id: "cynic-story",
    categoryId: "releases",
    translations: {
      ru: {
        status: "published",
        title: "Cynic: Философия времени и триумф имперского вкуса",
        categoryLabel: "РЕЛИЗЫ",
        publishedAt: "2026-01-22",
        productionPath:
          "/blog-all/tpost/uvgfhv9ec1-cynic-filosofiya-vremeni-i-triumf-impers",
        localSlug: "uvgfhv9ec1-cynic-filosofiya-vremeni-i-triumf-impers",
      },
      // Not the same entity as EN Aging `93l8iii9y1` — peer remains Open.
      en: { status: "missing", title: "", categoryLabel: "", productionPath: "" },
    },
  },
  {
    id: "friday-avenue",
    categoryId: "releases",
    translations: {
      ru: {
        status: "published",
        title: "Friday Avenue: пивной манифест пятничного вечера",
        categoryLabel: "РЕЛИЗЫ",
        publishedAt: "2024-06-21",
        productionPath:
          "/blog-all/tpost/01gzr6nji1-friday-avenue-pivnoi-manifest-pyatnichno",
        localSlug: "01gzr6nji1-friday-avenue-pivnoi-manifest-pyatnichno",
      },
      en: {
        status: "published",
        title: "Friday Avenue: friday night beer manifesto",
        categoryLabel: "RELEASES",
        publishedAt: "2024-06-25",
        productionPath:
          "/en/blog-all/tpost/3z3igkl1u1-friday-avenue-friday-night-beer-manifest",
        localSlug: "3z3igkl1u1-friday-avenue-friday-night-beer-manifest",
      },
    },
  },
  {
    id: "kraftomania",
    categoryId: "events",
    translations: {
      ru: {
        status: "published",
        title: "Gletcher Brewery на КРАФТОМАНИИ!",
        categoryLabel: "МЕРОПРИЯТИЯ",
        publishedAt: "2026-01-13",
        productionPath:
          "/blog-all/tpost/l1amaxj121-gletcher-brewery-na-kraftomanii",
        localSlug: "l1amaxj121-gletcher-brewery-na-kraftomanii",
      },
      en: { status: "missing", title: "", categoryLabel: "", productionPath: "" },
    },
  },
  {
    id: "new-year-2026",
    categoryId: "news",
    translations: {
      ru: {
        status: "published",
        title: "С Наступающим Новым 2026 годом!",
        categoryLabel: "НОВОСТИ",
        publishedAt: "2025-12-30",
        productionPath:
          "/blog-all/tpost/bl766ufrx1-s-nastupayuschim-novim-2026-godom",
        localSlug: "bl766ufrx1-s-nastupayuschim-novim-2026-godom",
      },
      en: { status: "missing", title: "", categoryLabel: "", productionPath: "" },
    },
  },
  {
    id: "match-racing",
    categoryId: "photo",
    translations: {
      ru: {
        status: "published",
        title: "Gletcher поддержал Кубок России по матчевым гонкам",
        categoryLabel: "ФОТО / ВИДЕО",
        publishedAt: "2025-09-18",
        productionPath:
          "/blog-all/tpost/5vugn2kjy1-gletcher-podderzhal-kubok-rossii-po-matc",
        localSlug: "5vugn2kjy1-gletcher-podderzhal-kubok-rossii-po-matc",
      },
      en: { status: "missing", title: "", categoryLabel: "", productionPath: "" },
    },
  },
  {
    id: "bar-hub-expo",
    categoryId: "events",
    translations: {
      ru: {
        status: "published",
        title: "bar hub EXPO 2025",
        categoryLabel: "МЕРОПРИЯТИЯ",
        publishedAt: "2025-09-08",
        productionPath: "/blog-all/tpost/u1mk7vpiy1-bar-hub-expo-2025",
        localSlug: "u1mk7vpiy1-bar-hub-expo-2025",
      },
      en: { status: "missing", title: "", categoryLabel: "", productionPath: "" },
    },
  },
  {
    id: "brut-grapefruit",
    categoryId: "releases",
    translations: {
      ru: {
        status: "published",
        title: "Brut Grapefruit: брют-эль, лёгкий напиток с искристым характером",
        categoryLabel: "РЕЛИЗЫ",
        publishedAt: "2024-08-30",
        productionPath:
          "/blog-all/tpost/lypdkibzr1-brut-grapefruit-bryut-el-lyogkii-napitok",
        localSlug: "lypdkibzr1-brut-grapefruit-bryut-el-lyogkii-napitok",
      },
      en: {
        status: "published",
        title:
          "Brut Grapefruit: brutelle, a light drink with a sparkling character",
        categoryLabel: "RELEASES",
        publishedAt: "2024-09-03",
        productionPath:
          "/en/blog-all/tpost/24i9vt9881-brut-grapefruit-brutelle-a-light-drink-w",
        localSlug: "24i9vt9881-brut-grapefruit-brutelle-a-light-drink-w",
      },
    },
  },
  {
    id: "brainstorm-motor-fest-2025",
    categoryId: "events",
    translations: {
      ru: {
        status: "published",
        title: "BRAINSTORM MOTOR FEST 2025",
        categoryLabel: "МЕРОПРИЯТИЯ",
        publishedAt: "2025-07-29",
        productionPath:
          "/blog-all/tpost/t3rp7u17x1-brainstorm-motor-fest-2025",
        localSlug: "t3rp7u17x1-brainstorm-motor-fest-2025",
      },
      en: { status: "missing", title: "", categoryLabel: "", productionPath: "" },
    },
  },
  {
    id: "nizhny-gorky-craft",
    categoryId: "events",
    translations: {
      ru: {
        status: "published",
        title: "GLETCHER ЕДЕТ В НИЖНИЙ НОВГОРОД!",
        categoryLabel: "МЕРОПРИЯТИЯ",
        publishedAt: "2025-07-01",
        productionPath:
          "/blog-all/tpost/zslbtrzf81-gletcher-edet-v-nizhnii-novgorod",
        localSlug: "zslbtrzf81-gletcher-edet-v-nizhnii-novgorod",
      },
      en: { status: "missing", title: "", categoryLabel: "", productionPath: "" },
    },
  },
  {
    id: "klin-may-fest-2025-results",
    categoryId: "events",
    translations: {
      ru: {
        status: "published",
        title: "КЛИН МАЙ ФЕСТ 2025: ИТОГИ",
        categoryLabel: "МЕРОПРИЯТИЯ",
        publishedAt: "2025-06-03",
        productionPath:
          "/blog-all/tpost/lvdpb93421-klin-mai-fest-2025-itogi",
        localSlug: "lvdpb93421-klin-mai-fest-2025-itogi",
      },
      en: { status: "missing", title: "", categoryLabel: "", productionPath: "" },
    },
  },
  {
    id: "iron-woods-milk-stout",
    categoryId: "releases",
    translations: {
      ru: {
        status: "published",
        title: "Iron Woods Milk Stout: мягкий сливочный стаут",
        categoryLabel: "РЕЛИЗЫ",
        publishedAt: "2025-04-08",
        productionPath:
          "/blog-all/tpost/bvhspd8pm1-iron-woods-milk-stout-myagkii-slivochnii",
        localSlug: "bvhspd8pm1-iron-woods-milk-stout-myagkii-slivochnii",
      },
      // Not the same entity as EN dry stout — peer remains Open / not paired.
      en: { status: "missing", title: "", categoryLabel: "", productionPath: "" },
    },
  },
  {
    id: "rouge-de-fleur",
    categoryId: "releases",
    translations: {
      ru: {
        status: "published",
        title: "Rouge de Fleur: вишнёвая симфония",
        categoryLabel: "РЕЛИЗЫ",
        publishedAt: "2024-07-23",
        productionPath:
          "/blog-all/tpost/pvbch1v1p1-rouge-de-fleur-vishnyovaya-simfoniya",
        localSlug: "pvbch1v1p1-rouge-de-fleur-vishnyovaya-simfoniya",
      },
      en: {
        status: "published",
        title: "Rouge de Fleur: Cherry Symphony",
        categoryLabel: "RELEASES",
        publishedAt: "2024-08-20",
        productionPath:
          "/en/blog-all/tpost/k3spgxeyx1-rouge-de-fleur-cherry-symphony",
        localSlug: "k3spgxeyx1-rouge-de-fleur-cherry-symphony",
      },
    },
  },
  {
    id: "brainstorm-motor-fest-2024",
    categoryId: "events",
    translations: {
      ru: {
        status: "published",
        title: "Brainstorm Motor Fest 2024: фестиваль авто и мото культуры",
        categoryLabel: "МЕРОПРИЯТИЯ",
        publishedAt: "2024-07-28",
        productionPath:
          "/blog-all/tpost/r6g8ym6vs1-brainstorm-motor-fest-2024-festival-avto",
        localSlug: "r6g8ym6vs1-brainstorm-motor-fest-2024-festival-avto",
      },
      en: { status: "missing", title: "", categoryLabel: "", productionPath: "" },
    },
  },
  {
    id: "bowler-ipa",
    categoryId: "releases",
    translations: {
      ru: {
        status: "published",
        title: "Bowler IPA: вкус путешествий и приключений",
        categoryLabel: "РЕЛИЗЫ",
        publishedAt: "2024-07-08",
        productionPath:
          "/blog-all/tpost/rrjjjry2e1-bowler-ipa-vkus-puteshestvii-i-priklyuch",
        localSlug: "rrjjjry2e1-bowler-ipa-vkus-puteshestvii-i-priklyuch",
      },
      en: {
        status: "published",
        title: "Bowler IPA: A taste of travel and adventure",
        categoryLabel: "RELEASES",
        publishedAt: "2024-07-16",
        productionPath:
          "/en/blog-all/tpost/08cj20t161-bowler-ipa-a-taste-of-travel-and-adventu",
        localSlug: "08cj20t161-bowler-ipa-a-taste-of-travel-and-adventu",
      },
    },
  },
  {
    id: "iron-woods-dry-stout",
    categoryId: "releases",
    translations: {
      ru: {
        status: "published",
        title: "Iron Woods: сила и харизма сухого стаута",
        categoryLabel: "РЕЛИЗЫ",
        publishedAt: "2024-07-05",
        productionPath:
          "/blog-all/tpost/uphlmfzxv1-iron-woods-sila-i-harizma-suhogo-stauta",
        localSlug: "uphlmfzxv1-iron-woods-sila-i-harizma-suhogo-stauta",
      },
      en: {
        status: "published",
        title: "Iron Woods: the power and charisma of a dry stout",
        categoryLabel: "RELEASES",
        publishedAt: "2024-07-02",
        productionPath:
          "/en/blog-all/tpost/a842y8num1-iron-woods-the-power-and-charisma-of-a-d",
        localSlug: "a842y8num1-iron-woods-the-power-and-charisma-of-a-d",
      },
    },
  },
  {
    id: "brainstorm-apa",
    categoryId: "releases",
    translations: {
      ru: {
        status: "published",
        title: "Brainstorm: ваш спутник здорового образа жизни",
        categoryLabel: "РЕЛИЗЫ",
        publishedAt: "2024-06-27",
        productionPath:
          "/blog-all/tpost/s6hgiav341-brainstorm-vash-sputnik-zdorovogo-obraza",
        localSlug: "s6hgiav341-brainstorm-vash-sputnik-zdorovogo-obraza",
      },
      en: {
        status: "published",
        title: "Brainstorm: your companion for a healthy lifestyle",
        categoryLabel: "RELEASES",
        publishedAt: "2024-06-28",
        productionPath:
          "/en/blog-all/tpost/gumm02kpp1-brainstorm-your-companion-for-a-healthy",
        localSlug: "gumm02kpp1-brainstorm-your-companion-for-a-healthy",
      },
    },
  },
  {
    id: "ausweis",
    categoryId: "releases",
    translations: {
      ru: {
        status: "published",
        title: "Ausweis: ваш пропуск в мир немецкого пива",
        categoryLabel: "РЕЛИЗЫ",
        publishedAt: "2024-06-24",
        productionPath:
          "/blog-all/tpost/lp53os88v1-ausweis-vash-propusk-v-mir-nemetskogo-pi",
        localSlug: "lp53os88v1-ausweis-vash-propusk-v-mir-nemetskogo-pi",
      },
      en: {
        status: "published",
        title: "Ausweis: your passport to the world of German beer",
        categoryLabel: "RELEASES",
        publishedAt: "2024-06-26",
        productionPath:
          "/en/blog-all/tpost/6xf9bvgit1-ausweis-your-passport-to-the-world-of-ge",
        localSlug: "6xf9bvgit1-ausweis-your-passport-to-the-world-of-ge",
      },
    },
  },
  {
    id: "nut-butter",
    categoryId: "releases",
    translations: {
      ru: {
        status: "published",
        title: "Nut Butter: ореховая магия в каждом глотке",
        categoryLabel: "РЕЛИЗЫ",
        publishedAt: "2024-06-19",
        productionPath:
          "/blog-all/tpost/han5v1ryi1-nut-butter-orehovaya-magiya-v-kazhdom-gl",
        localSlug: "han5v1ryi1-nut-butter-orehovaya-magiya-v-kazhdom-gl",
      },
      en: {
        status: "published",
        title: "Nut Butter: nutty magic in every sip",
        categoryLabel: "RELEASES",
        publishedAt: "2024-06-24",
        productionPath:
          "/en/blog-all/tpost/h91e4e7g91-nut-butter-nutty-magic-in-every-sip",
        localSlug: "h91e4e7g91-nut-butter-nutty-magic-in-every-sip",
      },
    },
  },
  {
    id: "blue-monkey",
    categoryId: "releases",
    translations: {
      ru: {
        status: "published",
        title: "Blue Monkey: пшеничный эль во всём своём великолепии",
        categoryLabel: "РЕЛИЗЫ",
        publishedAt: "2024-06-15",
        productionPath:
          "/blog-all/tpost/01ttab5vb1-blue-monkey-pshenichnii-el-vo-vsyom-svoy",
        localSlug: "01ttab5vb1-blue-monkey-pshenichnii-el-vo-vsyom-svoy",
      },
      en: {
        status: "published",
        title: "Blue Monkey: wheat ale in all its splendor",
        categoryLabel: "RELEASES",
        publishedAt: "2024-06-15",
        productionPath:
          "/en/blog-all/tpost/mlz4jtzag1-blue-monkey-wheat-ale-in-all-its-splendo",
        localSlug: "mlz4jtzag1-blue-monkey-wheat-ale-in-all-its-splendo",
      },
    },
  },
  {
    id: "heidegger-hell",
    categoryId: "releases",
    translations: {
      ru: {
        status: "published",
        title: "Heidegger Hell: немецкие традиции в вашем бокале",
        categoryLabel: "РЕЛИЗЫ",
        publishedAt: "2024-06-13",
        productionPath:
          "/blog-all/tpost/r1vxz57aa1-heidegger-hell-nemetskie-traditsii-v-vas",
        localSlug: "r1vxz57aa1-heidegger-hell-nemetskie-traditsii-v-vas",
      },
      en: {
        status: "published",
        title: "Heidegger Hell: German traditions in your glass",
        categoryLabel: "RELEASES",
        publishedAt: "2024-06-13",
        productionPath:
          "/en/blog-all/tpost/z246e2pvf1-heidegger-hell-german-traditions-in-your",
        localSlug: "z246e2pvf1-heidegger-hell-german-traditions-in-your",
      },
    },
  },
  {
    id: "hop-dragon",
    categoryId: "releases",
    translations: {
      ru: {
        status: "published",
        title: "Hop Dragon: яркий вкус пяти хмелей",
        categoryLabel: "РЕЛИЗЫ",
        publishedAt: "2024-06-07",
        productionPath:
          "/blog-all/tpost/vo2xnz54a1-hop-dragon-yarkii-vkus-pyati-hmelei",
        localSlug: "vo2xnz54a1-hop-dragon-yarkii-vkus-pyati-hmelei",
      },
      en: {
        status: "published",
        title: "Hop Dragon: the bright taste of five hops",
        categoryLabel: "RELEASES",
        publishedAt: "2024-06-07",
        productionPath:
          "/en/blog-all/tpost/8e11sgv211-hop-dragon-the-bright-taste-of-five-hops",
        localSlug: "8e11sgv211-hop-dragon-the-bright-taste-of-five-hops",
      },
    },
  },
  {
    id: "ruby-road",
    categoryId: "releases",
    translations: {
      ru: {
        status: "published",
        title: "Ruby Road: наш крепкий вишневый эль в новом исполнении",
        categoryLabel: "РЕЛИЗЫ",
        publishedAt: "2024-06-03",
        productionPath:
          "/blog-all/tpost/db51dn3df1-ruby-road-nash-krepkii-vishnevii-el-v-no",
        localSlug: "db51dn3df1-ruby-road-nash-krepkii-vishnevii-el-v-no",
      },
      en: {
        status: "published",
        title: "Ruby Road: our strong cherry ale in a new version",
        categoryLabel: "RELEASES",
        publishedAt: "2024-06-03",
        productionPath:
          "/en/blog-all/tpost/s5buub3ik1-ruby-road-our-strong-cherry-ale-in-a-new",
        localSlug: "s5buub3ik1-ruby-road-our-strong-cherry-ale-in-a-new",
      },
    },
  },
  {
    id: "milk-of-amnesia",
    categoryId: "releases",
    translations: {
      ru: {
        status: "published",
        title: "Milk of Amnesia: Новый взгляд на любимый вкус",
        categoryLabel: "РЕЛИЗЫ",
        publishedAt: "2024-05-29",
        productionPath:
          "/blog-all/tpost/nmvocr5vt1-milk-of-amnesia-novii-vzglyad-na-lyubimi",
        localSlug: "nmvocr5vt1-milk-of-amnesia-novii-vzglyad-na-lyubimi",
      },
      en: {
        status: "published",
        title: "Milk of Amnesia: A new look at your favorite taste",
        categoryLabel: "RELEASES",
        publishedAt: "2024-05-29",
        productionPath:
          "/en/blog-all/tpost/zxbflinfn1-milk-of-amnesia-a-new-look-at-your-favor",
        localSlug: "zxbflinfn1-milk-of-amnesia-a-new-look-at-your-favor",
      },
    },
  },
  {
    id: "pub-history",
    categoryId: "library",
    translations: {
      ru: {
        status: "published",
        title: "Краткая история пабов, баров и тех людей, кто наливает",
        categoryLabel: "БИБЛИОТЕКА",
        publishedAt: "2024-02-26",
        productionPath:
          "/blog-all/tpost/v1p6azozg1-kratkaya-istoriya-pabov-barov-i-teh-lyud",
        localSlug: "v1p6azozg1-kratkaya-istoriya-pabov-barov-i-teh-lyud",
      },
      en: { status: "missing", title: "", categoryLabel: "", productionPath: "" },
    },
  },
  {
    id: "stout-guide",
    categoryId: "library",
    translations: {
      ru: {
        status: "published",
        title: "Разбираемся в сортах: стауты",
        categoryLabel: "БИБЛИОТЕКА",
        publishedAt: "2024-02-04",
        productionPath:
          "/blog-all/tpost/plfsxpk1n1-razbiraemsya-v-sortah-stauti",
        localSlug: "plfsxpk1n1-razbiraemsya-v-sortah-stauti",
      },
      en: { status: "missing", title: "", categoryLabel: "", productionPath: "" },
    },
  },
  {
    id: "cooking-thai-fries",
    categoryId: "recipes",
    translations: {
      ru: {
        status: "published",
        title:
          "Готовим с пивом: картофель фри в тайском стиле с хмелевым майонезом и арахисом",
        categoryLabel: "ФУДПЕЙРИНГ / РЕЦЕПТЫ",
        publishedAt: "2024-02-01",
        productionPath:
          "/blog-all/tpost/pj8zx40cu1-gotovim-s-pivom-kartofel-fri-v-taiskom-s",
        localSlug: "pj8zx40cu1-gotovim-s-pivom-kartofel-fri-v-taiskom-s",
      },
      en: { status: "missing", title: "", categoryLabel: "", productionPath: "" },
    },
  },
  {
    id: "winter-warmers",
    categoryId: "library",
    translations: {
      ru: {
        status: "published",
        title: "В поисках истоков пряного зимнего пива",
        categoryLabel: "БИБЛИОТЕКА",
        publishedAt: "2024-01-23",
        productionPath:
          "/blog-all/tpost/kap55i5pe1-v-poiskah-istokov-pryanogo-zimnego-piva",
        localSlug: "kap55i5pe1-v-poiskah-istokov-pryanogo-zimnego-piva",
      },
      en: { status: "missing", title: "", categoryLabel: "", productionPath: "" },
    },
  },
  {
    id: "klin-may-fest-2024-invite",
    categoryId: "news",
    translations: {
      ru: {
        status: "published",
        title: "Приглашаем участников на Клин Май Фест 2024",
        categoryLabel: "НОВОСТИ",
        publishedAt: "2024-01-12",
        productionPath:
          "/blog-all/tpost/8ionj8vgo1-priglashaem-uchastnikov-na-klin-mai-fest",
        localSlug: "8ionj8vgo1-priglashaem-uchastnikov-na-klin-mai-fest",
      },
      en: { status: "missing", title: "", categoryLabel: "", productionPath: "" },
    },
  },
  {
    id: "non-alcohol-trend",
    categoryId: "library",
    translations: {
      ru: {
        status: "published",
        title: "На здоровье! 0% N/A",
        categoryLabel: "БИБЛИОТЕКА",
        publishedAt: "2023-12-17",
        productionPath: "/blog-all/tpost/u9dt270xo1-na-zdorove-0-na",
        localSlug: "u9dt270xo1-na-zdorove-0-na",
      },
      en: { status: "missing", title: "", categoryLabel: "", productionPath: "" },
    },
  },
  {
    id: "brainstorm-moto-fest-2023-report",
    categoryId: "photo",
    translations: {
      ru: {
        status: "published",
        title: "ФОТООТЧЁТ С BRAINSTORM MOTO FEST",
        categoryLabel: "ФОТО / ВИДЕО",
        publishedAt: "2023-08-22",
        productionPath:
          "/blog-all/tpost/en25lxya61-fotootchyot-s-brainstorm-moto-fest",
        localSlug: "en25lxya61-fotootchyot-s-brainstorm-moto-fest",
      },
      en: { status: "missing", title: "", categoryLabel: "", productionPath: "" },
    },
  },
  {
    id: "arkhangelsk-craft-fest-2023",
    categoryId: "events",
    translations: {
      ru: {
        status: "published",
        title: "Gletcher в Архангельске: Craft Fest!",
        categoryLabel: "МЕРОПРИЯТИЯ",
        publishedAt: "2023-08-03",
        productionPath:
          "/blog-all/tpost/ybi8xe5lc1-gletcher-v-arhangelske-craft-fest",
        localSlug: "ybi8xe5lc1-gletcher-v-arhangelske-craft-fest",
      },
      en: { status: "missing", title: "", categoryLabel: "", productionPath: "" },
    },
  },
  {
    id: "klin-may-fest-2023-results",
    categoryId: "events",
    translations: {
      ru: {
        status: "published",
        title: "ИТОГИ КЛИНМАЙФЕСТ 2023",
        categoryLabel: "МЕРОПРИЯТИЯ",
        publishedAt: "2023-05-30",
        productionPath: "/blog-all/tpost/8imlu33eh1-itogi-klinmaifest-2023",
        localSlug: "8imlu33eh1-itogi-klinmaifest-2023",
      },
      en: { status: "missing", title: "", categoryLabel: "", productionPath: "" },
    },
  },
  {
    id: "klin-may-fest-2023-invite",
    categoryId: "news",
    translations: {
      ru: {
        status: "published",
        title: "КЛИН МАЙ ФЕСТ 2023: Приглашаем участников!",
        categoryLabel: "НОВОСТИ",
        publishedAt: "2023-03-21",
        productionPath:
          "/blog-all/tpost/fjtb6ibov1-klin-mai-fest-2023-priglashaem-uchastnik",
        localSlug: "fjtb6ibov1-klin-mai-fest-2023-priglashaem-uchastnik",
      },
      en: { status: "missing", title: "", categoryLabel: "", productionPath: "" },
    },
  },
  {
    id: "cooking-tuna-aguachile",
    categoryId: "recipes",
    translations: {
      ru: {
        status: "published",
        title: "Пивная кухня: Тунец Агуачиле в IPA соусе",
        categoryLabel: "ФУДПЕЙРИНГ / РЕЦЕПТЫ",
        publishedAt: "2023-03-03",
        productionPath:
          "/blog-all/tpost/gjauaxmg91-pivnaya-kuhnya-tunets-aguachile-v-ipa-so",
        localSlug: "gjauaxmg91-pivnaya-kuhnya-tunets-aguachile-v-ipa-so",
      },
      en: { status: "missing", title: "", categoryLabel: "", productionPath: "" },
    },
  },
  {
    id: "cinnamon-beer",
    categoryId: "library",
    translations: {
      ru: {
        status: "published",
        title: "Пиво с корицей: какое оно бывает?",
        categoryLabel: "БИБЛИОТЕКА",
        publishedAt: "2023-02-24",
        productionPath:
          "/blog-all/tpost/kd7ovgz6k1-pivo-s-koritsei-kakoe-ono-bivaet",
        localSlug: "kd7ovgz6k1-pivo-s-koritsei-kakoe-ono-bivaet",
      },
      en: { status: "missing", title: "", categoryLabel: "", productionPath: "" },
    },
  },
  {
    id: "cooking-salmon-ipa",
    categoryId: "recipes",
    translations: {
      ru: {
        status: "published",
        title: "Пивная кухня: жареный лосось в фольге с лимоном и IPA",
        categoryLabel: "ФУДПЕЙРИНГ / РЕЦЕПТЫ",
        publishedAt: "2022-11-24",
        productionPath:
          "/blog-all/tpost/hac96kiyz1-pivnaya-kuhnya-zharenii-losos-v-folge-s",
        localSlug: "hac96kiyz1-pivnaya-kuhnya-zharenii-losos-v-folge-s",
      },
      en: { status: "missing", title: "", categoryLabel: "", productionPath: "" },
    },
  },
  {
    id: "beer-acidity",
    categoryId: "library",
    translations: {
      ru: {
        status: "published",
        title: "Кислота в пиве: как пивоваренная промышленность изменила химию",
        categoryLabel: "БИБЛИОТЕКА",
        publishedAt: "2022-11-18",
        productionPath:
          "/blog-all/tpost/79g7nt4ny1-kislota-v-pive-kak-pivovarennaya-promish",
        localSlug: "79g7nt4ny1-kislota-v-pive-kak-pivovarennaya-promish",
      },
      en: {
        status: "published",
        title:
          "Acid in beer: how the brewing industry has changed chemistry",
        categoryLabel: "GLOSSARY",
        publishedAt: "2022-11-18",
        productionPath:
          "/en/blog-all/tpost/lj8oemius1-acid-in-beer-how-the-brewing-industry-ha",
        localSlug: "lj8oemius1-acid-in-beer-how-the-brewing-industry-ha",
      },
    },
  },
  {
    id: "quality-day",
    categoryId: "news",
    translations: {
      ru: {
        status: "published",
        title: "Всемирный день качества",
        categoryLabel: "НОВОСТИ",
        publishedAt: "2022-11-10",
        productionPath: "/blog-all/tpost/9gst01oa91-vsemirnii-den-kachestva",
        localSlug: "9gst01oa91-vsemirnii-den-kachestva",
      },
      en: { status: "missing", title: "", categoryLabel: "", productionPath: "" },
    },
  },
  {
    id: "craft-depot-interview",
    categoryId: "interview",
    translations: {
      ru: {
        status: "published",
        title: "Интерьвью для ассоциации CRAFT DEPOT",
        categoryLabel: "ИНТЕРВЬЮ",
        publishedAt: "2022-09-22",
        productionPath:
          "/blog-all/tpost/inxody6ls1-intervyu-dlya-assotsiatsii-craft-depot",
        localSlug: "inxody6ls1-intervyu-dlya-assotsiatsii-craft-depot",
      },
      en: {
        status: "published",
        title: "Interview for the CRAFT DEPOT Association",
        categoryLabel: "INTERVIEW",
        publishedAt: "2022-09-22",
        productionPath:
          "/en/blog-all/tpost/c4olen1kd1-interview-for-the-craft-depot-associatio",
        localSlug: "c4olen1kd1-interview-for-the-craft-depot-associatio",
      },
    },
  },
  {
    id: "pomor-craft-fest-2022",
    categoryId: "events",
    translations: {
      ru: {
        status: "published",
        title: "Поморский крафтовый фестиваль",
        categoryLabel: "МЕРОПРИЯТИЯ",
        publishedAt: "2022-08-03",
        productionPath:
          "/blog-all/tpost/iyanfyplj1-pomorskii-kraftovii-festival",
        localSlug: "iyanfyplj1-pomorskii-kraftovii-festival",
      },
      en: {
        status: "published",
        title: "Nord-Fest: Pomeranian Food&Drink Festival",
        categoryLabel: "EVENTS",
        publishedAt: "2022-07-31",
        productionPath:
          "/en/blog-all/tpost/dtxtl8kd91-nord-fest-pomeranian-foodampdrink-festiv",
        localSlug: "dtxtl8kd91-nord-fest-pomeranian-foodampdrink-festiv",
      },
    },
  },
  {
    id: "american-hops-1",
    categoryId: "library",
    translations: {
      ru: {
        status: "published",
        title: "История американского хмеля: часть 1",
        categoryLabel: "БИБЛИОТЕКА",
        publishedAt: "2022-01-20",
        productionPath:
          "/blog-all/tpost/5uhnubazb1-istoriya-amerikanskogo-hmelya-chast-1",
        localSlug: "5uhnubazb1-istoriya-amerikanskogo-hmelya-chast-1",
      },
      en: { status: "missing", title: "", categoryLabel: "", productionPath: "" },
    },
  },
  {
    id: "cheers-beers",
    categoryId: "events",
    translations: {
      ru: {
        status: "published",
        title: "Дегустация Cheers & Beers 🍺",
        categoryLabel: "МЕРОПРИЯТИЯ",
        publishedAt: "2022-06-01",
        productionPath:
          "/blog-all/tpost/tfatlkslk1-degustatsiya-cheers-amp-beers",
        localSlug: "tfatlkslk1-degustatsiya-cheers-amp-beers",
      },
      en: {
        status: "published",
        title: "Tasting Cheers & Beers 🍺",
        categoryLabel: "EVENTS",
        publishedAt: "2022-06-01",
        productionPath:
          "/en/blog-all/tpost/poxg2fuvl1-tasting-cheers-amp-beers",
        localSlug: "poxg2fuvl1-tasting-cheers-amp-beers",
      },
    },
  },
  {
    id: "prodexpo-2022",
    categoryId: "events",
    translations: {
      ru: {
        status: "published",
        title: "Gletcher на ПРОДЭКСПО 2022",
        categoryLabel: "МЕРОПРИЯТИЯ",
        publishedAt: "2022-02-03",
        productionPath:
          "/blog-all/tpost/2pminbnlo1-gletcher-na-prodekspo-2022",
        localSlug: "2pminbnlo1-gletcher-na-prodekspo-2022",
      },
      en: { status: "missing", title: "", categoryLabel: "", productionPath: "" },
    },
  },
  {
    id: "beer-sensation-more",
    categoryId: "library",
    translations: {
      ru: {
        status: "published",
        title: "Как мы ощущаем пиво: а что еще, кроме вкуса?",
        categoryLabel: "БИБЛИОТЕКА",
        publishedAt: "2021-11-25",
        productionPath:
          "/blog-all/tpost/hxjjtbo7k1-kak-mi-oschuschaem-pivo-a-chto-esche-kro",
        localSlug: "hxjjtbo7k1-kak-mi-oschuschaem-pivo-a-chto-esche-kro",
      },
      en: { status: "missing", title: "", categoryLabel: "", productionPath: "" },
    },
  },
  {
    id: "beer-sensation-acidity-salt",
    categoryId: "library",
    translations: {
      ru: {
        status: "published",
        title: "Как мы ощущаем пиво: кислотность, соль и умами",
        categoryLabel: "БИБЛИОТЕКА",
        publishedAt: "2021-11-12",
        productionPath:
          "/blog-all/tpost/4ryr3vef21-kak-mi-oschuschaem-pivo-kislotnost-sol-i",
        localSlug: "4ryr3vef21-kak-mi-oschuschaem-pivo-kislotnost-sol-i",
      },
      en: { status: "missing", title: "", categoryLabel: "", productionPath: "" },
    },
  },
  {
    id: "beer-sensation-bitterness",
    // Tilda `parts` empty — kept library (Proposed), same pattern as american-hops-1.
    categoryId: "library",
    translations: {
      ru: {
        status: "published",
        title: "Как мы ощущаем пиво: горечь",
        categoryLabel: "БИБЛИОТЕКА",
        publishedAt: "2021-10-01",
        productionPath:
          "/blog-all/tpost/x3afu840s1-kak-mi-oschuschaem-pivo-gorech",
        localSlug: "x3afu840s1-kak-mi-oschuschaem-pivo-gorech",
      },
      en: { status: "missing", title: "", categoryLabel: "", productionPath: "" },
    },
  },
  {
    id: "spoiled-beer",
    categoryId: "library",
    translations: {
      ru: {
        status: "published",
        title: "Испорченое пиво: главные ошибки",
        categoryLabel: "БИБЛИОТЕКА",
        publishedAt: "2021-09-24",
        productionPath:
          "/blog-all/tpost/jb9hgilpm1-isporchenoe-pivo-glavnie-oshibki",
        localSlug: "jb9hgilpm1-isporchenoe-pivo-glavnie-oshibki",
      },
      en: { status: "missing", title: "", categoryLabel: "", productionPath: "" },
    },
  },
  {
    id: "foodpairing-caramel",
    categoryId: "library",
    translations: {
      ru: {
        status: "published",
        title: "Фудпейринг: карамелизация",
        categoryLabel: "БИБЛИОТЕКА",
        publishedAt: "2021-09-14",
        productionPath:
          "/blog-all/tpost/p1og5o2691-fudpeiring-karamelizatsiya",
        localSlug: "p1og5o2691-fudpeiring-karamelizatsiya",
      },
      en: {
        status: "published",
        title: "Foodpairing: caramelization",
        categoryLabel: "GLOSSARY",
        publishedAt: "2021-09-14",
        productionPath:
          "/en/blog-all/tpost/mejto1lui1-foodpairing-caramelization",
        localSlug: "mejto1lui1-foodpairing-caramelization",
      },
    },
  },
  {
    id: "beer-sensation-aroma",
    categoryId: "library",
    translations: {
      ru: {
        status: "published",
        title: "Как мы ощущаем пиво: вкусо-ароматический букет",
        categoryLabel: "БИБЛИОТЕКА",
        publishedAt: "2021-08-18",
        productionPath:
          "/blog-all/tpost/ozy0n3ypa1-kak-mi-oschuschaem-pivo-vkuso-aromatiche",
        localSlug: "ozy0n3ypa1-kak-mi-oschuschaem-pivo-vkuso-aromatiche",
      },
      en: {
        status: "published",
        title: "How do we feel about beer: taste and aroma bouquet.",
        categoryLabel: "GLOSSARY",
        publishedAt: "2021-08-18",
        productionPath:
          "/en/blog-all/tpost/ck3it9fx11-how-do-we-feel-about-beer-taste-and-arom",
        localSlug: "ck3it9fx11-how-do-we-feel-about-beer-taste-and-arom",
      },
    },
  },
  {
    id: "smoked-malt",
    categoryId: "library",
    translations: {
      ru: {
        status: "published",
        title: "Копченый солод: дым и пиво",
        categoryLabel: "БИБЛИОТЕКА",
        publishedAt: "2021-08-05",
        productionPath:
          "/blog-all/tpost/pnenfyiyb1-kopchenii-solod-dim-i-pivo",
        localSlug: "pnenfyiyb1-kopchenii-solod-dim-i-pivo",
      },
      en: {
        status: "published",
        title: "Smoked malt: smoke and beer",
        categoryLabel: "GLOSSARY",
        publishedAt: "2021-08-05",
        productionPath:
          "/en/blog-all/tpost/d3vg4bzat1-smoked-malt-smoke-and-beer",
        localSlug: "d3vg4bzat1-smoked-malt-smoke-and-beer",
      },
    },
  },
  {
    id: "dry-hopping",
    categoryId: "library",
    translations: {
      ru: {
        status: "published",
        title: "Сухое охмеление: в погоне за ярким вкусом",
        categoryLabel: "БИБЛИОТЕКА",
        publishedAt: "2021-07-30",
        productionPath:
          "/blog-all/tpost/eajyz692l1-suhoe-ohmelenie-v-pogone-za-yarkim-vkuso",
        localSlug: "eajyz692l1-suhoe-ohmelenie-v-pogone-za-yarkim-vkuso",
      },
      en: {
        status: "published",
        title: "Dry hopping: in pursuit of a bright taste",
        categoryLabel: "GLOSSARY",
        publishedAt: "2021-07-30",
        productionPath:
          "/en/blog-all/tpost/txpbxbiek1-dry-hopping-in-pursuit-of-a-bright-taste",
        localSlug: "txpbxbiek1-dry-hopping-in-pursuit-of-a-bright-taste",
      },
    },
  },
  {
    id: "foodpairing-snacks",
    // RU Tilda parts → library; EN peer parts → recipes (chip RECIPES).
    categoryId: "library",
    translations: {
      ru: {
        status: "published",
        title:
          "Фудпейринг: почему это интереснее просто соленых снэков к пиву",
        categoryLabel: "БИБЛИОТЕКА",
        publishedAt: "2021-07-14",
        productionPath:
          "/blog-all/tpost/2n2pr8dng1-fudpeiring-pochemu-eto-interesnee-prosto",
        localSlug: "2n2pr8dng1-fudpeiring-pochemu-eto-interesnee-prosto",
      },
      en: {
        status: "published",
        title:
          "Food pairing: why it's more interesting than just salty snacks with beer",
        categoryLabel: "RECIPES",
        publishedAt: "2021-07-14",
        productionPath:
          "/en/blog-all/tpost/xy53paori1-food-pairing-why-its-more-interesting-th",
        localSlug: "xy53paori1-food-pairing-why-its-more-interesting-th",
      },
    },
  },
  {
    id: "bavaria-brewing",
    categoryId: "library",
    translations: {
      ru: {
        status: "published",
        title: "Бавария: колыбель пивоварения",
        categoryLabel: "БИБЛИОТЕКА",
        publishedAt: "2021-06-08",
        productionPath:
          "/blog-all/tpost/730oojkrr1-bavariya-kolibel-pivovareniya",
        localSlug: "730oojkrr1-bavariya-kolibel-pivovareniya",
      },
      en: {
        status: "published",
        title: "Bavaria: the cradle of brewing",
        categoryLabel: "GLOSSARY",
        publishedAt: "2021-06-08",
        productionPath:
          "/en/blog-all/tpost/pu9xfazps1-bavaria-the-cradle-of-brewing",
        localSlug: "pu9xfazps1-bavaria-the-cradle-of-brewing",
      },
    },
  },
  {
    id: "stout-talk",
    // Confirmed peer of EN 2021 stout; ≠ stout-guide RU 2024.
    categoryId: "library",
    translations: {
      ru: {
        status: "published",
        title: "Стауты: поговорим о крепком",
        categoryLabel: "БИБЛИОТЕКА",
        publishedAt: "2021-05-17",
        productionPath:
          "/blog-all/tpost/0viy48tr71-stauti-pogovorim-o-krepkom",
        localSlug: "0viy48tr71-stauti-pogovorim-o-krepkom",
      },
      en: {
        status: "published",
        title: "Let's talk about Stout",
        categoryLabel: "GLOSSARY",
        publishedAt: "2021-05-17",
        productionPath:
          "/en/blog-all/tpost/e40oxvnn01-lets-talk-about-stout",
        localSlug: "e40oxvnn01-lets-talk-about-stout",
      },
    },
  },
  {
    id: "beer-foam",
    categoryId: "library",
    translations: {
      ru: {
        status: "published",
        title: "Что может сказать пивная пена?",
        categoryLabel: "БИБЛИОТЕКА",
        publishedAt: "2021-04-23",
        productionPath:
          "/blog-all/tpost/9y0d4gr0y1-chto-mozhet-skazat-pivnaya-pena",
        localSlug: "9y0d4gr0y1-chto-mozhet-skazat-pivnaya-pena",
      },
      en: {
        status: "published",
        title: "What can beer foam say?",
        categoryLabel: "GLOSSARY",
        publishedAt: "2021-04-23",
        productionPath:
          "/en/blog-all/tpost/ymfo0i2t71-what-can-beer-foam-say",
        localSlug: "ymfo0i2t71-what-can-beer-foam-say",
      },
    },
  },
  {
    id: "ale-or-lager",
    categoryId: "library",
    translations: {
      ru: {
        status: "published",
        title: "Эль или лагер: история о дрожжах",
        categoryLabel: "БИБЛИОТЕКА",
        publishedAt: "2021-03-20",
        productionPath:
          "/blog-all/tpost/gya48ze261-el-ili-lager-istoriya-o-drozhzhah",
        localSlug: "gya48ze261-el-ili-lager-istoriya-o-drozhzhah",
      },
      en: {
        status: "published",
        title: "Ale or lager: a story about yeast",
        categoryLabel: "GLOSSARY",
        publishedAt: "2021-03-20",
        productionPath:
          "/en/blog-all/tpost/snfk1giyd1-ale-or-lager-a-story-about-yeast",
        localSlug: "snfk1giyd1-ale-or-lager-a-story-about-yeast",
      },
    },
  },
  {
    id: "lady-beer-guide",
    categoryId: "library",
    translations: {
      ru: {
        status: "published",
        title: "Гайд: Как выбрать пиво для девушки?",
        categoryLabel: "БИБЛИОТЕКА",
        publishedAt: "2021-03-02",
        productionPath:
          "/blog-all/tpost/kcpdyda711-gaid-kak-vibrat-pivo-dlya-devushki",
        localSlug: "kcpdyda711-gaid-kak-vibrat-pivo-dlya-devushki",
      },
      en: {
        status: "published",
        title: "Guide: How to choose a beer for a lady?",
        categoryLabel: "GLOSSARY",
        publishedAt: "2021-03-02",
        productionPath:
          "/en/blog-all/tpost/dou93nl341-guide-how-to-choose-a-beer-for-a-lady",
        localSlug: "dou93nl341-guide-how-to-choose-a-beer-for-a-lady",
      },
    },
  },
  {
    id: "four-ingredients",
    categoryId: "library",
    translations: {
      ru: {
        status: "published",
        title: "Четыре ингредиента и море возможностей: из чего состоит пиво",
        categoryLabel: "БИБЛИОТЕКА",
        publishedAt: "2021-02-19",
        productionPath:
          "/blog-all/tpost/zg9u7nn2y1-chetire-ingredienta-i-more-vozmozhnostei",
        localSlug: "zg9u7nn2y1-chetire-ingredienta-i-more-vozmozhnostei",
      },
      en: {
        status: "published",
        title:
          "Four ingredients and a sea of possibilities: what beer is made of?",
        categoryLabel: "GLOSSARY",
        publishedAt: "2021-02-19",
        productionPath:
          "/en/blog-all/tpost/okjzxv2gf1-four-ingredients-and-a-sea-of-possibilit",
        localSlug: "okjzxv2gf1-four-ingredients-and-a-sea-of-possibilit",
      },
    },
  },
  {
    id: "blanche-weizen",
    categoryId: "library",
    translations: {
      ru: {
        status: "published",
        title: "1000 км разницы между Бланшем и Вайценом. А что ещё?",
        categoryLabel: "БИБЛИОТЕКА",
        publishedAt: "2021-02-09",
        productionPath:
          "/blog-all/tpost/d1knu5x0k1-1000-km-raznitsi-mezhdu-blanshem-i-vaits",
        localSlug: "d1knu5x0k1-1000-km-raznitsi-mezhdu-blanshem-i-vaits",
      },
      en: {
        status: "published",
        title: "1000 km difference between Blanche and Weizen. What else?",
        categoryLabel: "GLOSSARY",
        publishedAt: "2021-02-09",
        productionPath:
          "/en/blog-all/tpost/japn2sfx71-1000-km-difference-between-blanche-and-w",
        localSlug: "japn2sfx71-1000-km-difference-between-blanche-and-w",
      },
    },
  },
  {
    id: "milkshake-ipa",
    categoryId: "library",
    translations: {
      ru: {
        status: "published",
        title: "Milkshake IPA: история и особенности сорта",
        categoryLabel: "БИБЛИОТЕКА",
        publishedAt: "2021-01-22",
        productionPath:
          "/blog-all/tpost/m7zvi7e051-milkshake-ipa-istoriya-i-osobennosti-sor",
        localSlug: "m7zvi7e051-milkshake-ipa-istoriya-i-osobennosti-sor",
      },
      en: {
        status: "published",
        title: "Milkshake IPA: history and features of the style",
        categoryLabel: "GLOSSARY",
        publishedAt: "2021-01-22",
        productionPath:
          "/en/blog-all/tpost/i7nvy9f6m1-milkshake-ipa-history-and-features-of-th",
        localSlug: "i7nvy9f6m1-milkshake-ipa-history-and-features-of-th",
      },
    },
  },
  {
    id: "ibu",
    categoryId: "library",
    translations: {
      ru: {
        status: "published",
        title: "Мне не горько. Что такое IBU?",
        categoryLabel: "БИБЛИОТЕКА",
        publishedAt: "2021-01-12",
        productionPath:
          "/blog-all/tpost/jbjnakk441-mne-ne-gorko-chto-takoe-ibu",
        localSlug: "jbjnakk441-mne-ne-gorko-chto-takoe-ibu",
      },
      en: { status: "missing", title: "", categoryLabel: "", productionPath: "" },
    },
  },
  {
    id: "saison",
    categoryId: "releases",
    translations: {
      ru: { status: "missing", title: "", categoryLabel: "", productionPath: "" },
      en: {
        status: "published",
        title: "Saison: new taste",
        categoryLabel: "RELEASES",
        publishedAt: "2021-12-07",
        productionPath: "/en/blog-all/tpost/yuhkvdcho1-saison-new-taste",
        localSlug: "yuhkvdcho1-saison-new-taste",
      },
    },
  },
  {
    id: "halloween-contest-2021",
    // Tilda `parts` empty — Proposed news (contest).
    categoryId: "news",
    translations: {
      ru: {
        status: "published",
        title: "Выиграй ящик пива на Хеллоуин!",
        categoryLabel: "НОВОСТИ",
        publishedAt: "2021-10-26",
        productionPath:
          "/blog-all/tpost/l52cympd71-viigrai-yaschik-piva-na-hellouin",
        localSlug: "l52cympd71-viigrai-yaschik-piva-na-hellouin",
      },
      en: { status: "missing", title: "", categoryLabel: "", productionPath: "" },
    },
  },
  {
    id: "pumking-ale",
    categoryId: "releases",
    translations: {
      ru: { status: "missing", title: "", categoryLabel: "", productionPath: "" },
      en: {
        status: "published",
        title: "Pumking Ale: new taste of autumn",
        categoryLabel: "RELEASES",
        publishedAt: "2021-10-19",
        productionPath:
          "/en/blog-all/tpost/a8p7c969z1-pumking-ale-new-taste-of-autumn",
        localSlug: "a8p7c969z1-pumking-ale-new-taste-of-autumn",
      },
    },
  },
  {
    id: "vasiliy-klin-interview",
    categoryId: "interview",
    translations: {
      ru: {
        status: "published",
        title: "Интервью Василия Мищенко в преддверии КлинМайФест",
        categoryLabel: "ИНТЕРВЬЮ",
        publishedAt: "2021-08-27",
        productionPath:
          "/blog-all/tpost/hsri3ayv41-intervyu-vasiliya-mischenko-v-preddverii",
        localSlug: "hsri3ayv41-intervyu-vasiliya-mischenko-v-preddverii",
      },
      en: { status: "missing", title: "", categoryLabel: "", productionPath: "" },
    },
  },
  {
    id: "yammy-jammy",
    categoryId: "releases",
    translations: {
      ru: { status: "missing", title: "", categoryLabel: "", productionPath: "" },
      en: {
        status: "published",
        title: "Yammy Jammy: summer in a bottle",
        categoryLabel: "RELEASES",
        publishedAt: "2021-06-17",
        productionPath:
          "/en/blog-all/tpost/ffcmeohs71-yammy-jammy-summer-in-a-bottle",
        localSlug: "ffcmeohs71-yammy-jammy-summer-in-a-bottle",
      },
    },
  },
  {
    id: "rauhbier-label",
    // Tilda `parts` empty — Proposed library/GLOSSARY (label design story).
    categoryId: "library",
    translations: {
      ru: { status: "missing", title: "", categoryLabel: "", productionPath: "" },
      en: {
        status: "published",
        title: "Rauhbier: beer label from idea to implementation",
        categoryLabel: "GLOSSARY",
        publishedAt: "2021-06-08",
        productionPath:
          "/en/blog-all/tpost/exvllok0p1-rauhbier-beer-label-from-idea-to-impleme",
        localSlug: "exvllok0p1-rauhbier-beer-label-from-idea-to-impleme",
      },
    },
  },
  {
    id: "rauchbier",
    categoryId: "releases",
    translations: {
      ru: { status: "missing", title: "", categoryLabel: "", productionPath: "" },
      en: {
        status: "published",
        title: "Rauchbier: Spicy smoked beer with seeds of Guinea pepper",
        categoryLabel: "RELEASES",
        publishedAt: "2021-05-20",
        productionPath:
          "/en/blog-all/tpost/2jevneeme1-rauchbier-spicy-smoked-beer-with-seeds-o",
        localSlug: "2jevneeme1-rauchbier-spicy-smoked-beer-with-seeds-o",
      },
    },
  },
  {
    id: "oatmeal-stout",
    categoryId: "releases",
    translations: {
      ru: { status: "missing", title: "", categoryLabel: "", productionPath: "" },
      en: {
        status: "published",
        title: "Oatmeal Stout: a new look at the classic stout",
        categoryLabel: "RELEASES",
        publishedAt: "2021-05-19",
        productionPath:
          "/en/blog-all/tpost/775ra77481-oatmeal-stout-a-new-look-at-the-classic",
        localSlug: "775ra77481-oatmeal-stout-a-new-look-at-the-classic",
      },
    },
  },
  {
    id: "klin-may-fest-2021-postpone",
    categoryId: "events",
    translations: {
      ru: {
        status: "published",
        title: "Проведение КЛИН МАЙ ФЕСТ переносится на август!",
        categoryLabel: "МЕРОПРИЯТИЯ",
        publishedAt: "2021-05-13",
        productionPath:
          "/blog-all/tpost/0kau2y5h91-provedenie-klin-mai-fest-perenositsya-na",
        localSlug: "0kau2y5h91-provedenie-klin-mai-fest-perenositsya-na",
      },
      en: { status: "missing", title: "", categoryLabel: "", productionPath: "" },
    },
  },
  {
    id: "extra-virgin",
    categoryId: "releases",
    translations: {
      ru: { status: "missing", title: "", categoryLabel: "", productionPath: "" },
      en: {
        status: "published",
        title: "Extra Virgin: A new taste in the regular line-up",
        categoryLabel: "RELEASES",
        publishedAt: "2021-03-18",
        productionPath:
          "/en/blog-all/tpost/yuxd3l55l1-extra-virgin-a-new-taste-in-the-regular",
        localSlug: "yuxd3l55l1-extra-virgin-a-new-taste-in-the-regular",
      },
    },
  },
  {
    id: "coco-jungle",
    categoryId: "releases",
    translations: {
      ru: { status: "missing", title: "", categoryLabel: "", productionPath: "" },
      en: {
        status: "published",
        title: "The return of COCO JUNGLE",
        categoryLabel: "RELEASES",
        publishedAt: "2021-02-26",
        productionPath:
          "/en/blog-all/tpost/d4xo37du81-the-return-of-coco-jungle",
        localSlug: "d4xo37du81-the-return-of-coco-jungle",
      },
    },
  },
  {
    id: "people-in-beer-anora",
    categoryId: "interview",
    translations: {
      ru: {
        status: "published",
        title: "Люди в пиве: интервью Аноры Мищенко",
        categoryLabel: "ИНТЕРВЬЮ",
        publishedAt: "2021-01-19",
        productionPath:
          "/blog-all/tpost/5vvkbd3bd1-lyudi-v-pive-intervyu-anori-mischenko",
        localSlug: "5vvkbd3bd1-lyudi-v-pive-intervyu-anori-mischenko",
      },
      en: { status: "missing", title: "", categoryLabel: "", productionPath: "" },
    },
  },
  {
    id: "bowler-ipa-not-apa",
    categoryId: "news",
    translations: {
      ru: {
        status: "published",
        title: "Почему Bowler IPA не APA?",
        categoryLabel: "НОВОСТИ",
        publishedAt: "2020-12-22",
        productionPath:
          "/blog-all/tpost/323zbj0y71-pochemu-bowler-ipa-ne-apa",
        localSlug: "323zbj0y71-pochemu-bowler-ipa-ne-apa",
      },
      en: { status: "missing", title: "", categoryLabel: "", productionPath: "" },
    },
  },
  {
    id: "cooking-beef-nut-butter",
    categoryId: "recipes",
    translations: {
      ru: {
        status: "published",
        title: "Пивная кухня: Говядина под Nut Butter",
        categoryLabel: "ФУДПЕЙРИНГ / РЕЦЕПТЫ",
        publishedAt: "2020-12-18",
        productionPath:
          "/blog-all/tpost/902x4oy5k1-pivnaya-kuhnya-govyadina-pod-nut-butter",
        localSlug: "902x4oy5k1-pivnaya-kuhnya-govyadina-pod-nut-butter",
      },
      en: { status: "missing", title: "", categoryLabel: "", productionPath: "" },
    },
  },
  {
    id: "anora-podcast-interview",
    // Owner override 01.11.2026: interview (Tilda parts were news-only).
    categoryId: "interview",
    translations: {
      ru: {
        status: "published",
        title: "Интервью: Анора Мищенко, главный технолог Gletcher Brewery",
        categoryLabel: "ИНТЕРВЬЮ",
        publishedAt: "2020-12-11",
        productionPath:
          "/blog-all/tpost/f52uygiau1-intervyu-anora-mischenko-glavnii-tehnolo",
        localSlug: "f52uygiau1-intervyu-anora-mischenko-glavnii-tehnolo",
      },
      en: { status: "missing", title: "", categoryLabel: "", productionPath: "" },
    },
  },
  {
    id: "gzhanets-rouge",
    categoryId: "recipes",
    translations: {
      ru: {
        status: "published",
        title: "Гжанец: два согревающих рецепта с Rouge de Fleur",
        categoryLabel: "ФУДПЕЙРИНГ / РЕЦЕПТЫ",
        publishedAt: "2020-12-04",
        productionPath:
          "/blog-all/tpost/6ku96l8541-gzhanets-dva-sogrevayuschih-retsepta-s-r",
        localSlug: "6ku96l8541-gzhanets-dva-sogrevayuschih-retsepta-s-r",
      },
      en: { status: "missing", title: "", categoryLabel: "", productionPath: "" },
    },
  },
];

function isPublished(
  t: BlogPostTranslation | undefined,
): t is BlogPostTranslation {
  return Boolean(t && t.status === "published" && t.productionPath && t.title);
}

export function blogArticlePathname(
  slug: string,
  locale: PublishedLocale,
): string {
  const base = `/blog-all/tpost/${slug}`;
  return locale === DEFAULT_LOCALE ? base : `/${locale}${base}`;
}

/** Pathname for LocaleSwitch / Link (locale prefix added by next-intl). */
export function blogArticleLocalHref(slug: string): string {
  return `/blog-all/tpost/${slug}`;
}

export function getPostById(id: string): BlogPost | undefined {
  return BLOG_POSTS.find((post) => post.id === id);
}

export function resolveBlogArticle(
  locale: PublishedLocale,
  slug: string,
):
  | {
      post: BlogPost;
      translation: BlogPostTranslation;
      body: BlogArticleBody;
    }
  | undefined {
  const body = findArticleBodyBySlug(locale, slug);
  if (!body) return undefined;
  const post = getPostById(body.id);
  if (!post) return undefined;
  const translation = post.translations[locale];
  if (!isPublished(translation) || translation.localSlug !== slug) {
    return undefined;
  }
  return { post, translation, body };
}

/** Peer pathnames for published local bodies only. */
export function blogArticleLocaleHrefs(
  post: BlogPost,
): Partial<Record<PublishedLocale, string>> {
  const hrefs: Partial<Record<PublishedLocale, string>> = {};
  for (const locale of ["ru", "en"] as PublishedLocale[]) {
    const t = post.translations[locale];
    if (!isPublished(t) || !t.localSlug) continue;
    if (!getArticleBody(post.id, locale)) continue;
    hrefs[locale] = blogArticleLocalHref(t.localSlug);
  }
  return hrefs;
}

/**
 * Fallback when peer article is missing: listing pathname for next-intl `Link`
 * (locale prefix applied by the switcher via `locale={code}`).
 */
export function blogListingHref(): string {
  return "/blog";
}

export function getBlogListCards(locale: PublishedLocale): BlogListCard[] {
  const cards: BlogListCard[] = [];
  for (const post of BLOG_POSTS) {
    const t = post.translations[locale];
    if (!isPublished(t)) continue;
    const localBody = t.localSlug ? getArticleBody(post.id, locale) : undefined;
    const local = Boolean(localBody && t.localSlug);
    cards.push({
      id: post.id,
      categoryId: post.categoryId,
      categoryLabel: t.categoryLabel,
      title: t.title,
      publishedAt: t.publishedAt,
      dateLabel: formatBlogDate(t.publishedAt, locale),
      description: localBody?.description || undefined,
      cover: localBody?.cover,
      href: local
        ? blogArticleLocalHref(t.localSlug!)
        : `${PRODUCTION_ORIGIN}${t.productionPath}`,
      local,
    });
  }
  cards.sort((a, b) => {
    const da = a.publishedAt ?? "";
    const db = b.publishedAt ?? "";
    if (da && db) return db.localeCompare(da);
    if (da) return -1;
    if (db) return 1;
    return a.title.localeCompare(b.title);
  });
  return cards;
}

export function getLocalBlogStaticParams() {
  return listLocalArticleParams();
}

export function formatBlogDate(
  iso: string | undefined,
  locale: PublishedLocale,
): string | undefined {
  if (!iso) return undefined;
  // Accept `YYYY-MM-DD`, `YYYY-MM-DD HH:mm`, or ISO datetime.
  const day = iso.trim().slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) return undefined;
  const d = new Date(`${day}T12:00:00Z`);
  if (Number.isNaN(d.getTime())) return undefined;
  return new Intl.DateTimeFormat(locale === "en" ? "en-GB" : "ru-RU", {
    day: "2-digit",
    month: "2-digit",
  }).format(d);
}
