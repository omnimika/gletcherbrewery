import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getDb } from "@/server/db/client";
import {
  isStaffAuthConfigured,
  STAFF_COOKIE_NAME,
  verifyStaffToken,
} from "@/server/staff/auth";
import { getAssortmentMatrix } from "@/server/retail/assortment";
import {
  getLocationSummary,
  listLocations,
} from "@/server/retail/locations";
import { Banner } from "@/components/ui/card";
import { EmptyState, FormStatus } from "@/components/ui/feedback";
import { CreateLocationForm } from "./create-location-form";
import { LocationsBulkTable } from "./locations-bulk-table";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 250;

function buildLocationsHref(input: {
  chainId?: string | null;
  q?: string | null;
  status?: string | null;
  page?: number;
}): string {
  const sp = new URLSearchParams();
  if (input.chainId) sp.set("chainId", input.chainId);
  if (input.q) sp.set("q", input.q);
  if (input.status) sp.set("status", input.status);
  if (input.page && input.page > 1) sp.set("page", String(input.page));
  const qs = sp.toString();
  return qs ? `/staff/map/locations?${qs}` : "/staff/map/locations";
}

export default async function StaffMapLocationsPage({
  searchParams,
}: {
  searchParams: Promise<{
    chainId?: string;
    q?: string;
    status?: string;
    page?: string;
  }>;
}) {
  if (!isStaffAuthConfigured()) {
    redirect("/staff");
  }

  const cookieStore = await cookies();
  if (!verifyStaffToken(cookieStore.get(STAFF_COOKIE_NAME)?.value)) {
    redirect("/staff");
  }

  const params = await searchParams;
  const pageRaw = Number(params.page || "1");
  const page = Number.isFinite(pageRaw) && pageRaw > 0 ? Math.floor(pageRaw) : 1;
  const offset = (page - 1) * PAGE_SIZE;

  let summary: Awaited<ReturnType<typeof getLocationSummary>> | null = null;
  let list: Awaited<ReturnType<typeof listLocations>> | null = null;
  let chains: Array<{ id: string; title: string }> = [];
  let error: string | null = null;

  try {
    const db = getDb();
    summary = await getLocationSummary(db);
    list = await listLocations(db, {
      chainId: params.chainId ?? null,
      status: params.status ?? null,
      q: params.q ?? null,
      limit: PAGE_SIZE,
      offset,
    });
    const matrix = await getAssortmentMatrix(db);
    chains = matrix.chains.map((c) => ({ id: c.id, title: c.title }));
  } catch {
    error = "База недоступна — проверьте PostgreSQL и миграции.";
  }

  const total = list?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  if (!error && total > 0 && page > totalPages) {
    redirect(
      buildLocationsHref({
        chainId: params.chainId,
        q: params.q,
        status: params.status,
        page: totalPages,
      }),
    );
  }
  const safePage = Math.min(page, totalPages);
  const from = total === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
  const to = Math.min(safePage * PAGE_SIZE, total);

  return (
    <div className="flex min-h-0 flex-col gap-3">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="type-caption text-gletcher-navy/60">
            <Link href="/staff/map" className="underline-offset-2 hover:underline">
              Карта продаж
            </Link>
            {" / "}
            Точки
          </p>
          <h1 className="font-display text-2xl leading-none font-extrabold tracking-wide text-gletcher-navy uppercase sm:text-3xl">
            Точки продаж
          </h1>
        </div>
        {chains.length > 0 ? <CreateLocationForm chains={chains} /> : null}
      </div>

      <Banner tone="ice" className="!px-4 !py-2.5">
        <p className="type-caption text-gletcher-navy/80">
          Чекбоксы: массово удалить / сменить сеть или город (CRM + локальный
          GeoJSON). На публичную /map — после Product publish. Импорт:{" "}
          <code className="text-[11px]">npm run retail:import-locations</code>
        </p>
      </Banner>

      {error ? (
        <FormStatus tone="error" role="alert">
          {error}
        </FormStatus>
      ) : null}

      {summary ? (
        <div className="flex flex-wrap gap-2">
          <Stat
            label="Всего"
            value={summary.total}
            href={buildLocationsHref({
              q: params.q,
              status: params.status,
            })}
            active={!params.chainId}
          />
          <Stat
            label="Без сети"
            value={summary.unmatched}
            href={buildLocationsHref({
              chainId: "unmatched",
              q: params.q,
              status: params.status,
            })}
            active={params.chainId === "unmatched"}
          />
          {summary.byChain
            .filter((r) => r.chainId)
            .slice(0, 24)
            .map((r) => (
              <Stat
                key={r.chainId}
                label={r.chainTitle || "—"}
                value={r.locationCount}
                href={buildLocationsHref({
                  chainId: r.chainId,
                  q: params.q,
                  status: params.status,
                })}
                active={params.chainId === r.chainId}
              />
            ))}
        </div>
      ) : null}

      {list && list.total === 0 ? (
        <EmptyState
          title="Точек нет"
          body="Выполните: npm run retail:import-locations"
        />
      ) : null}

      {list && list.items.length > 0 ? (
        <div className="overflow-hidden rounded-xl border border-gletcher-navy/15 bg-white">
          <LocationsBulkTable items={list.items} chains={chains} />
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-gletcher-navy/10 px-3 py-2">
            <p className="text-[11px] text-gletcher-navy/60">
              {from}–{to} из {total}
              {totalPages > 1 ? ` · стр. ${safePage}/${totalPages}` : null}
            </p>
            {totalPages > 1 ? (
              <nav
                className="flex flex-wrap items-center gap-1"
                aria-label="Пагинация точек"
              >
                <PageLink
                  label="←"
                  disabled={safePage <= 1}
                  href={buildLocationsHref({
                    chainId: params.chainId,
                    q: params.q,
                    status: params.status,
                    page: safePage - 1,
                  })}
                />
                {paginationWindow(safePage, totalPages).map((p, i) =>
                  p === "…" ? (
                    <span
                      key={`e-${i}`}
                      className="px-1 text-[11px] text-gletcher-navy/40"
                    >
                      …
                    </span>
                  ) : (
                    <PageLink
                      key={p}
                      label={String(p)}
                      href={buildLocationsHref({
                        chainId: params.chainId,
                        q: params.q,
                        status: params.status,
                        page: p,
                      })}
                      active={p === safePage}
                    />
                  ),
                )}
                <PageLink
                  label="→"
                  disabled={safePage >= totalPages}
                  href={buildLocationsHref({
                    chainId: params.chainId,
                    q: params.q,
                    status: params.status,
                    page: safePage + 1,
                  })}
                />
              </nav>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function paginationWindow(
  current: number,
  total: number,
): Array<number | "…"> {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const pages = new Set<number>([1, total, current]);
  for (let p = current - 1; p <= current + 1; p += 1) {
    if (p >= 1 && p <= total) pages.add(p);
  }
  const sorted = [...pages].sort((a, b) => a - b);
  const out: Array<number | "…"> = [];
  for (let i = 0; i < sorted.length; i += 1) {
    const p = sorted[i]!;
    if (i > 0 && p - sorted[i - 1]! > 1) out.push("…");
    out.push(p);
  }
  return out;
}

function PageLink({
  href,
  label,
  active,
  disabled,
}: {
  href: string;
  label: string;
  active?: boolean;
  disabled?: boolean;
}) {
  if (disabled) {
    return (
      <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-md border border-gletcher-navy/10 px-2 text-[11px] text-gletcher-navy/30">
        {label}
      </span>
    );
  }
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`inline-flex h-7 min-w-7 items-center justify-center rounded-md border px-2 text-[11px] font-semibold ${
        active
          ? "border-gletcher-red bg-gletcher-red text-white"
          : "border-gletcher-navy/15 bg-white text-gletcher-navy hover:bg-gletcher-ice"
      }`}
    >
      {label}
    </Link>
  );
}

function Stat({
  label,
  value,
  href,
  active,
}: {
  label: string;
  value: number;
  href?: string;
  active?: boolean;
}) {
  const className = `inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${
    active
      ? "border-gletcher-red bg-gletcher-red text-white"
      : "border-gletcher-navy/15 bg-white text-gletcher-navy"
  }`;
  const body = (
    <>
      <span className="max-w-[10rem] truncate">{label}</span>
      <span className="tabular-nums opacity-80">{value}</span>
    </>
  );
  if (href) {
    return (
      <Link href={href} className={className}>
        {body}
      </Link>
    );
  }
  return <span className={className}>{body}</span>;
}
