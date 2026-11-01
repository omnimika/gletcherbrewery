import { Link } from "@/i18n/navigation";
import type { BlogListCard } from "@/content/blog";
import { formatBlogDate } from "@/content/blog";
import type { PublishedLocale } from "@/i18n/locales";

type BlogListingProps = {
  locale: PublishedLocale;
  title: string;
  lead: string;
  archiveLabel: string;
  archiveHref: string;
  empty: string;
  items: BlogListCard[];
};

export function BlogListing({
  locale,
  title,
  lead,
  archiveLabel,
  archiveHref,
  empty,
  items,
}: BlogListingProps) {
  return (
    <section className="mx-auto w-full max-w-[960px] px-5 pt-8 pb-16 sm:px-8 sm:pt-10 sm:pb-20">
      <header className="text-center">
        <h1 className="font-display text-[clamp(2.25rem,6vw,4rem)] leading-[0.9] font-extrabold tracking-wide text-gletcher-navy uppercase">
          {title}
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-gletcher-navy/75 sm:text-base">
          {lead}
        </p>
      </header>

      {items.length === 0 ? (
        <p className="mt-12 text-center text-sm text-gletcher-navy/60">{empty}</p>
      ) : (
        <ul className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => {
            const dateLabel = formatBlogDate(item.publishedAt, locale);
            const label = (
              <>
                <p className="text-[0.65rem] font-semibold tracking-[0.2em] text-gletcher-navy/55 uppercase">
                  {item.categoryLabel}
                  {dateLabel ? (
                    <span className="ml-2 text-gletcher-navy/40">{dateLabel}</span>
                  ) : null}
                </p>
                <p className="font-display text-[1.15rem] leading-snug font-extrabold tracking-wide text-gletcher-navy uppercase transition-colors group-hover:text-gletcher-red sm:text-[1.25rem]">
                  {item.title}
                </p>
              </>
            );
            return (
              <li key={item.id}>
                {item.local ? (
                  <Link
                    href={item.href}
                    className="group flex h-full flex-col gap-3 border-t border-gletcher-navy/15 pt-4 transition-colors"
                  >
                    {label}
                  </Link>
                ) : (
                  <a
                    href={item.href}
                    className="group flex h-full flex-col gap-3 border-t border-gletcher-navy/15 pt-4 transition-colors"
                  >
                    {label}
                  </a>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <p className="mt-14 text-center">
        <a
          href={archiveHref}
          className="font-display inline-flex min-h-11 items-center justify-center border border-gletcher-navy px-5 text-xs font-extrabold tracking-wide text-gletcher-navy uppercase transition-colors hover:border-gletcher-red hover:bg-gletcher-red hover:text-gletcher-ice"
        >
          {archiveLabel}
        </a>
      </p>
    </section>
  );
}
