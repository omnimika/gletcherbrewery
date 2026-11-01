import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { ContactsPageView } from "@/components/contacts/contacts-page";
import { SiteShell } from "@/components/site-shell";
import { CONTACTS_PAGE, CONTACTS_PATH } from "@/content/contacts";
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
    title: { absolute: CONTACTS_PAGE.metaTitle },
    description: CONTACTS_PAGE.metaDescription,
    alternates: {
      canonical: CONTACTS_PATH,
      languages: {
        ru: CONTACTS_PATH,
        "x-default": CONTACTS_PATH,
      },
    },
  };
}

export default async function ContactsPage({ params }: PageProps) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale) || !isPublishedLocale(locale)) {
    notFound();
  }
  // EN peer page exists in Tilda but is unpublished — RU-only for now.
  if (locale !== DEFAULT_LOCALE) notFound();

  setRequestLocale(locale);

  return (
    <SiteShell
      localeHrefs={{
        ru: CONTACTS_PATH,
        en: "/",
      }}
    >
      <ContactsPageView />
    </SiteShell>
  );
}
