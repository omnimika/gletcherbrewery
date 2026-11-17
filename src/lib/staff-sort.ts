/** Staff queue sort: default newest → oldest. */

export type SortDir = "asc" | "desc";

export type StaffSort<T extends string> = {
  sort: T;
  dir: SortDir;
};

export function parseStaffSort<T extends string>(
  input: {
    sort?: string | null;
    dir?: string | null;
  },
  allowed: readonly T[],
  defaultSort: T,
  defaultDir: SortDir = "desc",
): StaffSort<T> {
  const sort = (
    input.sort && (allowed as readonly string[]).includes(input.sort)
      ? input.sort
      : defaultSort
  ) as T;
  const dir: SortDir =
    input.dir === "asc" || input.dir === "desc" ? input.dir : defaultDir;
  return { sort, dir };
}

/** Toggle helper for UI links: same field flips dir; new field starts at preferred. */
export function nextSortDir(
  current: StaffSort<string>,
  field: string,
  preferred: SortDir = "desc",
): SortDir {
  if (current.sort === field) {
    return current.dir === "desc" ? "asc" : "desc";
  }
  return preferred;
}
