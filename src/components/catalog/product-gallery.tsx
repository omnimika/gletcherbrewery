"use client";

import { useMemo, useRef, useState } from "react";
import {
  CATALOG_PRODUCTS,
  filterProducts,
  type ProductFilterId,
} from "@/content/products";
import { ProductCard } from "@/components/catalog/product-card";
import { ProductFilterChips } from "@/components/catalog/product-filter-chips";
import styles from "./product-gallery.module.css";

/**
 * CSS-module carousel matching Tilda `#rec802918687` breakpoints.
 */
export function ProductGallery() {
  const [filter, setFilter] = useState<ProductFilterId>("all");
  const scrollerRef = useRef<HTMLDivElement>(null);

  const products = useMemo(
    () => filterProducts(CATALOG_PRODUCTS, filter),
    [filter],
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
          aria-label="Предыдущие сорта"
        >
          ←
        </button>
        <button
          type="button"
          onClick={() => scrollBy(1)}
          className={`${styles.arrow} ${styles.arrowNext}`}
          aria-label="Следующие сорта"
        >
          →
        </button>

        <div ref={scrollerRef} className={styles.track}>
          {products.map((product) => (
            <div key={product.slug} className={styles.slot}>
              <div className={styles.slotInner}>
                <ProductCard product={product} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {products.length === 0 ? (
        <p className="mt-8 text-center text-sm text-gletcher-navy/70">
          В этой категории пока нет сортов.
        </p>
      ) : null}
    </section>
  );
}
