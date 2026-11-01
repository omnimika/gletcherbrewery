import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { BlogArticle } from "@/components/blog/blog-article";
import { SiteShell } from "@/components/site-shell";
import {
  blogArticleLocaleHrefs,
  blogArticlePathname,
  blogListingHref,
  getLocalBlogStaticParams,
  resolveBlogArticle,
} from "@/content/blog";
import {
  DEFAULT_LOCALE,
  type PublishedLocale,
  isPublishedLocale,
} from "@/i18n/locales";
import { routing } from "@/i18n/routing";

type ArticlePageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

export function generateStaticParams() {
  return getLocalBlogStaticParams();
}

export async function generateMetadata({
  params,
}: ArticlePageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isPublishedLocale(locale)) return {};
  const resolved = resolveBlogArticle(locale, slug);
  if (!resolved) return {};

  const { post, body } = resolved;
  const canonical = blogArticlePathname(body.slug, locale);
  const peers = blogArticleLocaleHrefs(post);
  const languages: Record<string, string> = {};
  for (const code of Object.keys(peers) as PublishedLocale[]) {
    const path = peers[code];
    if (!path) continue;
    languages[code] = blogArticlePathname(
      path.replace(/^\/blog-all\/tpost\//, ""),
      code,
    );
  }
  languages["x-default"] = peers.ru
    ? blogArticlePathname(
        peers.ru.replace(/^\/blog-all\/tpost\//, ""),
        DEFAULT_LOCALE,
      )
    : canonical;

  return {
    title: { absolute: body.title },
    description: body.description,
    alternates: {
      canonical,
      languages,
    },
  };
}

export default async function BlogArticlePage({ params }: ArticlePageProps) {
  const { locale, slug } = await params;
  if (!hasLocale(routing.locales, locale) || !isPublishedLocale(locale)) {
    notFound();
  }
  setRequestLocale(locale);

  const published = locale as PublishedLocale;
  const resolved = resolveBlogArticle(published, slug);
  if (!resolved) notFound();

  const { post, translation, body } = resolved;
  const t = await getTranslations("blog");

  const peers = blogArticleLocaleHrefs(post);
  // Missing peer → listing for that locale (do not invent article URL).
  const localeHrefs: Partial<Record<PublishedLocale, string>> = {
    ru: peers.ru ?? blogListingHref(),
    en: peers.en ?? blogListingHref(),
  };

  return (
    <SiteShell localeHrefs={localeHrefs}>
      <BlogArticle
        article={body}
        categoryLabel={translation.categoryLabel}
        publishedAt={body.publishedAt || translation.publishedAt}
        backHref="/blog"
        backLabel={t("backToBlog")}
      />
    </SiteShell>
  );
}
