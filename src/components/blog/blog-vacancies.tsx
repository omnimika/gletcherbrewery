import { Link } from "@/i18n/navigation";
import { BlogRichText } from "@/components/blog/blog-rich-text";
import { formatBlogDate } from "@/content/blog";
import { VACANCIES_PAGE } from "@/content/blog/vacancies";

type BlogVacanciesProps = {
  backLabel: string;
};

export function BlogVacancies({ backLabel }: BlogVacanciesProps) {
  const dateLabel = formatBlogDate(VACANCIES_PAGE.publishedAt, "ru");

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

      <header className="rounded-md bg-gletcher-navy px-4 py-14 text-center sm:py-16">
        <h1 className="font-display text-[clamp(2.5rem,8vw,4.5rem)] leading-none font-extrabold tracking-wide text-gletcher-white uppercase">
          {VACANCIES_PAGE.heroTitle}
        </h1>
      </header>

      <p className="mt-4 text-center text-[0.65rem] font-semibold tracking-[0.2em] text-gletcher-navy/55 uppercase">
        {VACANCIES_PAGE.categoryLabel}
        {dateLabel ? (
          <span className="ml-2 text-gletcher-navy/40">{dateLabel}</span>
        ) : null}
      </p>

      <div className="mx-auto mt-10 max-w-[720px]">
        <p className="font-display mb-6 border-t-[5px] border-[#ff8462] pt-5 text-xl leading-snug font-bold text-gletcher-sky sm:text-2xl">
          {VACANCIES_PAGE.pullQuote}
        </p>
        <div className="font-brand text-base leading-relaxed text-gletcher-navy/90 sm:text-[1.05rem]">
          <BlogRichText html={VACANCIES_PAGE.bodyHtml} />
        </div>
      </div>

      <p className="font-display mx-auto mt-14 max-w-[820px] text-center text-xl leading-snug font-extrabold tracking-wide text-gletcher-sky uppercase sm:text-2xl">
        {VACANCIES_PAGE.manifesto}
      </p>

      <ul className="mx-auto mt-12 grid max-w-[900px] grid-cols-1 gap-4 sm:grid-cols-2">
        {VACANCIES_PAGE.roles.map((role) => (
          <li key={role}>
            <span className="font-display flex min-h-14 items-center justify-center rounded-full border-[3px] border-gletcher-white bg-[#ff8462] px-4 py-3 text-center text-sm font-semibold tracking-wide text-gletcher-white uppercase sm:text-base">
              {role}
            </span>
          </li>
        ))}
      </ul>

      <div className="mx-auto mt-14 max-w-[560px] text-center">
        <p className="text-sm text-gletcher-navy/75">{VACANCIES_PAGE.contactNote}</p>
        <ul className="mt-3 space-y-2">
          {VACANCIES_PAGE.phones.map((phone) => (
            <li key={phone.href}>
              <a
                href={phone.href}
                className="font-display text-lg font-extrabold tracking-wide text-gletcher-navy uppercase transition-colors hover:text-gletcher-red"
              >
                {phone.label}
              </a>
            </li>
          ))}
        </ul>
        <p className="mt-4">
          <a
            href={`mailto:${VACANCIES_PAGE.email}`}
            className="text-sm font-semibold tracking-wide text-gletcher-navy/70 underline underline-offset-2 transition-opacity hover:opacity-70"
          >
            {VACANCIES_PAGE.email}
          </a>
        </p>
      </div>
    </article>
  );
}
