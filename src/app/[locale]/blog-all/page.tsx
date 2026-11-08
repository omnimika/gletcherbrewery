import { permanentRedirect } from "next/navigation";
import { hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { DEFAULT_LOCALE, isPublishedLocale } from "@/i18n/locales";
import { routing } from "@/i18n/routing";

type PageProps = {
  params: Promise<{ locale: string }>;
};

/**
 * Legacy production archive listing `/blog-all` (+ `/en/blog-all`).
 * Local listing lives at `/blog`; articles at `/blog/{YYYY-MM-DD-…}`.
 * Next.js `permanentRedirect` emits HTTP **308** (not 301).
 */
export default async function BlogAllListingRedirect({ params }: PageProps) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale) || !isPublishedLocale(locale)) {
    permanentRedirect("/blog");
  }

  setRequestLocale(locale);
  const dest = locale === DEFAULT_LOCALE ? "/blog" : `/${locale}/blog`;
  permanentRedirect(dest);
}
