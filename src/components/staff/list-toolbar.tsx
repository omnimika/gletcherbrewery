import type { SortDir } from "@/lib/staff-sort";
import { StaffEmailFilter } from "./email-filter";
import { StaffPaginationNav } from "./pagination-nav";
import { StaffSortNav, type StaffSortOption } from "./sort-nav";

/** One row: email filter + compact sort + pagination. */
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
  emailFilter,
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
  emailFilter?: {
    action: string;
    email: string | null;
    hiddenFields: Record<string, string | null | undefined>;
  };
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-gletcher-navy/10 pb-3">
      <div className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-2">
        {emailFilter ? (
          <StaffEmailFilter
            action={emailFilter.action}
            email={emailFilter.email}
            hiddenFields={emailFilter.hiddenFields}
          />
        ) : null}
        <StaffSortNav
          options={options}
          sort={sort}
          dir={dir}
          buildHref={buildSortHref}
        />
      </div>
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
