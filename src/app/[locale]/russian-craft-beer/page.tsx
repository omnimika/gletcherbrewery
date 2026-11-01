import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { PartnershipPageView } from "@/components/partnership/partnership-page";
import { SiteShell } from "@/components/site-shell";
import {
  RUSSIAN_CRAFT_BEER,
  RUSSIAN_CRAFT_BEER_PATH,
} from "@/content/russian-craft-beer";
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
    title: { absolute: RUSSIAN_CRAFT_BEER.metaTitle },
    description: RUSSIAN_CRAFT_BEER.metaDescription,
    robots: { index: false, follow: true },
    alternates: {
      canonical: RUSSIAN_CRAFT_BEER_PATH,
      languages: {
        ru: RUSSIAN_CRAFT_BEER_PATH,
        "x-default": RUSSIAN_CRAFT_BEER_PATH,
      },
    },
  };
}

export default async function RussianCraftBeerPage({ params }: PageProps) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale) || !isPublishedLocale(locale)) {
    notFound();
  }
  // Source has no EN peer; production home EN also targets this RU URL.
  if (locale !== DEFAULT_LOCALE) notFound();

  setRequestLocale(locale);

  return (
    <SiteShell
      localeHrefs={{
        ru: RUSSIAN_CRAFT_BEER_PATH,
        // No EN page — switcher stays on RU destination.
        en: RUSSIAN_CRAFT_BEER_PATH,
      }}
    >
      <PartnershipPageView copy={RUSSIAN_CRAFT_BEER} />
    </SiteShell>
  );
}
