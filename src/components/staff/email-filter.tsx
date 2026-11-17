/** Compact GET email filter for staff list toolbars. */
export function StaffEmailFilter({
  action,
  email,
  hiddenFields,
}: {
  action: string;
  email: string | null;
  /** Other query params to preserve (status, sort, dir, …). */
  hiddenFields: Record<string, string | null | undefined>;
}) {
  return (
    <form
      method="get"
      action={action}
      className="flex min-w-0 flex-wrap items-center gap-2"
      role="search"
      aria-label="Фильтр по email"
    >
      {Object.entries(hiddenFields).map(([name, value]) =>
        value != null && value !== "" ? (
          <input key={name} type="hidden" name={name} value={value} />
        ) : null,
      )}
      <label className="sr-only" htmlFor="staff-email-filter">
        Email участника
      </label>
      <input
        id="staff-email-filter"
        type="search"
        name="email"
        defaultValue={email ?? ""}
        placeholder="Email участника"
        autoComplete="off"
        spellCheck={false}
        className="min-w-[12rem] max-w-[18rem] flex-1 rounded border border-gletcher-navy/30 bg-gletcher-white px-2.5 py-1.5 type-caption text-gletcher-navy placeholder:text-gletcher-navy/40 focus-visible:outline focus-visible:outline-[length:var(--focus-width)] focus-visible:outline-offset-[var(--focus-offset)] focus-visible:outline-gletcher-navy"
      />
      <button
        type="submit"
        className="rounded border border-gletcher-navy/40 px-2.5 py-1.5 text-xs font-semibold tracking-wide uppercase text-gletcher-navy hover:border-gletcher-navy"
      >
        Найти
      </button>
      {email ? (
        <a
          href={`${action}?${new URLSearchParams(
            Object.entries(hiddenFields).filter(
              (entry): entry is [string, string] =>
                entry[1] != null && entry[1] !== "",
            ),
          ).toString()}`}
          className="type-caption text-gletcher-navy/55 underline-offset-2 hover:text-gletcher-navy hover:underline"
        >
          Сбросить
        </a>
      ) : null}
    </form>
  );
}
