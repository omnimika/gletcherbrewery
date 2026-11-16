import { Badge, EmptyState } from "@/components/ui/feedback";
import { LK_COPY } from "@/content/members-lk";
import type { LkReceiptRow } from "./types";
import styles from "./receipt-list.module.css";

const STATUS_LABEL: Record<string, string> = {
  pending_staff: "На проверке",
  pending_upload: "Черновик",
  verified: "Начислено",
  rejected: "Отклонён",
};

export function LkReceiptList({ receipts }: { receipts: LkReceiptRow[] }) {
  if (receipts.length === 0) {
    return <EmptyState title={LK_COPY.historyEmpty} />;
  }

  return (
    <ul className={styles.list}>
      {receipts.map((r) => (
        <li key={r.id} className={styles.item}>
          <div>
            <p className={styles.primary}>
              {r.purchaseAt ?? "—"} · {r.sum ?? "?"} ₽
              {r.proposedEarn != null ? ` · ~${r.proposedEarn} ₿` : ""}
            </p>
            <p className={styles.meta}>
              {[r.city, r.venue].filter(Boolean).join(" · ") || "—"}
            </p>
          </div>
          <Badge
            tone={
              r.status === "verified"
                ? "new"
                : r.status === "rejected"
                  ? "red"
                  : "muted"
            }
          >
            {STATUS_LABEL[r.status] ?? r.status}
          </Badge>
        </li>
      ))}
    </ul>
  );
}
