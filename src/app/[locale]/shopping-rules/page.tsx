import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { ShoppingRulesPageView } from "@/components/shopping-rules/shopping-rules-page";
import { SiteShell } from "@/components/site-shell";
import {
  SHOPPING_RULES_PAGE,
  SHOPPING_RULES_PATH,
} from "@/content/shopping-rules";
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
    title: { absolute: SHOPPING_RULES_PAGE.metaTitle },
    description: SHOPPING_RULES_PAGE.metaDescription || undefined,
    alternates: {
      canonical: SHOPPING_RULES_PATH,
      languages: {
        ru: SHOPPING_RULES_PATH,
        "x-default": SHOPPING_RULES_PATH,
      },
    },
  };
}

export default async function ShoppingRulesPage({ params }: PageProps) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale) || !isPublishedLocale(locale)) {
    notFound();
  }
  // Source has no published EN peer (href to /en/shopping-rules is Open).
  if (locale !== DEFAULT_LOCALE) notFound();

  setRequestLocale(locale);

  return (
    <SiteShell
      localeHrefs={{
        ru: SHOPPING_RULES_PATH,
        en: "/",
      }}
    >
      <ShoppingRulesPageView />
    </SiteShell>
  );
}
