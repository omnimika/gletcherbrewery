import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { BlogExpansion } from "@/components/blog/blog-expansion";
import { SiteShell } from "@/components/site-shell";
import { blogListingHref } from "@/content/blog";
import { EXPANSION_PAGE } from "@/content/blog/expansion";
import {
  DEFAULT_LOCALE,
  isPublishedLocale,
} from "@/i18n/locales";
import { routing } from "@/i18n/routing";

type ExpansionPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: ExpansionPageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isPublishedLocale(locale) || locale !== DEFAULT_LOCALE) return {};
  return {
    title: { absolute: `${EXPANSION_PAGE.title} | Пивоварня Глетчер` },
    description: EXPANSION_PAGE.description,
    alternates: {
      canonical: EXPANSION_PAGE.path,
      languages: {
        ru: EXPANSION_PAGE.path,
        "x-default": EXPANSION_PAGE.path,
      },
    },
  };
}

export default async function BlogExpansionPage({
  params,
}: ExpansionPageProps) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale) || !isPublishedLocale(locale)) {
    notFound();
  }
  // EN Tilda page unpublished; feed peer inactive — RU-only.
  if (locale !== DEFAULT_LOCALE) notFound();

  setRequestLocale(locale);
  const t = await getTranslations("blog");

  return (
    <SiteShell
      localeHrefs={{
        ru: EXPANSION_PAGE.path,
        en: { fallback: blogListingHref() },
      }}
    >
      <BlogExpansion backLabel={t("backToBlog")} />
    </SiteShell>
  );
}
