/** Shared 1-based offset pagination for staff queues. */

export type PageParams = {
  page: number;
  pageSize: number;
  offset: number;
};

export type PageResult<T> = {
  rows: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export function clampPageParams(input: {
  page?: number | string | null;
  pageSize?: number | string | null;
  defaultPageSize?: number;
  maxPageSize?: number;
}): PageParams {
  const defaultPageSize = input.defaultPageSize ?? 50;
  const maxPageSize = input.maxPageSize ?? 100;
  const rawPage = Number(input.page ?? 1);
  const rawSize = Number(input.pageSize ?? defaultPageSize);
  const pageSize = Math.min(
    Math.max(Number.isFinite(rawSize) ? Math.floor(rawSize) : defaultPageSize, 1),
    maxPageSize,
  );
  const page = Math.max(
    Number.isFinite(rawPage) ? Math.floor(rawPage) : 1,
    1,
  );
  return { page, pageSize, offset: (page - 1) * pageSize };
}

/** After knowing total, clamp page so empty trailing pages redirect conceptually. */
export function clampPageToTotal(
  page: number,
  pageSize: number,
  total: number,
): PageParams {
  const totalPages = Math.max(1, Math.ceil(total / pageSize) || 1);
  const safePage = Math.min(Math.max(page, 1), totalPages);
  return {
    page: safePage,
    pageSize,
    offset: (safePage - 1) * pageSize,
  };
}

export function toPageResult<T>(
  rows: T[],
  total: number,
  page: number,
  pageSize: number,
): PageResult<T> {
  return {
    rows,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize) || 1),
  };
}
