import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { LeadForm } from "@/components/catalog/lead-form";
import { ProductGallery } from "@/components/catalog/product-gallery";
import { SiteShell } from "@/components/site-shell";
import { getCatalogCards } from "@/content/catalog";
import {
  DEFAULT_LOCALE,
  type PublishedLocale,
  isPublishedLocale,
} from "@/i18n/locales";
import { routing } from "@/i18n/routing";

type BeerPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: BeerPageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isPublishedLocale(locale)) return {};
  const t = await getTranslations({ locale, namespace: "meta" });
  const path = locale === DEFAULT_LOCALE ? "/beer" : `/${locale}/beer`;
  return {
    title: { absolute: t("beerTitle") },
    description: t("beerDescription"),
    alternates: {
      canonical: path,
      languages: {
        ru: "/beer",
        en: "/en/beer",
        "x-default": "/beer",
      },
    },
  };
}

export default async function BeerCatalogPage({ params }: BeerPageProps) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale) || !isPublishedLocale(locale)) {
    notFound();
  }
  setRequestLocale(locale);

  const t = await getTranslations("beer");
  const cards = getCatalogCards(locale as PublishedLocale);

  return (
    <SiteShell>
      {/* Hero ≈ Tilda ZB 735254792; gallery ≈ ZB 802918687 (80svh) → form below fold. */}
      <section className="mx-auto w-full max-w-[960px] px-6 pt-6 pb-3 text-center sm:pt-8 sm:pb-4">
        <p className="animate-hero-rise text-xs font-semibold tracking-[0.22em] text-gletcher-navy/70 uppercase sm:text-sm">
          {t("eyebrow")}
        </p>
        <h1 className="font-display animate-hero-rise mt-3 text-[clamp(2rem,6.5vw,4.25rem)] text-gletcher-navy">
          {t("title")}
        </h1>
        <p
          className="animate-hero-rise mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-gletcher-navy/80 uppercase sm:text-base"
          style={{ animationDelay: "80ms" }}
        >
          {t("subtitle")}
        </p>
      </section>

      <ProductGallery cards={cards} />
      <LeadForm />
    </SiteShell>
  );
}
