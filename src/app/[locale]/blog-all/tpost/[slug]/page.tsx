import { permanentRedirect } from "next/navigation";
import { hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { blogArticlePathname } from "@/content/blog";
import slugRedirects from "@/content/blog/slug-redirects.json";
import {
  isPublishedLocale,
  type PublishedLocale,
} from "@/i18n/locales";
import { routing } from "@/i18n/routing";

type PageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

/**
 * Legacy Tilda article URLs `/blog-all/tpost/{hash-slug}`.
 * Permanent redirect (308) → `/blog/YYYY-MM-DD-{descriptive-slug}`.
 */
export default async function LegacyBlogTpostRedirect({ params }: PageProps) {
  const { locale, slug } = await params;
  if (!hasLocale(routing.locales, locale) || !isPublishedLocale(locale)) {
    permanentRedirect("/blog");
  }

  setRequestLocale(locale);
  const map = slugRedirects as Record<string, string>;
  const nextSlug = map[slug] ?? slug;
  permanentRedirect(blogArticlePathname(nextSlug, locale as PublishedLocale));
}

export function generateStaticParams() {
  const map = slugRedirects as Record<string, string>;
  const params: { locale: string; slug: string }[] = [];
  for (const oldSlug of Object.keys(map)) {
    for (const locale of routing.locales) {
      if (!isPublishedLocale(locale)) continue;
      params.push({ locale, slug: oldSlug });
    }
  }
  return params;
}
