import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { PolicyPageView } from "@/components/policy/policy-page";
import { SiteShell } from "@/components/site-shell";
import { POLICY_PAGE, POLICY_PATH } from "@/content/policy";
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
    title: { absolute: POLICY_PAGE.metaTitle },
    description: POLICY_PAGE.metaDescription || undefined,
    alternates: {
      canonical: POLICY_PATH,
      languages: {
        ru: POLICY_PATH,
        "x-default": POLICY_PATH,
      },
    },
  };
}

export default async function PolicyPage({ params }: PageProps) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale) || !isPublishedLocale(locale)) {
    notFound();
  }
  if (locale !== DEFAULT_LOCALE) notFound();

  setRequestLocale(locale);

  return (
    <SiteShell
      localeHrefs={{
        ru: POLICY_PATH,
        en: "/",
      }}
    >
      <PolicyPageView />
    </SiteShell>
  );
}
