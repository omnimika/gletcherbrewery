import { cookies } from "next/headers";
import { Banner } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/feedback";
import { getDb } from "@/server/db/client";
import { listPendingReceipts } from "@/server/loyalty/receipts";
import {
  isStaffAuthConfigured,
  STAFF_COOKIE_NAME,
  verifyStaffToken,
} from "@/server/staff/auth";
import { StaffLoginForm } from "../../staff-login-form";
import { ManualReceiptForm } from "./manual-receipt-form";
import { ReceiptActions } from "./receipt-actions";

export const dynamic = "force-dynamic";

export default async function StaffLoyaltyReceiptsPage() {
  if (!isStaffAuthConfigured()) {
    return (
      <Banner tone="frost">
        <p className="font-display text-lg uppercase">STAFF_API_TOKEN не задан</p>
      </Banner>
    );
  }

  const token = (await cookies()).get(STAFF_COOKIE_NAME)?.value;
  if (!verifyStaffToken(token)) {
    return <StaffLoginForm />;
  }

  let rows: Awaited<ReturnType<typeof listPendingReceipts>> = [];
  let error: string | null = null;
  try {
    rows = await listPendingReceipts(getDb(), 100);
  } catch {
    error = "База недоступна — проверьте embedded PostgreSQL.";
  }

  return (
    <div className="space-y-[var(--grid-gap)]">
      <h1 className="font-display text-[clamp(1.75rem,4vw,2.75rem)] leading-none font-extrabold tracking-wide text-gletcher-navy uppercase">
        Чеки лояльности
      </h1>
      <p className="type-body-small max-w-2xl text-gletcher-navy/70">
        Очередь staff: ручной fallback и будущие QR/OCR. Одобрение пишет{" "}
        <code className="text-xs">check_earn</code> в ledger (5%).
      </p>

      <ManualReceiptForm />

      {error ? (
        <Banner tone="frost">
          <p>{error}</p>
        </Banner>
      ) : null}

      {rows.length === 0 && !error ? (
        <EmptyState title="Очередь пуста" body="Новых pending-чеков нет." />
      ) : (
        <ul className="grid gap-3">
          {rows.map(({ receipt, email, displayName }) => (
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
                    {receipt.city} · {receipt.purchaseAt} ·{" "}
                    {receipt.venueNetwork || receipt.venueName || "—"} ·{" "}
                    {receipt.source} · {receipt.status}
                  </p>
                  <p className="mt-2 text-sm">
                    Gletcher {receipt.gletcherSumRub ?? "—"} ₽ →{" "}
                    <strong>{receipt.proposedEarn ?? "—"}₿</strong>
                    {receipt.photoObjectKey ? (
                      <span className="type-caption text-gletcher-navy/50">
                        {" "}
                        · photo {receipt.photoObjectKey}
                      </span>
                    ) : null}
                  </p>
                </div>
                <ReceiptActions receiptId={receipt.id} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
