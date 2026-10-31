"use client";

import { useTranslations } from "next-intl";
import {
  PRODUCT_FILTERS,
  type ProductFilterId,
} from "@/content/products";

type ProductFilterChipsProps = {
  active: ProductFilterId;
  onChange: (id: ProductFilterId) => void;
};

export function ProductFilterChips({
  active,
  onChange,
}: ProductFilterChipsProps) {
  const t = useTranslations("beer.filters");
  const tA11y = useTranslations("a11y");

  return (
    <div
      className="flex flex-wrap items-center justify-center gap-2 sm:gap-3"
      role="group"
      aria-label={tA11y("catalogFilter")}
    >
      {PRODUCT_FILTERS.map((filter) => {
        const isActive = active === filter.id;
        return (
          <button
            key={filter.id}
            type="button"
            aria-pressed={isActive}
            onClick={() => onChange(filter.id)}
            className={`rounded-full border px-4 py-1.5 text-xs font-semibold tracking-wider transition-colors sm:px-5 sm:text-sm ${
              isActive
                ? "border-gletcher-navy bg-gletcher-navy text-gletcher-white"
                : "border-gletcher-navy/40 bg-gletcher-ice text-gletcher-navy hover:border-gletcher-navy"
            }`}
          >
            {t(filter.id)}
          </button>
        );
      })}
    </div>
  );
}
