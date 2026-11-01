import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { BlogRichText } from "@/components/blog/blog-rich-text";
import { EXPANSION_PAGE } from "@/content/blog/expansion";
import { formatBlogDate } from "@/content/blog";

type BlogExpansionProps = {
  backLabel: string;
};

export function BlogExpansion({ backLabel }: BlogExpansionProps) {
  const dateLabel = formatBlogDate(EXPANSION_PAGE.publishedAt, "ru");

  return (
    <article className="mx-auto w-full max-w-[960px] px-5 pt-8 pb-16 sm:px-8 sm:pt-10 sm:pb-20">
      <p className="mb-6">
        <Link
          href="/blog"
          className="text-xs font-semibold tracking-[0.16em] text-gletcher-navy/55 uppercase transition-colors hover:text-gletcher-red"
        >
          ← {backLabel}
        </Link>
      </p>

      <header className="relative overflow-hidden rounded-md bg-gletcher-navy">
        <div className="absolute inset-0">
          <Image
            src={EXPANSION_PAGE.heroImage.src}
            alt={EXPANSION_PAGE.heroImage.alt || ""}
            fill
            priority
            className="object-cover opacity-40"
            sizes="(max-width: 960px) 100vw, 960px"
          />
          <div className="absolute inset-0 bg-gletcher-navy/55" />
        </div>
        <div className="relative flex min-h-[200px] items-center justify-center px-4 py-12 sm:min-h-[240px]">
          <h1 className="font-display rounded-[1.5rem] border-[5px] border-[#ff8462] px-6 py-3 text-center text-[clamp(2rem,6vw,3.75rem)] leading-none font-extrabold tracking-wide text-gletcher-white uppercase sm:px-10">
            {EXPANSION_PAGE.heroTitle}
          </h1>
        </div>
      </header>

      <p className="mt-4 text-center text-[0.65rem] font-semibold tracking-[0.2em] text-gletcher-navy/55 uppercase">
        {EXPANSION_PAGE.categoryLabel}
        {dateLabel ? (
          <span className="ml-2 text-gletcher-navy/40">{dateLabel}</span>
        ) : null}
      </p>

      <div className="mx-auto mt-8 max-w-[720px] space-y-3 text-center">
        {EXPANSION_PAGE.lead.map((line) => (
          <p
            key={line}
            className="font-display text-xl leading-snug font-bold text-gletcher-sky/90 sm:text-2xl"
          >
            {line}
          </p>
        ))}
      </div>

      <ul className="mt-12 grid grid-cols-1 gap-10 bg-gletcher-navy px-5 py-12 text-center sm:grid-cols-3 sm:gap-6 sm:px-8">
        {EXPANSION_PAGE.stats.map((stat) => (
          <li key={stat.value} className="flex flex-col items-center gap-3">
            <Image
              src={stat.icon}
              alt=""
              width={100}
              height={100}
              className="h-[72px] w-auto object-contain sm:h-[100px]"
            />
            <p className="font-display text-4xl leading-none font-extrabold text-[#ff8462] sm:text-5xl">
              {stat.value}
            </p>
            <p className="max-w-[220px] text-sm leading-snug text-gletcher-white sm:text-base">
              {stat.label}
            </p>
          </li>
        ))}
      </ul>

      <div className="mx-auto mt-12 max-w-[720px]">
        <p className="font-display mb-6 border-t-[5px] border-[#ff8462] pt-5 text-xl leading-snug font-bold text-gletcher-sky sm:text-2xl">
          {EXPANSION_PAGE.pullQuote}
        </p>
        <div className="font-brand text-base leading-relaxed text-gletcher-navy/90 sm:text-[1.05rem]">
          <BlogRichText html={EXPANSION_PAGE.bodyHtml} />
        </div>
      </div>
    </article>
  );
}
