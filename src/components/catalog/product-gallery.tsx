"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import {
  filterCatalogCards,
  type CatalogCard,
} from "@/content/catalog-filter";
import type { ProductFilterId } from "@/content/products";
import { ProductCard } from "@/components/catalog/product-card";
import { ProductFilterChips } from "@/components/catalog/product-filter-chips";
import styles from "./product-gallery.module.css";

type ProductGalleryProps = {
  /** Cards for the active locale only (prepared on the server). */
  cards: CatalogCard[];
};

/** Mirrors breakpoints in product-gallery.module.css */
function catalogColsForWidth(width: number): number {
  if (width >= 1400) return 5;
  if (width >= 960) return 4;
  if (width >= 640) return 3;
  if (width >= 480) return 2;
  return 1;
}

export function ProductGallery({ cards }: ProductGalleryProps) {
  const [filter, setFilter] = useState<ProductFilterId>("all");
  const [cols, setCols] = useState(4);
  const [mounted, setMounted] = useState(false);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const t = useTranslations("beer");
  const tA11y = useTranslations("a11y");

  const products = useMemo(
    () => filterCatalogCards(cards, filter),
    [cards, filter],
  );

  /** After mount only — avoids SSR/client mismatch on arrow chrome. */
  const overflows = mounted && products.length > cols;

  useEffect(() => {
    setMounted(true);
    const update = () => setCols(catalogColsForWidth(window.innerWidth));
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    const track = scrollerRef.current;
    if (!track) return;
    track.scrollLeft = 0;
  }, [filter, products]);

  const scrollBy = (dir: -1 | 1) => {
    const track = scrollerRef.current;
    const slot = track?.querySelector<HTMLElement>(`.${styles.slot}`);
    if (!track || !slot) return;
    track.scrollBy({ left: dir * slot.offsetWidth, behavior: "smooth" });
  };

  return (
    <section className="relative w-full">
      <div className="relative z-20 -mb-3 px-4 sm:px-8">
        <ProductFilterChips active={filter} onChange={setFilter} />
      </div>

      <div className={`${styles.stage} -mt-3`}>
        {overflows ? (
          <>
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
          </>
        ) : null}

        <div
          ref={scrollerRef}
          className={`${styles.track} ${overflows ? styles.trackOverflow : ""}`}
        >
          {products.map((product, index) => (
            <div key={product.id} className={styles.slot}>
              <div className={styles.slotInner}>
                <ProductCard product={product} priority={index === 0} />
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
