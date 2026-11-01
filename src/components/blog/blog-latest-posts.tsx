import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Container, SectionFrame } from "@/components/layout";
import { Reveal } from "@/components/motion/reveal";
import type { BlogListCard } from "@/content/blog";

/** Visible in the horizontal feed (no arrows). */
export const BLOG_LATEST_MOBILE_COUNT = 8;
export const BLOG_LATEST_DESKTOP_COUNT = 12;

export type BlogLatestPostsProps = {
  /** Accessible section title (SVG mark is decorative). */
  title: string;
  /** Up to 12 latest cards — mobile shows first 8 via CSS. */
  items: BlogListCard[];
  /** Section id — home uses `blog`. */
  id?: string;
  /** Soft proximity snap when section left window-stage. */
  snap?: boolean;
  /** Decorative SVG title mark — Tilda ZB `#rec277882204`. */
  titleMarkSrc?: string;
};

/**
 * Latest blog cards — horizontal carousel (no arrows).
 * Mobile ≤959px: 8 cards; desktop: 12. Scroll-snap, hidden scrollbar.
 * Design: `#rec277882204` + `#rec277844567` (home custom border on covers).
 */
export function BlogLatestPosts({
  title,
  items,
  id = "blog",
  snap = false,
  titleMarkSrc = "/home/blog-title.svg",
}: BlogLatestPostsProps) {
  const cards = items.slice(0, BLOG_LATEST_DESKTOP_COUNT);
  if (cards.length === 0) return null;

  return (
    <SectionFrame
      id={id}
      mode="content"
      tone="ice"
      snap={snap}
      aria-labelledby={`${id}-heading`}
      className="!overflow-visible !pt-0 !pb-[45px]"
    >
      <div className="relative overflow-visible">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 z-0 select-none"
        >
          <Container wide>
            <Image
              src={titleMarkSrc}
              alt=""
              width={671}
              height={336}
              className="ml-2.5 h-auto w-[92%] max-w-none sm:ml-5 sm:w-[68%]"
              priority={false}
            />
          </Container>
        </div>

        {/* z-1 only above the watermark — must stay under header (z-100). */}
        <Container wide className="relative z-[1]">
          <h2 id={`${id}-heading`} className="sr-only">
            {title}
          </h2>

          <Reveal>
            {/*
              Horizontal feed on all breakpoints — ~1.25 / ~2.5 / ~4 cards
              in view; swipe/drag scroll, no arrow chrome.
              Cards 9–12 hidden below 960px (8 on mobile).
            */}
            <ul
              className="m-0 flex list-none gap-4 overflow-x-auto overscroll-x-contain p-0 pt-[72px] pb-2 [-ms-overflow-style:none] [scrollbar-width:none] snap-x snap-mandatory max-[479px]:gap-2.5 max-[479px]:pt-[140px] sm:gap-5 sm:pt-[80px] md:gap-5 md:pt-[7.5rem] lg:pt-36 [&::-webkit-scrollbar]:hidden"
              role="list"
            >
              {cards.map((item, index) => (
                <li
                  key={item.id}
                  className={`flex shrink-0 snap-start flex-col ${
                    index >= BLOG_LATEST_MOBILE_COUNT ? "hidden md:flex" : ""
                  } w-[80%] max-w-[18rem] sm:w-[42%] sm:max-w-[20rem] md:w-[calc((100%-3.75rem)/4)] md:max-w-none`}
                >
                  <BlogLatestCard item={item} priority={index < 2} />
                </li>
              ))}
            </ul>
          </Reveal>
        </Container>
      </div>
    </SectionFrame>
  );
}

function BlogLatestCard({
  item,
  priority = false,
}: {
  item: BlogListCard;
  priority?: boolean;
}) {
  const className =
    "group flex h-full flex-col bg-transparent text-left outline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-gletcher-navy";

  const body = (
    <>
      <div
        className="relative mb-5 w-full overflow-hidden rounded-[5px] border border-gletcher-navy bg-gletcher-navy/5"
        style={{ aspectRatio: "100 / 56" }}
      >
        {item.cover ? (
          <Image
            src={item.cover.src}
            alt={item.cover.alt || ""}
            fill
            sizes="(min-width: 960px) 25vw, 80vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
            priority={priority}
          />
        ) : null}
        <span className="absolute top-2.5 left-2.5 z-[1] text-[10px] leading-none font-normal tracking-[1px] text-gletcher-red uppercase max-[480px]:text-[8px]">
          {item.categoryLabel}
        </span>
      </div>

      <div className="flex flex-1 flex-col pt-[5px] pb-[27px]">
        <p className="font-[family-name:var(--font-display)] text-[24px] leading-none font-[200] text-gletcher-navy uppercase transition-colors group-hover:text-gletcher-red max-[480px]:text-[20px] max-[480px]:leading-[1.2]">
          {item.title}
        </p>
        {item.description ? (
          <p className="mt-2 line-clamp-4 font-[family-name:var(--font-display)] text-[14px] leading-none font-normal text-gletcher-navy max-[480px]:text-[10px]">
            {item.description}
          </p>
        ) : null}
        {item.dateLabel ? (
          <p className="mt-[15px] text-[10px] leading-none font-normal tracking-[1px] text-gletcher-red uppercase max-[480px]:text-[8px]">
            {item.dateLabel}
          </p>
        ) : null}
      </div>
    </>
  );

  if (item.local) {
    return (
      <Link href={item.href} className={className}>
        {body}
      </Link>
    );
  }

  return (
    <a href={item.href} className={className}>
      {body}
    </a>
  );
}
