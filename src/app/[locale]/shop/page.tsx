import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { ShopPageView } from "@/components/shop/shop-page";
import { SiteShell } from "@/components/site-shell";
import { SHOP_PAGE, SHOP_PATH } from "@/content/shop";
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
    title: { absolute: SHOP_PAGE.metaTitle },
    description: SHOP_PAGE.metaDescription,
    alternates: {
      canonical: SHOP_PATH,
      languages: {
        ru: SHOP_PATH,
        "x-default": SHOP_PATH,
      },
    },
  };
}

export default async function ShopPage({ params }: PageProps) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale) || !isPublishedLocale(locale)) {
    notFound();
  }
  // EN peer `en/shop` exists in Tilda but is unpublished (Observed 04.11.2026).
  if (locale !== DEFAULT_LOCALE) notFound();

  setRequestLocale(locale);

  return (
    <SiteShell
      localeHrefs={{
        ru: SHOP_PATH,
        en: { fallback: "/" },
      }}
    >
      <ShopPageView />
    </SiteShell>
  );
}
