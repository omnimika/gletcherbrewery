"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
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

function subscribeViewport(onStoreChange: () => void) {
  window.addEventListener("resize", onStoreChange);
  return () => window.removeEventListener("resize", onStoreChange);
}

function catalogColsClient(): number {
  return catalogColsForWidth(window.innerWidth);
}

function catalogColsServer(): number {
  return 4;
}

/** Odd copy count so a true middle set exists; enough to overflow cols. */
function loopCopyCount(productCount: number, cols: number): number {
  if (productCount <= 1) return 1;
  const minItems = cols + 1;
  let needed = Math.ceil(minItems / productCount);
  if (needed < 3) needed = 3;
  if (needed % 2 === 0) needed += 1;
  return needed;
}

type LoopedItem = {
  product: CatalogCard;
  key: string;
  copy: number;
  indexInSet: number;
};

export function ProductGallery({ cards }: ProductGalleryProps) {
  const [filter, setFilter] = useState<ProductFilterId>("all");
  const cols = useSyncExternalStore(
    subscribeViewport,
    catalogColsClient,
    catalogColsServer,
  );
  const scrollerRef = useRef<HTMLDivElement>(null);
  const jumpingRef = useRef(false);
  const t = useTranslations("beer");
  const tA11y = useTranslations("a11y");

  const products = useMemo(
    () => filterCatalogCards(cards, filter),
    [cards, filter],
  );

  /** Loop only when the strip overflows the visible columns. */
  const canLoop = products.length > cols;
  const copies = canLoop ? loopCopyCount(products.length, cols) : 1;
  const middleCopy = Math.floor(copies / 2);

  const looped = useMemo((): LoopedItem[] => {
    if (products.length === 0) return [];
    if (!canLoop) {
      return products.map((p, indexInSet) => ({
        product: p,
        key: `${p.id}-0-${indexInSet}`,
        copy: 0,
        indexInSet,
      }));
    }
    const out: LoopedItem[] = [];
    for (let copy = 0; copy < copies; copy++) {
      products.forEach((p, indexInSet) => {
        out.push({
          product: p,
          key: `${p.id}-${copy}-${indexInSet}`,
          copy,
          indexInSet,
        });
      });
    }
    return out;
  }, [products, copies, canLoop]);

  useEffect(() => {
    const track = scrollerRef.current;
    if (!track || !canLoop) {
      if (track) track.scrollLeft = 0;
      return;
    }

    const goMiddle = () => {
      const one = track.scrollWidth / copies;
      if (one <= 0) return;
      jumpingRef.current = true;
      const prev = track.style.scrollBehavior;
      track.style.scrollBehavior = "auto";
      track.scrollLeft = one * middleCopy;
      requestAnimationFrame(() => {
        track.style.scrollBehavior = prev;
        jumpingRef.current = false;
      });
    };

    goMiddle();

    const normalize = () => {
      if (jumpingRef.current) return;
      const one = track.scrollWidth / copies;
      if (one <= 0) return;
      let left = track.scrollLeft;
      // Keep scroll inside the middle band [one, (copies-2)*one]
      let shifted = false;
      while (left < one) {
        left += one;
        shifted = true;
      }
      while (left >= one * (copies - 1)) {
        left -= one;
        shifted = true;
      }
      if (!shifted) return;
      jumpingRef.current = true;
      const prev = track.style.scrollBehavior;
      track.style.scrollBehavior = "auto";
      track.scrollLeft = left;
      requestAnimationFrame(() => {
        track.style.scrollBehavior = prev;
        jumpingRef.current = false;
      });
    };

    track.addEventListener("scroll", normalize, { passive: true });
    track.addEventListener("scrollend", normalize);
    return () => {
      track.removeEventListener("scroll", normalize);
      track.removeEventListener("scrollend", normalize);
    };
  }, [canLoop, copies, middleCopy, products, cols, filter]);

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
        {canLoop ? (
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
          className={`${styles.track} ${canLoop ? styles.trackOverflow : ""}`}
        >
          {looped.map(({ product, key, copy, indexInSet }) => (
            <div key={key} className={styles.slot}>
              <div className={styles.slotInner}>
                <ProductCard
                  product={product}
                  priority={copy === middleCopy && indexInSet === 0}
                />
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
