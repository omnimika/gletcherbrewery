import { and, count, eq, inArray, isNotNull, lte, min } from "drizzle-orm";
import type { AppDb } from "@/server/db/client";
import { deliveryJobs } from "@/server/db/schema";

export type QueueStatusBucket = {
  status: string;
  destination: string;
  sourceKind: string;
  count: number;
  oldestCreatedAt: string | null;
  oldestNextAttemptAt: string | null;
};

export type QueueSnapshot = {
  at: string;
  byStatus: Record<string, number>;
  buckets: QueueStatusBucket[];
  pendingDueCount: number;
  expiredLeaseCount: number;
  oldestPendingAgeSec: number | null;
  oldestRetryAgeSec: number | null;
  oldestFailedAgeSec: number | null;
  oldestAmbiguousAgeSec: number | null;
};

function toIso(v: Date | string | null | undefined): string | null {
  if (!v) return null;
  if (v instanceof Date) return v.toISOString();
  return String(v);
}

function ageSec(iso: string | null, now: Date): number | null {
  if (!iso) return null;
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return null;
  return Math.max(0, Math.floor((now.getTime() - t) / 1000));
}

/** Aggregate delivery_jobs for ops / staff observability (no PII). */
export async function getQueueSnapshot(
  db: AppDb,
  now: Date = new Date(),
): Promise<QueueSnapshot> {
  const grouped = await db
    .select({
      status: deliveryJobs.status,
      destination: deliveryJobs.destination,
      sourceKind: deliveryJobs.sourceKind,
      count: count(),
      oldestCreatedAt: min(deliveryJobs.createdAt),
      oldestNextAttemptAt: min(deliveryJobs.nextAttemptAt),
    })
    .from(deliveryJobs)
    .groupBy(
      deliveryJobs.status,
      deliveryJobs.destination,
      deliveryJobs.sourceKind,
    );

  const buckets: QueueStatusBucket[] = grouped.map((r) => ({
    status: r.status,
    destination: r.destination,
    sourceKind: r.sourceKind,
    count: Number(r.count),
    oldestCreatedAt: toIso(r.oldestCreatedAt),
    oldestNextAttemptAt: toIso(r.oldestNextAttemptAt),
  }));

  const byStatus = summarizeByStatus(buckets);

  const due = await db
    .select({ count: count() })
    .from(deliveryJobs)
    .where(
      and(
        inArray(deliveryJobs.status, ["pending", "retry"]),
        lte(deliveryJobs.nextAttemptAt, now),
      ),
    );

  const expired = await db
    .select({ count: count() })
    .from(deliveryJobs)
    .where(
      and(
        eq(deliveryJobs.status, "leased"),
        isNotNull(deliveryJobs.leaseExpiresAt),
        lte(deliveryJobs.leaseExpiresAt, now),
      ),
    );

  return {
    at: now.toISOString(),
    byStatus,
    buckets,
    pendingDueCount: Number(due[0]?.count ?? 0),
    expiredLeaseCount: Number(expired[0]?.count ?? 0),
    oldestPendingAgeSec: maxAgeSec(buckets, "pending", now),
    oldestRetryAgeSec: maxAgeSec(buckets, "retry", now),
    oldestFailedAgeSec: maxAgeSec(buckets, "failed", now),
    oldestAmbiguousAgeSec: maxAgeSec(buckets, "ambiguous", now),
  };
}

/** Pure helpers for unit tests. */
export function summarizeByStatus(
  buckets: Array<{ status: string; count: number }>,
): Record<string, number> {
  const out: Record<string, number> = {};
  for (const b of buckets) {
    out[b.status] = (out[b.status] ?? 0) + b.count;
  }
  return out;
}

export function maxAgeSec(
  buckets: Array<{ status: string; oldestCreatedAt: string | null }>,
  status: string,
  now: Date,
): number | null {
  let best: number | null = null;
  for (const b of buckets) {
    if (b.status !== status) continue;
    const a = ageSec(b.oldestCreatedAt, now);
    if (a == null) continue;
    best = best == null ? a : Math.max(best, a);
  }
  return best;
}

/** Public health subset — counts only, no bucket dump. */
export function publicQueueSignals(snapshot: QueueSnapshot): {
  byStatus: Record<string, number>;
  pendingDueCount: number;
  expiredLeaseCount: number;
  oldestPendingAgeSec: number | null;
} {
  return {
    byStatus: snapshot.byStatus,
    pendingDueCount: snapshot.pendingDueCount,
    expiredLeaseCount: snapshot.expiredLeaseCount,
    oldestPendingAgeSec: snapshot.oldestPendingAgeSec,
  };
}
