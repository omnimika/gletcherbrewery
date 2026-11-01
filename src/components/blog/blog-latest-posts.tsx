import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Container, SectionFrame } from "@/components/layout";
import { Reveal } from "@/components/motion/reveal";
import type { BlogListCard } from "@/content/blog";

export type BlogLatestPostsProps = {
  /** Accessible section title (SVG mark is decorative). */
  title: string;
  items: BlogListCard[];
  /** Section id — home uses `blog`. */
  id?: string;
  /** Soft proximity snap when section left window-stage. */
  snap?: boolean;
  /** Decorative SVG title mark — Tilda ZB `#rec277882204`. */
  titleMarkSrc?: string;
};

/**
 * Latest blog cards — home / product-page module
 * `#rec277882204` (title SVG) + `#rec277844567` (FD301 feed, 4 cols).
 *
 * Home custom CSS (page__.html): image `border:1px #0d0f49` + `border-radius:5px`;
 * feed `z-index:100` over the ZB watermark. Feed typography from `#rec277844567`.
 */
export function BlogLatestPosts({
  title,
  items,
  id = "blog",
  snap = false,
  titleMarkSrc = "/home/blog-title.svg",
}: BlogLatestPostsProps) {
  if (items.length === 0) return null;

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
        {/*
          ZB 277882204: short artboard, overflow visible — «БЛОГ» spills
          behind the feed (home `.t897 { z-index:100 }`).
        */}
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

        <Container wide className="relative z-[100]">
          <h2 id={`${id}-heading`} className="sr-only">
            {title}
          </h2>

          {/*
            FD301: 4× `t-col_3`, imageRatio 56, isHorizOnMob.
            Top inset ≈ ZB carrier so letter tops of «БЛОГ» remain above cards
            (artboard ~90px; SVG itself ~360px tall and overflows).
          */}
          <Reveal>
            <ul
              className="m-0 flex list-none gap-5 overflow-x-auto p-0 pt-[72px] pb-0 [-ms-overflow-style:none] [scrollbar-width:none] max-[479px]:gap-2.5 max-[479px]:pt-[140px] sm:gap-5 sm:pt-[80px] md:grid md:grid-cols-4 md:gap-x-5 md:gap-y-0 md:overflow-visible md:pt-[72px] [&::-webkit-scrollbar]:hidden"
              role="list"
            >
              {items.map((item, index) => (
                <li
                  key={item.id}
                  className="flex w-[80%] max-w-[18rem] shrink-0 flex-col sm:w-[38%] sm:max-w-none md:w-auto md:max-w-none md:min-w-0 md:shrink"
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
      {/*
        imageRatio 56 → height = 56% of width.
        Home override: border 1px navy + radius 5px on the cover.
        No white card plate — text sits on section ice.
      */}
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
        {/* partsPos: onimage */}
        <span className="absolute top-2.5 left-2.5 z-[1] text-[10px] leading-none font-normal tracking-[1px] text-gletcher-red uppercase max-[480px]:text-[8px]">
          {item.categoryLabel}
        </span>
      </div>

      <div className="flex flex-1 flex-col pt-[5px] pb-[27px]">
        {/* 24px / weight 200 (XCompressed) / lh 1 / uppercase / #0d0f49 */}
        <p className="font-[family-name:var(--font-display)] text-[24px] leading-none font-[200] text-gletcher-navy uppercase transition-colors group-hover:text-gletcher-red max-[480px]:text-[20px] max-[480px]:leading-[1.2]">
          {item.title}
        </p>
        {item.description ? (
          <p className="mt-2 line-clamp-4 font-[family-name:var(--font-display)] text-[14px] leading-none font-normal text-gletcher-navy max-[480px]:text-[10px]">
            {item.description}
          </p>
        ) : null}
        {/* datePos: afterdescr — row margin-top 15px; year included */}
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
