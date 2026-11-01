import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { BlogRichText } from "@/components/blog/blog-rich-text";
import type { BlogArticleBody, BlogBlock } from "@/content/blog/blocks";
import { formatBlogDate } from "@/content/blog";

type BlogArticleProps = {
  article: BlogArticleBody;
  categoryLabel: string;
  publishedAt?: string;
  backHref: "/blog";
  backLabel: string;
};

function BlockView({ block }: { block: BlogBlock }) {
  switch (block.type) {
    case "preface":
      return (
        <p className="font-brand text-lg leading-relaxed text-gletcher-navy/80 italic sm:text-xl">
          <BlogRichText html={block.html} />
        </p>
      );
    case "paragraph":
      return (
        <p className="font-brand text-base leading-relaxed text-gletcher-navy/90 sm:text-[1.05rem]">
          <BlogRichText html={block.html} />
        </p>
      );
    case "heading": {
      const className =
        "font-display mt-10 mb-3 text-[clamp(1.35rem,3vw,1.85rem)] leading-tight font-extrabold tracking-wide text-gletcher-navy uppercase";
      if (block.level === 2) {
        return (
          <h2 className={className}>
            <BlogRichText html={block.html} />
          </h2>
        );
      }
      if (block.level === 4) {
        return (
          <h4 className={className}>
            <BlogRichText html={block.html} />
          </h4>
        );
      }
      return (
        <h3 className={className}>
          <BlogRichText html={block.html} />
        </h3>
      );
    }
    case "image": {
      const image = (
        <Image
          src={block.src}
          alt={block.alt || ""}
          width={block.width || 1672}
          height={block.height || 941}
          className="h-auto w-full"
          sizes="(max-width: 800px) 100vw, 720px"
        />
      );
      const framed = block.href ? (
        <a href={block.href} className="block">
          {image}
        </a>
      ) : (
        image
      );
      return (
        <figure className="my-8">
          {framed}
          {block.caption ? (
            <figcaption className="mt-2 text-center text-sm text-gletcher-navy/55">
              {block.caption}
            </figcaption>
          ) : null}
        </figure>
      );
    }
    case "quote":
      return (
        <blockquote className="border-l-2 border-gletcher-red pl-4 text-lg leading-relaxed text-gletcher-navy/85 italic">
          <BlogRichText html={block.html} />
        </blockquote>
      );
    case "list":
      return (
        <div
          className={
            block.style === "ol"
              ? "my-4 list-decimal pl-6 font-brand text-base leading-relaxed text-gletcher-navy/90 [&_ol]:list-decimal [&_li]:my-1"
              : "my-4 list-disc pl-6 font-brand text-base leading-relaxed text-gletcher-navy/90 [&_ul]:list-disc [&_li]:my-1"
          }
        >
          <BlogRichText html={block.html} />
        </div>
      );
    default: {
      const _exhaustive: never = block;
      return _exhaustive;
    }
  }
}

export function BlogArticle({
  article,
  categoryLabel,
  publishedAt,
  backHref,
  backLabel,
}: BlogArticleProps) {
  const dateLabel = formatBlogDate(
    publishedAt,
    article.locale === "en" ? "en" : "ru",
  ); // article.locale is fixture string; only ru|en published today
  const coverAlt = article.cover.alt || article.title;

  return (
    <article className="mx-auto w-full max-w-[720px] px-5 pt-8 pb-16 sm:px-8 sm:pt-10 sm:pb-20">
      <p className="mb-6">
        <Link
          href={backHref}
          className="text-xs font-semibold tracking-[0.16em] text-gletcher-navy/55 uppercase transition-colors hover:text-gletcher-red"
        >
          ← {backLabel}
        </Link>
      </p>

      <header className="text-center">
        <p className="text-[0.65rem] font-semibold tracking-[0.2em] text-gletcher-navy/55 uppercase">
          {categoryLabel}
          {dateLabel ? (
            <span className="ml-2 text-gletcher-navy/40">{dateLabel}</span>
          ) : null}
        </p>
        <h1 className="font-display mt-3 text-[clamp(1.75rem,5vw,2.75rem)] leading-[0.95] font-extrabold tracking-wide text-gletcher-navy uppercase">
          {article.title}
        </h1>
      </header>

      {article.cover.src ? (
        <div className="relative mt-8 aspect-[16/9] w-full overflow-hidden bg-gletcher-navy/5">
          <Image
            src={article.cover.src}
            alt={coverAlt}
            fill
            priority
            className="object-cover"
            sizes="(max-width: 800px) 100vw, 720px"
          />
        </div>
      ) : null}

      <div className="mt-10 flex flex-col gap-5">
        {article.blocks.map((block, index) => (
          <BlockView key={`${block.type}-${index}`} block={block} />
        ))}
      </div>
    </article>
  );
}
