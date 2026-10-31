import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { SiteShell } from "@/components/site-shell";
import { HomeHero } from "@/components/home/home-hero";
import { HomeMoaBanner } from "@/components/home/home-moa-banner";
import { HomePromos } from "@/components/home/home-promos";
import { HomeToursCta } from "@/components/home/home-tours-cta";
import { HomeMenuGrid } from "@/components/home/home-menu-grid";
import { HomeBlog } from "@/components/home/home-blog";
import { HomeNewsletter } from "@/components/home/home-newsletter";
import { getHomeBlogTeasers } from "@/content/home";
import { HOME_MENU_CARDS } from "@/content/home-menu";
import {
  DEFAULT_LOCALE,
  isPublishedLocale,
  type PublishedLocale,
} from "@/i18n/locales";
import { routing } from "@/i18n/routing";

type HomePageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: HomePageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isPublishedLocale(locale)) return {};
  const t = await getTranslations({ locale, namespace: "meta" });
  const path = locale === DEFAULT_LOCALE ? "/" : `/${locale}`;
  return {
    title: {
      absolute: t("siteName"),
    },
    description: t("homeDescription"),
    alternates: {
      canonical: path,
      languages: {
        ru: "/",
        en: "/en",
        "x-default": "/",
      },
    },
  };
}

export default async function Home({ params }: HomePageProps) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale) || !isPublishedLocale(locale)) {
    notFound();
  }
  setRequestLocale(locale);

  const published = locale as PublishedLocale;
  const t = await getTranslations("home");
  const blog = getHomeBlogTeasers(published);

  const promoLabels = {
    promosAria: t("promosAria"),
    b2bTitle: t("b2bTitle"),
    b2bBullet1: t("b2bBullet1"),
    b2bBullet2: t("b2bBullet2"),
    b2bBullet3: t("b2bBullet3"),
    b2bCta: t("b2bCta"),
    mapTitleLine1: t("mapTitleLine1"),
    mapTitleLine2: t("mapTitleLine2"),
    mapBody: t("mapBody"),
    mapCta: t("mapCta"),
  };

  const toursLabels = {
    toursAria: t("toursAria"),
    titleStrong: t("toursTitleStrong"),
    titleRest: t("toursTitleRest"),
    point1: t("toursPoint1"),
    point2: t("toursPoint2"),
    point3: t("toursPoint3"),
    cta: t("toursCta"),
  };

  const menuLabels: Record<string, string> = {
    menuAria: t("menuAria"),
  };
  for (const card of HOME_MENU_CARDS) {
    menuLabels[card.titleKey] = t(card.titleKey);
    menuLabels[card.bodyKey] = t(card.bodyKey);
    menuLabels[card.ctaKey] = t(card.ctaKey);
  }

  return (
    <SiteShell>
      <HomeHero
        breweryLabel={t("brewery")}
        brandLabel={t("brand")}
        lead={t("lead")}
        catalogAria={t("heroCatalogAria")}
      />
      <HomeMoaBanner ariaLabel={t("moaBannerAria")} />
      <HomePromos locale={published} labels={promoLabels} />
      <HomeToursCta locale={published} labels={toursLabels} />
      <HomeMenuGrid locale={published} labels={menuLabels} />
      <HomeBlog title={t("blogTitle")} items={blog} />
      <HomeNewsletter
        locale={published}
        title={t("newsletterTitle")}
        lead={t("newsletterLead")}
        placeholder={t("newsletterPlaceholder")}
        submit={t("newsletterSubmit")}
        privacy={t("newsletterPrivacy")}
        privacyLinkLabel={t("newsletterPrivacyLink")}
        pendingNote={t("newsletterPending")}
        invalidNote={t("newsletterInvalid")}
      />
    </SiteShell>
  );
}
