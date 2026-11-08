import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { HorecaPageView } from "@/components/horeca/horeca-page";
import { SiteShell } from "@/components/site-shell";
import { HORECA_PAGE, HORECA_PATH } from "@/content/horeca";
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
    title: { absolute: HORECA_PAGE.metaTitle },
    description: HORECA_PAGE.metaDescription,
    alternates: {
      canonical: HORECA_PATH,
      languages: {
        ru: HORECA_PATH,
        "x-default": HORECA_PATH,
      },
    },
  };
}

export default async function HorecaPage({ params }: PageProps) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale) || !isPublishedLocale(locale)) {
    notFound();
  }
  if (locale !== DEFAULT_LOCALE) notFound();

  setRequestLocale(locale);

  return (
    <SiteShell
      localeHrefs={{
        ru: HORECA_PATH,
        // No EN peer — published home fallback; do not transfer page hash.
        en: { fallback: "/" },
      }}
    >
      <HorecaPageView />
    </SiteShell>
  );
}
