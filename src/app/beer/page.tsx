import type { Metadata } from "next";
import { LeadForm } from "@/components/catalog/lead-form";
import { ProductGallery } from "@/components/catalog/product-gallery";
import { SiteShell } from "@/components/site-shell";

export const metadata: Metadata = {
  title: {
    absolute: "Каталог | Пивоварня Глетчер",
  },
  description:
    "Каталог продукции пивоварни Глетчер: классика, крафт и ограниченные серии.",
  alternates: {
    canonical: "/beer",
  },
};

export default function BeerCatalogPage() {
  return (
    <SiteShell>
      <section className="mx-auto max-w-[960px] px-6 pt-6 pb-3 text-center sm:pt-8 sm:pb-4">
        <p className="animate-hero-rise text-xs font-semibold tracking-[0.22em] text-gletcher-navy/70 uppercase sm:text-sm">
          Наша пивная линейка представляет
        </p>
        <h1 className="font-display animate-hero-rise mt-3 text-[clamp(2rem,6.5vw,4.25rem)] text-gletcher-navy">
          Полный спектр современного пивоварения
        </h1>
        <p
          className="animate-hero-rise mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-gletcher-navy/80 uppercase sm:text-base"
          style={{ animationDelay: "80ms" }}
        >
          От интерпретации классических стилей до уникальных рецептов
        </p>
      </section>

      <ProductGallery />
      <LeadForm />
    </SiteShell>
  );
}
