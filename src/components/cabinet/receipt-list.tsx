import { Badge, EmptyState } from "@/components/ui/feedback";
import { CABINET_COPY } from "@/content/cabinet";
import type { CabinetReceiptRow } from "./types";
import styles from "./receipt-list.module.css";

const STATUS_LABEL: Record<string, string> = {
  pending_staff: "На проверке",
  pending_upload: "Черновик",
  verified: "Начислено",
  rejected: "Отклонён",
};

export function CabinetReceiptList({ receipts }: { receipts: CabinetReceiptRow[] }) {
  if (receipts.length === 0) {
    return <EmptyState title={CABINET_COPY.historyEmpty} />;
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
            {r.photoHref ? (
              <p className={styles.meta}>
                <a
                  href={r.photoHref}
                  className={styles.photoLink}
                  {...(r.photoExternal
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                >
                  Фото чека
                </a>
              </p>
            ) : null}
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
