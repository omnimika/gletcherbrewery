import type { PublishedLocale } from "@/i18n/locales";
import type { BlogArticleBody } from "@/content/blog/blocks";
import beerPizzaEn from "@/content/blog/articles/beer-pizza-en.json";
import beerPizzaRu from "@/content/blog/articles/beer-pizza-ru.json";
import homebrewRu from "@/content/blog/articles/homebrew-ru.json";

/**
 * Local article bodies for sprint 3. Keys: `${id}:${locale}`.
 * Posts without an entry keep production tpost hrefs on the listing.
 */
const ARTICLES: Record<string, BlogArticleBody> = {
  "beer-pizza:ru": beerPizzaRu as BlogArticleBody,
  "beer-pizza:en": beerPizzaEn as BlogArticleBody,
  "homebrew-day:ru": homebrewRu as BlogArticleBody,
};

export function articleBodyKey(id: string, locale: PublishedLocale): string {
  return `${id}:${locale}`;
}

export function getArticleBody(
  id: string,
  locale: PublishedLocale,
): BlogArticleBody | undefined {
  return ARTICLES[articleBodyKey(id, locale)];
}

export function listLocalArticleParams(): {
  locale: PublishedLocale;
  slug: string;
}[] {
  return Object.values(ARTICLES).map((article) => ({
    locale: article.locale as PublishedLocale,
    slug: article.slug,
  }));
}

export function findArticleBodyBySlug(
  locale: PublishedLocale,
  slug: string,
): BlogArticleBody | undefined {
  return Object.values(ARTICLES).find(
    (article) => article.locale === locale && article.slug === slug,
  );
}
