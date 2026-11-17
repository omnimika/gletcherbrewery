import { StaffListToolbar } from "@/components/staff/list-toolbar";
import { Banner } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/feedback";
import { getDb } from "@/server/db/client";
import { parseStaffEmailFilter } from "@/lib/staff-email-filter";
import { parseStaffSort } from "@/lib/staff-sort";
import {
  isPendingReceiptStatus,
  listReceiptsForStaff,
  parseStaffReceiptStatusFilter,
  STAFF_RECEIPT_SORT_FIELDS,
  STAFF_RECEIPT_STATUS_FILTERS,
  STAFF_RECEIPT_STATUS_LABELS_RU,
} from "@/server/loyalty/receipts";
import { LOYALTY_STAFF_ROLES } from "@/server/staff/roles";
import { gateStaffPage } from "@/server/staff/page-gate";
import { StaffLoginForm } from "../../staff-login-form";
import { ManualReceiptForm } from "./manual-receipt-form";
import { ReceiptActions } from "./receipt-actions";
import { ReceiptPhotoPreview } from "./receipt-photo";

export const dynamic = "force-dynamic";

const RECEIPT_SORT_OPTIONS = [
  { key: "createdAt", label: "Дата" },
  { key: "purchaseAt", label: "Покупка" },
] as const;

export default async function StaffLoyaltyReceiptsPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    sort?: string;
    dir?: string;
    status?: string;
    email?: string;
  }>;
}) {
  const gate = await gateStaffPage(LOYALTY_STAFF_ROLES);
  if (gate.status === "unconfigured") {
    return (
      <Banner tone="frost">
        <p className="font-display text-lg uppercase">STAFF_API_TOKEN не задан</p>
      </Banner>
    );
  }
  if (gate.status === "login") {
    return <StaffLoginForm />;
  }
  if (gate.status === "forbidden") {
    return (
      <Banner tone="frost">
        <p className="font-display text-lg uppercase">Недостаточно прав</p>
        <p className="type-body-small mt-2">Роль {gate.actor.role} не открывает loyalty.</p>
      </Banner>
    );
  }

  const sp = await searchParams;
  const statusFilter = parseStaffReceiptStatusFilter(sp.status);
  const emailFilter = parseStaffEmailFilter(sp.email);
  const { sort, dir } = parseStaffSort(
    sp,
    STAFF_RECEIPT_SORT_FIELDS,
    "createdAt",
    "desc",
  );
  let pageResult: Awaited<ReturnType<typeof listReceiptsForStaff>> | null =
    null;
  let error: string | null = null;
  try {
    pageResult = await listReceiptsForStaff(getDb(), {
      status: statusFilter,
      email: emailFilter,
      page: sp.page,
      pageSize: 50,
      sort,
      dir,
    });
  } catch {
    error = "База недоступна — проверьте embedded PostgreSQL.";
  }

  const rows = pageResult?.rows ?? [];
  const filterQs = [
    `status=${statusFilter}`,
    emailFilter ? `email=${encodeURIComponent(emailFilter)}` : null,
    `sort=${sort}`,
    `dir=${dir}`,
  ]
    .filter(Boolean)
    .join("&");
  const qsPrefix = `${filterQs}&`;
  const statusBaseQs = [
    emailFilter ? `email=${encodeURIComponent(emailFilter)}` : null,
    `sort=${sort}`,
    `dir=${dir}`,
  ]
    .filter(Boolean)
    .join("&");

  return (
    <div className="space-y-[var(--grid-gap)]">
      <h1 className="font-display text-[clamp(1.75rem,4vw,2.75rem)] leading-none font-extrabold tracking-wide text-gletcher-navy uppercase">
        Чеки лояльности
      </h1>
      <p className="type-body-small max-w-2xl text-gletcher-navy/70">
        Очередь и архив чеков. Одобрение пишет{" "}
        <code className="text-xs">check_earn</code> в ledger (5%). Решения — только
        через audited staff commands; NocoDB остаётся read-only табличным
        просмотром над PostgreSQL.
      </p>

      <ManualReceiptForm />

      <div className="flex flex-wrap gap-2" role="navigation" aria-label="Фильтр по статусу">
        {STAFF_RECEIPT_STATUS_FILTERS.map((s) => (
          <FilterChip
            key={s}
            href={`/staff/loyalty/receipts?status=${s}&${statusBaseQs}`}
            active={statusFilter === s}
          >
            {STAFF_RECEIPT_STATUS_LABELS_RU[s]}
          </FilterChip>
        ))}
      </div>

      {error ? (
        <Banner tone="frost">
          <p>{error}</p>
        </Banner>
      ) : null}

      {!error && pageResult ? (
        <StaffListToolbar
          options={RECEIPT_SORT_OPTIONS}
          sort={sort}
          dir={dir}
          buildSortHref={(s, d) =>
            `/staff/loyalty/receipts?${[
              `status=${statusFilter}`,
              emailFilter ? `email=${encodeURIComponent(emailFilter)}` : null,
              `sort=${s}`,
              `dir=${d}`,
            ]
              .filter(Boolean)
              .join("&")}`
          }
          page={pageResult.page}
          totalPages={pageResult.totalPages}
          total={pageResult.total}
          pageSize={pageResult.pageSize}
          buildPageHref={(p) => `/staff/loyalty/receipts?${qsPrefix}page=${p}`}
          emailFilter={{
            action: "/staff/loyalty/receipts",
            email: emailFilter,
            hiddenFields: {
              status: statusFilter,
              sort,
              dir,
            },
          }}
        />
      ) : null}

      {rows.length === 0 && !error ? (
        <EmptyState
          title={
            statusFilter === "pending" ? "Очередь пуста" : "Нет чеков"
          }
          body={
            statusFilter === "pending"
              ? "Новых pending-чеков нет."
              : "Смените фильтр статуса или создайте чек вручную."
          }
        />
      ) : (
        <ul className="grid gap-3">
          {rows.map(({ receipt, email, displayName, statusLabel }) => {
            const canDecide = isPendingReceiptStatus(receipt.status);
            return (
              <li
                key={receipt.id}
                className="rounded-[var(--radius-card)] border border-gletcher-navy bg-gletcher-white p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">
                      {displayName ?? email}{" "}
                      <span className="type-caption font-normal text-gletcher-navy/55">
                        {email}
                      </span>
                    </p>
                    <p className="type-caption mt-1 text-gletcher-navy/65">
                      {receipt.createdAt
                        .toISOString()
                        .replace("T", " ")
                        .slice(0, 16)}{" "}
                      · {receipt.city} · {receipt.purchaseAt ?? "—"} ·{" "}
                      {receipt.venueNetwork || receipt.venueName || "—"} ·{" "}
                      {receipt.source}
                    </p>
                    <p className="mt-2 text-sm">
                      Gletcher {receipt.gletcherSumRub ?? "—"} ₽ →{" "}
                      <strong>{receipt.proposedEarn ?? "—"}₿</strong>
                      <span className="type-caption text-gletcher-navy/55">
                        {" "}
                        · {statusLabel}
                      </span>
                    </p>
                    {receipt.reviewedBy ? (
                      <p className="type-caption mt-1 text-gletcher-navy/55">
                        Решение: {receipt.reviewedBy}
                        {receipt.reviewedAt
                          ? ` · ${receipt.reviewedAt
                              .toISOString()
                              .replace("T", " ")
                              .slice(0, 16)}`
                          : ""}
                      </p>
                    ) : null}
                    {receipt.staffNote ? (
                      <p className="type-caption mt-1 text-gletcher-navy/55">
                        Заметка: {receipt.staffNote}
                      </p>
                    ) : null}
                    {receipt.photoObjectKey ? (
                      <ReceiptPhotoPreview
                        receiptId={receipt.id}
                        objectKey={receipt.photoObjectKey}
                      />
                    ) : receipt.legacyPhotoUrl ? (
                      <p className="type-caption mt-2">
                        <a
                          href={receipt.legacyPhotoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold text-gletcher-navy underline-offset-2 hover:underline"
                        >
                          Фото (legacy URL)
                        </a>
                      </p>
                    ) : (
                      <p className="type-caption mt-2 text-gletcher-navy/50">
                        Без фото
                      </p>
                    )}
                  </div>
                  {canDecide ? (
                    <ReceiptActions receiptId={receipt.id} />
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function FilterChip({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      className={`rounded border px-2.5 py-1 text-xs font-semibold tracking-wide uppercase ${
        active
          ? "border-gletcher-navy bg-gletcher-navy text-gletcher-white"
          : "border-gletcher-navy/30 text-gletcher-navy/70 hover:border-gletcher-navy/50"
      }`}
    >
      {children}
    </a>
  );
}
