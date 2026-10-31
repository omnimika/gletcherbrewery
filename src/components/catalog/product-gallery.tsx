"use client";

import { useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import {
  filterCatalogCards,
  type CatalogCard,
} from "@/content/catalog";
import type { ProductFilterId } from "@/content/products";
import { ProductCard } from "@/components/catalog/product-card";
import { ProductFilterChips } from "@/components/catalog/product-filter-chips";
import styles from "./product-gallery.module.css";

type ProductGalleryProps = {
  /** Cards for the active locale only (prepared on the server). */
  cards: CatalogCard[];
};

export function ProductGallery({ cards }: ProductGalleryProps) {
  const [filter, setFilter] = useState<ProductFilterId>("all");
  const scrollerRef = useRef<HTMLDivElement>(null);
  const t = useTranslations("beer");
  const tA11y = useTranslations("a11y");

  const products = useMemo(
    () => filterCatalogCards(cards, filter),
    [cards, filter],
  );

  const scrollBy = (dir: -1 | 1) => {
    const track = scrollerRef.current;
    const slot = track?.querySelector<HTMLElement>(`.${styles.slot}`);
    if (!track || !slot) return;
    track.scrollBy({ left: dir * slot.offsetWidth, behavior: "smooth" });
  };

  return (
    <section className="relative w-full">
      <div className="relative z-20 -mb-2 px-4 sm:px-8">
        <ProductFilterChips active={filter} onChange={setFilter} />
      </div>

      <div className={`${styles.stage} -mt-2`}>
        <button
          type="button"
          onClick={() => scrollBy(-1)}
          className={`${styles.arrow} ${styles.arrowPrev}`}
          aria-label={tA11y("prevBeers")}
        >
          ←
        </button>
        <button
          type="button"
          onClick={() => scrollBy(1)}
          className={`${styles.arrow} ${styles.arrowNext}`}
          aria-label={tA11y("nextBeers")}
        >
          →
        </button>

        <div ref={scrollerRef} className={styles.track}>
          {products.map((product) => (
            <div key={product.id} className={styles.slot}>
              <div className={styles.slotInner}>
                <ProductCard product={product} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {products.length === 0 ? (
        <p className="mt-8 text-center text-sm text-gletcher-navy/70">
          {t("emptyCategory")}
        </p>
      ) : null}
    </section>
  );
}
