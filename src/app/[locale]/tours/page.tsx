import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { SiteShell } from "@/components/site-shell";
import { ToursPageView } from "@/components/tours/tours-page";
import {
  getToursCopy,
  TOURS_LOCALE_HREFS,
  TOURS_PATH,
  TOURS_PATH_EN,
} from "@/content/tours";
import { type PublishedLocale, isPublishedLocale } from "@/i18n/locales";
import { routing } from "@/i18n/routing";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isPublishedLocale(locale)) return {};
  const copy = getToursCopy(locale);
  return {
    title: { absolute: copy.metaTitle },
    description: copy.metaDescription,
    alternates: {
      canonical: copy.path,
      languages: {
        ru: TOURS_PATH,
        en: TOURS_PATH_EN,
        "x-default": TOURS_PATH,
      },
    },
  };
}

export default async function ToursPage({ params }: PageProps) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale) || !isPublishedLocale(locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const published = locale as PublishedLocale;
  const copy = getToursCopy(published);

  return (
    <SiteShell
      localeHrefs={{
        ru: TOURS_LOCALE_HREFS.ru,
        en: TOURS_LOCALE_HREFS.en,
      }}
    >
      <ToursPageView copy={copy} />
    </SiteShell>
  );
}
