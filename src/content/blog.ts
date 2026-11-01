import type { PublishedLocale } from "@/i18n/locales";
import { DEFAULT_LOCALE } from "@/i18n/locales";
import { PRODUCTION_ORIGIN } from "@/lib/site-links";
import {
  findArticleBodyBySlug,
  getArticleBody,
  listLocalArticleParams,
} from "@/content/blog/articles";
import type { BlogArticleBody } from "@/content/blog/blocks";

/**
 * Blog fixtures — listing + local article bodies (sprint 2–3).
 * See docs/discovery/BLOG_CONTENT_CONTRACT.md and docs/adr/0005-cms.md.
 */

export type BlogCategoryId = "library" | "news" | "events";

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
        publishedAt: "2025-09-23",
        productionPath:
          "/blog-all/tpost/cf46mag0n1-afisha-gletcher-brewery-winepark-polyana",
      },
      en: { status: "missing", title: "", categoryLabel: "", productionPath: "" },
    },
  },
  {
    id: "moa-na",
    categoryId: "library",
    translations: {
      en: {
        status: "published",
        title: "Milk of Amnesia non-alcoholic",
        categoryLabel: "LIBRARY",
        productionPath:
          "/en/blog-all/tpost/za6t88elj1-milk-of-amnesia-non-alcoholic",
      },
      ru: { status: "missing", title: "", categoryLabel: "", productionPath: "" },
    },
  },
  {
    id: "aging",
    categoryId: "library",
    translations: {
      en: {
        status: "published",
        title: "Gletcher Aging: aged to perfection",
        categoryLabel: "LIBRARY",
        productionPath:
          "/en/blog-all/tpost/93l8iii9y1-gletcher-aging-aged-to-perfection",
      },
      ru: { status: "missing", title: "", categoryLabel: "", productionPath: "" },
    },
  },
  {
    id: "tour-de-grapefruit",
    categoryId: "news",
    translations: {
      en: {
        status: "published",
        title: "Tour de Grapefruit: citrus wheat ale",
        categoryLabel: "NEWS",
        productionPath:
          "/en/blog-all/tpost/9i3ig0g2r1-tour-de-grapefruit-citrus-wheat-ale",
      },
      ru: { status: "missing", title: "", categoryLabel: "", productionPath: "" },
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

/** Production full-archive listing (not migrated). */
export function blogArchiveHref(locale: PublishedLocale): string {
  return locale === "en"
    ? `${PRODUCTION_ORIGIN}/en/blog-all`
    : `${PRODUCTION_ORIGIN}/blog-all`;
}

export function formatBlogDate(
  iso: string | undefined,
  locale: PublishedLocale,
): string | undefined {
  if (!iso) return undefined;
  const d = new Date(`${iso}T12:00:00Z`);
  if (Number.isNaN(d.getTime())) return undefined;
  return new Intl.DateTimeFormat(locale === "en" ? "en-GB" : "ru-RU", {
    day: "2-digit",
    month: "2-digit",
  }).format(d);
}
