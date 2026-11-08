import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { PartnershipPageView } from "@/components/partnership/partnership-page";
import { SiteShell } from "@/components/site-shell";
import {
  getPartnershipCopy,
  PARTNERSHIP_LOCALE_HREFS,
} from "@/content/partnership";
import { type PublishedLocale, isPublishedLocale } from "@/i18n/locales";
import { routing } from "@/i18n/routing";

type PartnershipPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: PartnershipPageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isPublishedLocale(locale)) return {};
  const copy = getPartnershipCopy(locale);
  return {
    title: { absolute: copy.metaTitle },
    description: copy.metaDescription,
    alternates: {
      canonical: copy.path,
      languages: {
        ru: PARTNERSHIP_LOCALE_HREFS.ru,
        en: PARTNERSHIP_LOCALE_HREFS.en,
        "x-default": PARTNERSHIP_LOCALE_HREFS.ru,
      },
    },
  };
}

export default async function PartnershipPage({
  params,
}: PartnershipPageProps) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale) || !isPublishedLocale(locale)) {
    notFound();
  }
  setRequestLocale(locale);

  const published = locale as PublishedLocale;
  const copy = getPartnershipCopy(published);

  return (
    <SiteShell
      localeHrefs={{
        ru: PARTNERSHIP_LOCALE_HREFS.ru,
        en: PARTNERSHIP_LOCALE_HREFS.en,
      }}
    >
      <PartnershipPageView copy={copy} />
    </SiteShell>
  );
}
