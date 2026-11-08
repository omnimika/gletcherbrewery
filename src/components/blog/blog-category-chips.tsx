"use client";

import { useTranslations } from "next-intl";
import {
  BLOG_CATEGORY_IDS,
  type BlogCategoryId,
} from "@/content/blog-categories";

export type BlogFilterId = "all" | BlogCategoryId;

const FILTERS: BlogFilterId[] = ["all", ...BLOG_CATEGORY_IDS];

type BlogCategoryChipsProps = {
  active: BlogFilterId;
  onChange: (id: BlogFilterId) => void;
};

export function BlogCategoryChips({
  active,
  onChange,
}: BlogCategoryChipsProps) {
  const t = useTranslations("blog.filters");
  const tA11y = useTranslations("a11y");

  return (
    <div
      className="flex flex-wrap items-center justify-center gap-2 sm:gap-3"
      role="group"
      aria-label={tA11y("blogFilter")}
    >
      {FILTERS.map((filter) => {
        const isActive = active === filter;
        return (
          <button
            key={filter}
            type="button"
            aria-pressed={isActive}
            onClick={() => onChange(filter)}
            className={`rounded-full border px-3 py-1.5 text-[0.65rem] font-semibold tracking-wider transition-colors sm:px-4 sm:text-xs ${
              isActive
                ? "border-gletcher-navy bg-gletcher-navy text-gletcher-white"
                : "border-gletcher-navy/40 bg-gletcher-ice text-gletcher-navy hover:border-gletcher-navy"
            }`}
          >
            {t(filter)}
          </button>
        );
      })}
    </div>
  );
}
