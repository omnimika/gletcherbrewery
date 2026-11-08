import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { AboutPageView } from "@/components/about/about-page";
import { SiteShell } from "@/components/site-shell";
import { ABOUT_PAGE, ABOUT_PATH } from "@/content/about";
import { DEFAULT_LOCALE, isPublishedLocale } from "@/i18n/locales";
import { routing } from "@/i18n/routing";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isPublishedLocale(locale) || locale !== DEFAULT_LOCALE) return {};
  return {
    title: { absolute: ABOUT_PAGE.metaTitle },
    description: ABOUT_PAGE.metaDescription,
    robots: ABOUT_PAGE.robots,
    alternates: {
      canonical: ABOUT_PATH,
      languages: {
        ru: ABOUT_PATH,
        "x-default": ABOUT_PATH,
      },
    },
  };
}

export default async function AboutPage({ params }: PageProps) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale) || !isPublishedLocale(locale)) {
    notFound();
  }
  // Source RU-only; EN peer Open — do not invent /en/about.
  if (locale !== DEFAULT_LOCALE) notFound();

  setRequestLocale(locale);

  return (
    <SiteShell
      localeHrefs={{
        ru: ABOUT_PATH,
        en: { fallback: "/" },
      }}
    >
      <AboutPageView />
    </SiteShell>
  );
}
