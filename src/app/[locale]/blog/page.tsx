import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { BlogListing } from "@/components/blog/blog-listing";
import { HomeNewsletter } from "@/components/home/home-newsletter";
import { SiteShell } from "@/components/site-shell";
import { getBlogListCards } from "@/content/blog";
import {
  DEFAULT_LOCALE,
  type PublishedLocale,
  isPublishedLocale,
} from "@/i18n/locales";
import { routing } from "@/i18n/routing";

type BlogPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: BlogPageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isPublishedLocale(locale)) return {};
  const t = await getTranslations({ locale, namespace: "meta" });
  const path = locale === DEFAULT_LOCALE ? "/blog" : `/${locale}/blog`;
  return {
    title: { absolute: t("blogTitle") },
    description: t("blogDescription"),
    alternates: {
      canonical: path,
      languages: {
        ru: "/blog",
        en: "/en/blog",
        "x-default": "/blog",
      },
    },
  };
}

export default async function BlogListingPage({ params }: BlogPageProps) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale) || !isPublishedLocale(locale)) {
    notFound();
  }
  setRequestLocale(locale);

  const published = locale as PublishedLocale;
  const t = await getTranslations("blog");
  const tHome = await getTranslations("home");
  const items = getBlogListCards(published);

  return (
    <SiteShell>
      <BlogListing
        title={t("title")}
        lead={t("lead")}
        empty={t("empty")}
        items={items}
      />
      <HomeNewsletter
        locale={published}
        title={tHome("newsletterTitle")}
        lead={tHome("newsletterLead")}
        placeholder={tHome("newsletterPlaceholder")}
        submit={tHome("newsletterSubmit")}
        privacy={tHome("newsletterPrivacy")}
        privacyLinkLabel={tHome("newsletterPrivacyLink")}
        pendingNote={tHome("newsletterPending")}
        invalidNote={tHome("newsletterInvalid")}
      />
    </SiteShell>
  );
}
