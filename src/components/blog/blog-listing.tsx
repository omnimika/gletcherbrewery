"use client";

import Image from "next/image";
import { useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import {
  BlogCategoryChips,
  type BlogFilterId,
} from "@/components/blog/blog-category-chips";
import {
  CardGrid,
  CardGridItem,
  Container,
  SectionFrame,
} from "@/components/layout";
import { Reveal } from "@/components/motion/reveal";
import type { BlogListCard } from "@/content/blog";
import { Link } from "@/i18n/navigation";

export const BLOG_PAGE_SIZE = 10;

type BlogListingProps = {
  title: string;
  lead: string;
  empty: string;
  items: BlogListCard[];
};

function BlogCardBody({
  item,
  priority = false,
}: {
  item: BlogListCard;
  priority?: boolean;
}) {
  return (
    <>
      {item.cover ? (
        <div className="relative aspect-[9/5] w-full overflow-hidden rounded-md bg-gletcher-navy/5">
          <Image
            src={item.cover.src}
            alt={item.cover.alt || ""}
            fill
            sizes="(min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            priority={priority}
          />
          <span className="absolute top-3 left-3 rounded-sm bg-gletcher-ice/95 px-2 py-1 text-[0.6rem] font-semibold tracking-[0.14em] text-gletcher-navy uppercase shadow-sm">
            {item.categoryLabel}
          </span>
        </div>
      ) : (
        <div className="relative flex aspect-[9/5] w-full items-end overflow-hidden rounded-md bg-gletcher-navy/8 px-3 py-3">
          <span className="rounded-sm bg-gletcher-ice/95 px-2 py-1 text-[0.6rem] font-semibold tracking-[0.14em] text-gletcher-navy uppercase shadow-sm">
            {item.categoryLabel}
          </span>
        </div>
      )}

      <div className="flex flex-1 flex-col gap-2 pt-3">
        <p className="font-display text-[1.05rem] leading-snug font-extrabold tracking-wide text-gletcher-navy uppercase transition-colors group-hover:text-gletcher-red sm:text-[1.2rem]">
          {item.title}
        </p>
        {item.description ? (
          <p className="line-clamp-3 text-sm leading-relaxed text-gletcher-navy/70">
            {item.description}
          </p>
        ) : null}
        {item.dateLabel ? (
          <p className="mt-auto pt-1 text-[0.65rem] font-semibold tracking-[0.16em] text-gletcher-navy/45 uppercase">
            {item.dateLabel}
          </p>
        ) : null}
      </div>
    </>
  );
}

/** Compact page list: always first/last, window around current. */
function pageNumbers(current: number, total: number): (number | "ellipsis")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const pages = new Set<number>([1, total, current]);
  for (let d = 1; d <= 1; d++) {
    if (current - d >= 1) pages.add(current - d);
    if (current + d <= total) pages.add(current + d);
  }
  if (current <= 3) {
    pages.add(2);
    pages.add(3);
    pages.add(4);
  }
  if (current >= total - 2) {
    pages.add(total - 1);
    pages.add(total - 2);
    pages.add(total - 3);
  }
  const sorted = [...pages].sort((a, b) => a - b);
  const out: (number | "ellipsis")[] = [];
  for (let i = 0; i < sorted.length; i++) {
    const n = sorted[i]!;
    if (i > 0 && n - sorted[i - 1]! > 1) out.push("ellipsis");
    out.push(n);
  }
  return out;
}

function BlogPagination({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}) {
  const t = useTranslations("blog.pagination");
  const tA11y = useTranslations("a11y");
  if (totalPages <= 1) return null;

  const nums = pageNumbers(page, totalPages);

  return (
    <nav
      className="mt-12 flex flex-wrap items-center justify-center gap-2"
      aria-label={tA11y("blogPagination")}
    >
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
        className="min-h-10 min-w-10 rounded-full border border-gletcher-navy/40 px-3 text-xs font-semibold tracking-wider text-gletcher-navy uppercase transition-colors enabled:hover:border-gletcher-navy disabled:cursor-not-allowed disabled:opacity-35"
      >
        {t("prev")}
      </button>
      {nums.map((n, i) =>
        n === "ellipsis" ? (
          <span
            key={`e-${i}`}
            className="px-1 text-sm text-gletcher-navy/40"
            aria-hidden
          >
            …
          </span>
        ) : (
          <button
            key={n}
            type="button"
            aria-current={n === page ? "page" : undefined}
            onClick={() => onChange(n)}
            className={`min-h-10 min-w-10 rounded-full border px-3 text-xs font-semibold tracking-wider transition-colors ${
              n === page
                ? "border-gletcher-navy bg-gletcher-navy text-gletcher-white"
                : "border-gletcher-navy/40 text-gletcher-navy hover:border-gletcher-navy"
            }`}
          >
            {n}
          </button>
        ),
      )}
      <button
        type="button"
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
        className="min-h-10 min-w-10 rounded-full border border-gletcher-navy/40 px-3 text-xs font-semibold tracking-wider text-gletcher-navy uppercase transition-colors enabled:hover:border-gletcher-navy disabled:cursor-not-allowed disabled:opacity-35"
      >
        {t("next")}
      </button>
    </nav>
  );
}

/**
 * Blog feed — DS-3: intro banner + content CardGrid (not screen slides).
 * Filter + pagination behaviour preserved.
 */
export function BlogListing({
  title,
  lead,
  empty,
  items,
}: BlogListingProps) {
  const [filter, setFilter] = useState<BlogFilterId>("all");
  const [page, setPage] = useState(1);
  const listRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(
    () =>
      filter === "all"
        ? items
        : items.filter((item) => item.categoryId === filter),
    [filter, items],
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / BLOG_PAGE_SIZE));
  const currentPage = Math.min(Math.max(1, page), totalPages);

  const visible = useMemo(() => {
    const start = (currentPage - 1) * BLOG_PAGE_SIZE;
    return filtered.slice(start, start + BLOG_PAGE_SIZE);
  }, [filtered, currentPage]);

  function handleFilterChange(id: BlogFilterId) {
    setFilter(id);
    setPage(1);
  }

  function handlePageChange(next: number) {
    setPage(Math.min(Math.max(1, next), totalPages));
    listRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <>
      <SectionFrame
        id="blog-intro"
        mode="banner"
        tone="ice"
        snap
        aria-labelledby="blog-title"
      >
        <Container className="text-center">
          <Reveal>
            <h1
              id="blog-title"
              className="font-display text-[clamp(2.25rem,6vw,4rem)] leading-[0.9] font-extrabold tracking-wide text-gletcher-navy uppercase"
            >
              {title}
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-gletcher-navy/75 sm:text-base">
              {lead}
            </p>
          </Reveal>
        </Container>
      </SectionFrame>

      <SectionFrame
        id="blog"
        mode="content"
        tone="ice"
        snap
        aria-label={title}
        className="!pt-0"
      >
        <Container className="max-w-[1120px]">
          <div ref={listRef} className="scroll-mt-24">
            <BlogCategoryChips active={filter} onChange={handleFilterChange} />
          </div>

          {filtered.length === 0 ? (
            <p className="mt-12 text-center text-sm text-gletcher-navy/60">
              {empty}
            </p>
          ) : (
            <>
              {/* Accepted feed is 2-up; min width keeps auto-fit from going 3-col. */}
              <CardGrid columns={3} minCardWidth="28rem" className="mt-10 sm:mt-12">
                {visible.map((item, index) => {
                  const className =
                    "group flex h-full flex-col text-left transition-opacity";
                  const body = (
                    <BlogCardBody item={item} priority={index < 4} />
                  );
                  return (
                    <CardGridItem key={item.id}>
                      {item.local ? (
                        <Link href={item.href} className={className}>
                          {body}
                        </Link>
                      ) : (
                        <a href={item.href} className={className}>
                          {body}
                        </a>
                      )}
                    </CardGridItem>
                  );
                })}
              </CardGrid>
              <BlogPagination
                page={currentPage}
                totalPages={totalPages}
                onChange={handlePageChange}
              />
            </>
          )}
        </Container>
      </SectionFrame>
    </>
  );
}
