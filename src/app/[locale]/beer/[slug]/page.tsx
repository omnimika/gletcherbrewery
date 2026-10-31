import type { Metadata } from "next";
import Image from "next/image";
import { notFound, permanentRedirect } from "next/navigation";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { SiteShell } from "@/components/site-shell";
import { LocaleSwitch } from "@/components/locale-switch";
import {
  getProductById,
  isTranslationPublished,
  pickCopy,
  productAlternates,
  productPublicPath,
  resolveProduct,
} from "@/content/catalog";
import {
  DEFAULT_LOCALE,
  type PublishedLocale,
  isPublishedLocale,
} from "@/i18n/locales";
import { routing } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";

type ProductPageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateStaticParams() {
  const params: { locale: string; slug: string }[] = [];
  for (const locale of routing.locales) {
    if (!isPublishedLocale(locale)) continue;
    const { getCatalogCards } = await import("@/content/catalog");
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

  const tNav = await getTranslations("nav");
  const tProduct = await getTranslations("product");
  const taste = pickCopy(product, locale, "taste");
  const about = pickCopy(product, locale, "about");
  const food = pickCopy(product, locale, "foodPairing");
  const fermentation = pickCopy(product, locale, "fermentation");

  const localeHrefs = Object.fromEntries(
    productAlternates(product).map((alt) => {
      // Pathname without prefix for next-intl Link locale prop
      const tr = getProductById(product.id)?.translations[alt.locale];
      return [alt.locale, tr ? `/beer/${tr.slug}` : undefined];
    }),
  ) as Partial<Record<PublishedLocale, string>>;

  return (
    <SiteShell>
      <article className="mx-auto max-w-3xl px-6 py-10 sm:px-10">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/beer"
            className="text-sm font-semibold tracking-wide text-gletcher-navy/70 uppercase hover:text-gletcher-navy"
          >
            ← {tNav("products")}
          </Link>
          <LocaleSwitch localeHrefs={localeHrefs} />
        </div>

        <div className="grid gap-10 sm:grid-cols-[minmax(0,220px)_1fr] sm:items-start">
          <div className="relative mx-auto aspect-[3/5] w-full max-w-[220px]">
            {product.image ? (
              <Image
                src={product.image}
                alt=""
                fill
                className="object-contain object-top"
                sizes="220px"
                priority
              />
            ) : null}
          </div>

          <div>
            <p className="text-xs font-semibold tracking-[0.2em] text-gletcher-navy/60 uppercase">
              {product.category}
            </p>
            <h1 className="font-display mt-2 text-4xl text-gletcher-navy sm:text-5xl">
              {pickCopy(product, locale, "title")}
            </h1>
            <p className="mt-4 text-base leading-relaxed text-gletcher-navy/85">
              {taste}
            </p>

            <dl className="mt-8 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
              <div>
                <dt className="text-gletcher-navy/50">ABV</dt>
                <dd className="font-semibold">{product.specs.abv}%</dd>
              </div>
              <div>
                <dt className="text-gletcher-navy/50">OG</dt>
                <dd className="font-semibold">{product.specs.og}</dd>
              </div>
              <div>
                <dt className="text-gletcher-navy/50">IBU</dt>
                <dd className="font-semibold">{product.specs.ibu}</dd>
              </div>
              <div>
                <dt className="text-gletcher-navy/50">{tProduct("style")}</dt>
                <dd className="font-semibold">{product.specs.style}</dd>
              </div>
            </dl>

            <p className="mt-6 text-sm text-gletcher-navy/70">{fermentation}</p>
            <p className="mt-6 text-sm leading-relaxed text-gletcher-navy/85">
              {about}
            </p>
            {food ? (
              <p className="mt-6 text-sm text-gletcher-navy/80">
                <span className="font-semibold">{tProduct("foodPairing")}: </span>
                {food}
              </p>
            ) : null}
            <p className="mt-4 text-sm text-gletcher-navy/70">
              <span className="font-semibold">{tProduct("malts")}: </span>
              {product.specs.malts}
              <br />
              <span className="font-semibold">{tProduct("hops")}: </span>
              {product.specs.hops}
            </p>
          </div>
        </div>
      </article>
    </SiteShell>
  );
}
