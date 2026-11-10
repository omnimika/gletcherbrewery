import { Badge } from "@/components/ui/feedback";
import styles from "./panel.module.css";

export type LkReceiptRow = {
  id: string;
  purchaseAt: string | null;
  city: string | null;
  venue: string | null;
  sum: string | null;
  proposedEarn: number | null;
  status: string;
};

const STATUS_LABEL: Record<string, string> = {
  pending_staff: "На проверке",
  pending_upload: "Черновик",
  verified: "Начислено",
  rejected: "Отклонён",
};

export function LkPurchasesPanel({ receipts }: { receipts: LkReceiptRow[] }) {
  return (
    <div className={styles.stack}>
      <section className={styles.card}>
        <h2 className={styles.h2}>Чеки и начисления</h2>
        {receipts.length === 0 ? (
          <p className={styles.muted}>Пока нет загрузок.</p>
        ) : (
          <ul className={styles.list}>
            {receipts.map((r) => (
              <li key={r.id} className={styles.listItem}>
                <div>
                  <p>
                    {r.purchaseAt ?? "—"} · {r.city ?? "—"}
                  </p>
                  <p className={styles.caption}>
                    {r.venue ?? "—"} · {r.sum ?? "?"} ₽
                    {r.proposedEarn != null ? ` · ~${r.proposedEarn} ₿` : ""}
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
        )}
        <p className={styles.caption}>
          История заказов магазина / экскурсий появится после переноса spend.
        </p>
      </section>
    </div>
  );
}
