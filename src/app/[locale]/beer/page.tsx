import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { LeadForm } from "@/components/catalog/lead-form";
import { ProductGallery } from "@/components/catalog/product-gallery";
import { Container, SectionFrame } from "@/components/layout";
import { DocumentProximitySnap } from "@/components/motion/document-proximity-snap";
import { Reveal } from "@/components/motion/reveal";
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

/**
 * Catalog `/beer` — DS-3 shell: intro (content) + gallery screen slide + lead.
 * Gallery carousel behaviour (ZB `802918687`) preserved inside `#catalog`.
 */
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
      <DocumentProximitySnap />

      <SectionFrame
        id="catalog-intro"
        mode="banner"
        tone="ice"
        snap
        aria-labelledby="catalog-title"
      >
        <Container className="text-center">
          <Reveal>
            <p className="text-xs font-semibold tracking-[0.22em] text-gletcher-navy/70 uppercase sm:text-sm">
              {t("eyebrow")}
            </p>
            <h1
              id="catalog-title"
              className="font-display mt-3 text-[clamp(2rem,6.5vw,4.25rem)] text-gletcher-navy"
            >
              {t("title")}
            </h1>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-gletcher-navy/80 uppercase sm:text-base">
              {t("subtitle")}
            </p>
          </Reveal>
        </Container>
      </SectionFrame>

      <SectionFrame
        id="catalog"
        mode="screen"
        tone="ice"
        snap
        aria-label={t("title")}
        className="!py-0"
      >
        <div className="flex min-h-0 flex-1 flex-col justify-center">
          <ProductGallery cards={cards} />
        </div>
      </SectionFrame>

      <LeadForm />
    </SiteShell>
  );
}
