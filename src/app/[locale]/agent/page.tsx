import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { AgentPageView } from "@/components/agent/agent-page";
import { SiteShell } from "@/components/site-shell";
import { AGENT_PAGE, AGENT_PATH } from "@/content/agent";
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
    title: { absolute: AGENT_PAGE.metaTitle },
    description: AGENT_PAGE.metaDescription,
    alternates: {
      canonical: AGENT_PATH,
      languages: {
        ru: AGENT_PATH,
        "x-default": AGENT_PATH,
      },
    },
  };
}

export default async function AgentPage({ params }: PageProps) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale) || !isPublishedLocale(locale)) {
    notFound();
  }
  // Source RU-only (no EN peer Confirmed).
  if (locale !== DEFAULT_LOCALE) notFound();

  setRequestLocale(locale);

  return (
    <SiteShell
      hideFooter
      localeHrefs={{
        ru: AGENT_PATH,
        en: "/",
      }}
    >
      <AgentPageView />
    </SiteShell>
  );
}
