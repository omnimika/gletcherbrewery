import type { SortDir } from "@/lib/staff-sort";
import { StaffPaginationNav } from "./pagination-nav";
import { StaffSortNav, type StaffSortOption } from "./sort-nav";

/** One row: compact sort + pagination range/controls. */
export function StaffListToolbar({
  options,
  sort,
  dir,
  buildSortHref,
  page,
  totalPages,
  total,
  pageSize,
  buildPageHref,
}: {
  options: readonly StaffSortOption[];
  sort: string;
  dir: SortDir;
  buildSortHref: (sort: string, dir: SortDir) => string;
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  buildPageHref: (page: number) => string;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-gletcher-navy/10 pb-3">
      <StaffSortNav
        options={options}
        sort={sort}
        dir={dir}
        buildHref={buildSortHref}
      />
      <StaffPaginationNav
        page={page}
        totalPages={totalPages}
        total={total}
        pageSize={pageSize}
        buildHref={buildPageHref}
        compact
      />
    </div>
  );
}
