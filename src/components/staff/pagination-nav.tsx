import Link from "next/link";

export function StaffPaginationNav({
  page,
  totalPages,
  total,
  pageSize,
  buildHref,
}: {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  buildHref: (page: number) => string;
}) {
  if (total === 0) return null;
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <nav
      className="flex flex-wrap items-center justify-between gap-3"
      aria-label="Страницы"
    >
      <p className="type-caption text-gletcher-navy/65">
        {from}–{to} из {total}
      </p>
      <div className="flex items-center gap-2">
        {page > 1 ? (
          <Link
            href={buildHref(page - 1)}
            className="rounded border border-gletcher-navy/40 px-3 py-1.5 text-xs font-semibold tracking-wide uppercase text-gletcher-navy hover:border-gletcher-navy"
          >
            Назад
          </Link>
        ) : (
          <span className="rounded border border-transparent px-3 py-1.5 text-xs text-gletcher-navy/35">
            Назад
          </span>
        )}
        <span className="type-caption text-gletcher-navy/55">
          {page} / {totalPages}
        </span>
        {page < totalPages ? (
          <Link
            href={buildHref(page + 1)}
            className="rounded border border-gletcher-navy/40 px-3 py-1.5 text-xs font-semibold tracking-wide uppercase text-gletcher-navy hover:border-gletcher-navy"
          >
            Далее
          </Link>
        ) : (
          <span className="rounded border border-transparent px-3 py-1.5 text-xs text-gletcher-navy/35">
            Далее
          </span>
        )}
      </div>
    </nav>
  );
}
