import Link from "next/link";
import type { SortDir } from "@/lib/staff-sort";
import { nextSortDir } from "@/lib/staff-sort";

export type StaffSortOption = {
  key: string;
  label: string;
};

/** Compact text sort controls — for list toolbar, not filter tabs. */
export function StaffSortNav({
  options,
  sort,
  dir,
  buildHref,
}: {
  options: readonly StaffSortOption[];
  sort: string;
  dir: SortDir;
  buildHref: (sort: string, dir: SortDir) => string;
}) {
  return (
    <nav
      className="flex flex-wrap items-baseline gap-x-2 gap-y-1"
      aria-label="Сортировка"
    >
      <span className="type-caption text-gletcher-navy/55">Сорт.</span>
      {options.map((opt, i) => {
        const active = sort === opt.key;
        const nextDir = nextSortDir({ sort, dir }, opt.key, "desc");
        const marker = active ? (dir === "desc" ? "↓" : "↑") : null;
        return (
          <span key={opt.key} className="inline-flex items-baseline gap-2">
            {i > 0 ? (
              <span className="type-caption text-gletcher-navy/30" aria-hidden>
                ·
              </span>
            ) : null}
            <Link
              href={buildHref(opt.key, active ? nextDir : "desc")}
              className={`type-caption tracking-wide transition-colors ${
                active
                  ? "font-semibold text-gletcher-navy"
                  : "text-gletcher-navy/55 hover:text-gletcher-navy"
              }`}
              aria-current={active ? "true" : undefined}
            >
              {opt.label}
              {marker ? (
                <span className="ml-0.5" aria-hidden>
                  {marker}
                </span>
              ) : null}
            </Link>
          </span>
        );
      })}
    </nav>
  );
}
