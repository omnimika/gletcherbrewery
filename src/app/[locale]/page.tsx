import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { SiteShell } from "@/components/site-shell";
import { HomeHero } from "@/components/home/home-hero";
import { HomePromos } from "@/components/home/home-promos";
import { HomeFeatures } from "@/components/home/home-features";
import { HomeBlog } from "@/components/home/home-blog";
import { HomeNewsletter } from "@/components/home/home-newsletter";
import { getHomeBlogTeasers } from "@/content/home";
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
    promoEquipment: t("promoEquipment"),
    promoDistribution: t("promoDistribution"),
    promoNearby: t("promoNearby"),
  };

  const featureLabels = {
    featuresAria: t("featuresAria"),
    featureMapTitle: t("featureMapTitle"),
    featureMapBody: t("featureMapBody"),
    featureMapCta: t("featureMapCta"),
    featureB2bTitle: t("featureB2bTitle"),
    featureB2bBody: t("featureB2bBody"),
    featureB2bCta: t("featureB2bCta"),
    featureShopTitle: t("featureShopTitle"),
    featureShopBody: t("featureShopBody"),
    featureShopCta: t("featureShopCta"),
    featureToursTitle: t("featureToursTitle"),
    featureToursBody: t("featureToursBody"),
    featureToursCta: t("featureToursCta"),
    featureCatalogTitle: t("featureCatalogTitle"),
    featureCatalogBody: t("featureCatalogBody"),
    featureCatalogCta: t("featureCatalogCta"),
    featureBlogTitle: t("featureBlogTitle"),
    featureBlogBody: t("featureBlogBody"),
    featureBlogCta: t("featureBlogCta"),
  };

  return (
    <SiteShell>
      <HomeHero
        breweryLabel={t("brewery")}
        brandLabel={t("brand")}
        lead={t("lead")}
        catalogAria={t("heroCatalogAria")}
      />
      <HomePromos locale={published} labels={promoLabels} />
      <HomeFeatures locale={published} labels={featureLabels} />
      <HomeBlog title={t("blogTitle")} items={blog} />
      <HomeNewsletter
        title={t("newsletterTitle")}
        lead={t("newsletterLead")}
        placeholder={t("newsletterPlaceholder")}
        submit={t("newsletterSubmit")}
        pendingNote={t("newsletterPending")}
      />
    </SiteShell>
  );
}
