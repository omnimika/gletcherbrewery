import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { SalesMap } from "@/components/map/sales-map";
import { SiteShell } from "@/components/site-shell";
import {
  getMapCopy,
  MAP_LOCALE_HREFS,
  MAP_PATH,
  MAP_PATH_EN,
} from "@/content/map";
import { type PublishedLocale, isPublishedLocale } from "@/i18n/locales";
import { routing } from "@/i18n/routing";
import { getDb } from "@/server/db/client";
import { loadPublicMapAssortment } from "@/server/retail/public-map-chains";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isPublishedLocale(locale)) return {};
  const copy = getMapCopy(locale);
  return {
    title: { absolute: copy.metaTitle },
    description: copy.metaDescription,
    alternates: {
      canonical: copy.path,
      languages: {
        ru: MAP_PATH,
        en: MAP_PATH_EN,
        "x-default": MAP_PATH,
      },
    },
  };
}

export default async function MapPage({ params }: PageProps) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale) || !isPublishedLocale(locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const published = locale as PublishedLocale;
  const copy = getMapCopy(published);
  const accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN?.trim() || undefined;

  let db = null;
  try {
    db = getDb();
  } catch {
    db = null;
  }
  const publicAssortment = await loadPublicMapAssortment(db);

  return (
    <SiteShell
      localeHrefs={{
        ru: MAP_LOCALE_HREFS.ru,
        en: MAP_LOCALE_HREFS.en,
      }}
    >
      <SalesMap
        copy={copy}
        accessToken={accessToken}
        chainTitlesWithAssortment={publicAssortment.chainTitles}
        beersByChain={publicAssortment.beersByChain}
      />
    </SiteShell>
  );
}
