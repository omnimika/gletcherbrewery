import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { DocumentProximitySnap } from "@/components/motion/document-proximity-snap";
import { SiteShell } from "@/components/site-shell";
import { ProductHero } from "@/components/product/product-hero";
import { ProductDetail } from "@/components/product/product-detail";
import { ProductRelated } from "@/components/product/product-related";
import { SectionFrame } from "@/components/layout";
import {
  getCatalogCards,
  isTranslationPublished,
  pickCopy,
  productAlternates,
  productPathname,
  productPublicPath,
  resolveProduct,
} from "@/content/catalog";
import { getProductMedia } from "@/content/product-media";
import {
  DEFAULT_LOCALE,
  type LocaleHrefs,
  type PublishedLocale,
  isPublishedLocale,
} from "@/i18n/locales";
import { routing } from "@/i18n/routing";

type ProductPageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateStaticParams() {
  const params: { locale: string; slug: string }[] = [];
  for (const locale of routing.locales) {
    if (!isPublishedLocale(locale)) continue;
    for (const card of getCatalogCards(locale)) {
      params.push({ locale, slug: card.slug });
    }
  }
  return params;
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isPublishedLocale(locale)) return {};
  const resolved = resolveProduct(locale, slug);
  if (!resolved || !isTranslationPublished(resolved.product, locale)) {
    return {};
  }
  const { product } = resolved;
  const title = pickCopy(product, locale, "title");
  const description = pickCopy(product, locale, "taste");
  const canonical = productPublicPath(product, locale) ?? undefined;
  const languages: Record<string, string> = { "x-default": "/beer/" };
  for (const alt of productAlternates(product)) {
    languages[alt.locale] = alt.href;
    if (alt.locale === DEFAULT_LOCALE) {
      languages["x-default"] = alt.href;
    }
  }
  return {
    title,
    description,
    alternates: { canonical, languages },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { locale, slug } = await params;
  if (!hasLocale(routing.locales, locale) || !isPublishedLocale(locale)) {
    notFound();
  }
  setRequestLocale(locale);

  const resolved = resolveProduct(locale, slug);
  if (!resolved) notFound();

  const { product, matchedLocale } = resolved;

  if (!isTranslationPublished(product, locale)) {
    notFound();
  }

  const canonicalSlug = product.translations[locale]?.slug;
  if (!canonicalSlug) notFound();

  // Wrong-locale slug or alias → permanent redirect to canonical for this locale.
  // Next.js `permanentRedirect` emits HTTP 308 (permanent); accepted for SEO canon.
  if (matchedLocale !== locale || slug !== canonicalSlug) {
    const dest =
      locale === DEFAULT_LOCALE
        ? `/beer/${canonicalSlug}`
        : `/${locale}/beer/${canonicalSlug}`;
    permanentRedirect(dest);
  }

  const tProduct = await getTranslations("product");
  const tFooter = await getTranslations("footer");

  const title = pickCopy(product, locale, "title");
  const taste = pickCopy(product, locale, "taste");
  const about = pickCopy(product, locale, "about");
  const food = pickCopy(product, locale, "foodPairing");
  const fermentation = pickCopy(product, locale, "fermentation");
  const media = getProductMedia(product.id);

  const related = getCatalogCards(locale as PublishedLocale)
    .filter((c) => c.id !== product.id)
    .slice(0, 12);

  const localeHrefs: LocaleHrefs = {};
  for (const code of ["ru", "en"] as const) {
    const path = productPathname(product, code);
    if (path) localeHrefs[code] = path;
    else localeHrefs[code] = null;
  }

  return (
    <SiteShell localeHrefs={localeHrefs}>
      <DocumentProximitySnap />
      <article>
        <ProductHero
          title={title}
          coverSrc={media.cover}
          logoSrc={media.logo}
          bottleSrc={product.image || undefined}
          coverHasWordmark={media.coverHasWordmark}
        />

        <ProductDetail
          locale={locale as PublishedLocale}
          title={title}
          taste={taste}
          about={about}
          foodPairing={food}
          fermentation={fermentation}
          bottleSrc={product.image || undefined}
          glassSrc={media.glass}
          specs={{
            abv: product.specs.abv,
            og: product.specs.og,
            ibu: product.specs.ibu,
            style: product.specs.style,
            malts: product.specs.malts,
            hops: product.specs.hops,
            bottleVol: product.specs.bottleVol,
            kegVol: product.specs.kegVol,
          }}
          labels={{
            expect: tProduct("expect"),
            aboutTaste: tProduct("aboutTaste"),
            pairing: tProduct("pairing"),
            strength: tProduct("strength"),
            gravity: tProduct("gravity"),
            bitterness: tProduct("bitterness"),
            malts: tProduct("malts"),
            hops: tProduct("hops"),
            bottle: tProduct("bottle"),
            keg: tProduct("keg"),
          }}
        />

        <ProductRelated title={tProduct("related")} items={related} />

        <SectionFrame mode="banner" tone="ice" className="!pt-0 !pb-12">
          <p className="px-4 text-center text-xs font-semibold tracking-wide text-gletcher-navy/55 uppercase">
            {tFooter("drinkResponsibly")}
          </p>
        </SectionFrame>
      </article>
    </SiteShell>
  );
}
