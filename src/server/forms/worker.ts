/**
 * B2 delivery worker: lease pending jobs, call adapters, record attempts.
 * Run via `npm run worker:delivery` — not inside Next request handlers.
 */

import { randomUUID } from "node:crypto";
import { and, eq, or, sql } from "drizzle-orm";
import type { AppDb } from "@/server/db/client";
import {
  deliveryAttempts,
  deliveryJobs,
  formSubmissions,
} from "@/server/db/schema";
import type { DeliveryAdapter, DeliveryAttemptResult } from "./delivery-adapters";
import { FakeConfigRequiredAdapter } from "./delivery-adapters";
import {
  readTelegramConfigFromEnv,
  TelegramDeliveryAdapter,
} from "./telegram-adapter";
import type { LeadFields } from "./telegram-message";
import {
  readTelegramAgentConfigFromEnv,
  TelegramAgentDeliveryAdapter,
} from "@/server/loyalty/telegram-agent-adapter";

const LEASE_MS = 60_000;
const MAX_ATTEMPTS = 8;

export type WorkerLoopOptions = {
  db: AppDb;
  owner?: string;
  adapters?: DeliveryAdapter[];
  batchSize?: number;
  now?: () => Date;
};

function backoffMs(attempts: number, retryAfterMs?: number): number {
  if (retryAfterMs && retryAfterMs > 0) return retryAfterMs;
  const base = Math.min(60_000, 1_000 * 2 ** Math.min(attempts, 6));
  const jitter = Math.floor(Math.random() * 500);
  return base + jitter;
}

/** Pure claim eligibility (unit-tested). Expired leased are reclaimable. */
export function isJobClaimableAt(
  job: {
    status: string;
    nextAttemptAt: Date | string;
    leaseExpiresAt: Date | string | null;
  },
  now: Date,
): boolean {
  const nextAt = new Date(job.nextAttemptAt).getTime();
  const leaseExp = job.leaseExpiresAt
    ? new Date(job.leaseExpiresAt).getTime()
    : null;

  if (job.status === "pending" || job.status === "retry") {
    if (nextAt > now.getTime()) return false;
    if (leaseExp != null && leaseExp >= now.getTime()) return false;
    return true;
  }

  if (job.status === "leased") {
    return leaseExp != null && leaseExp < now.getTime();
  }

  return false;
}

export function buildDefaultAdapters(db: AppDb): DeliveryAdapter[] {
  const adapters: DeliveryAdapter[] = [];

  const tg = readTelegramConfigFromEnv();
  if (tg) {
    adapters.push(
      new TelegramDeliveryAdapter(tg, async (submissionId) => {
        const rows = await db
          .select({
            formId: formSubmissions.formId,
            sourcePath: formSubmissions.sourcePath,
            locale: formSubmissions.locale,
            fields: formSubmissions.fields,
          })
          .from(formSubmissions)
          .where(eq(formSubmissions.id, submissionId))
          .limit(1);
        const row = rows[0];
        if (!row) throw new Error("submission_not_found");
        return {
          formId: row.formId,
          sourcePath: row.sourcePath,
          locale: row.locale,
          fields: row.fields as LeadFields,
        };
      }),
    );
  } else {
    adapters.push(new FakeConfigRequiredAdapter("telegram"));
  }

  const tgAgent = readTelegramAgentConfigFromEnv();
  if (tgAgent) {
    adapters.push(new TelegramAgentDeliveryAdapter(tgAgent, db));
  } else {
    adapters.push(new FakeConfigRequiredAdapter("telegram_agent"));
  }

  // Google Sheets lead export: cancelled (owner 09.11, 152-FZ). No adapter.
  return adapters;
}

async function claimJobs(
  db: AppDb,
  owner: string,
  leaseToken: string,
  batchSize: number,
  now: Date,
): Promise<(typeof deliveryJobs.$inferSelect)[]> {
  const leaseUntil = new Date(now.getTime() + LEASE_MS);
  const nowIso = now.toISOString();

  return db.transaction(async (tx) => {
    // R01: reclaim expired leased alongside due pending/retry.
    const candidates = await tx.execute(sql`
      SELECT id::text AS id
      FROM app.delivery_jobs
      WHERE (
          (
            status IN ('pending', 'retry')
            AND next_attempt_at <= ${nowIso}::timestamptz
            AND (
              lease_expires_at IS NULL
              OR lease_expires_at < ${nowIso}::timestamptz
            )
          )
          OR (
            status = 'leased'
            AND lease_expires_at IS NOT NULL
            AND lease_expires_at < ${nowIso}::timestamptz
          )
        )
      ORDER BY next_attempt_at ASC
      LIMIT ${batchSize}
      FOR UPDATE SKIP LOCKED
    `);

    const rows = candidates as unknown as Array<{ id: string }>;
    const idList = Array.from(rows ?? []).map((r) => r.id).filter(Boolean);
    if (!idList.length) return [];

    const claimed: (typeof deliveryJobs.$inferSelect)[] = [];
    for (const id of idList) {
      const updated = await tx
        .update(deliveryJobs)
        .set({
          status: "leased",
          leaseOwner: owner,
          leaseToken,
          leaseExpiresAt: leaseUntil,
          updatedAt: now,
        })
        .where(
          and(
            eq(deliveryJobs.id, id),
            or(
              eq(deliveryJobs.status, "pending"),
              eq(deliveryJobs.status, "retry"),
              and(
                eq(deliveryJobs.status, "leased"),
                sql`${deliveryJobs.leaseExpiresAt} < ${nowIso}::timestamptz`,
              ),
            ),
          ),
        )
        .returning();
      if (updated[0]) claimed.push(updated[0]);
    }
    return claimed;
  });
}

const leaseFence = (jobId: string, leaseToken: string, owner: string) =>
  and(
    eq(deliveryJobs.id, jobId),
    eq(deliveryJobs.leaseToken, leaseToken),
    eq(deliveryJobs.leaseOwner, owner),
    eq(deliveryJobs.status, "leased"),
  );

/** Owner decision 09.11.2026: no lead PII to Google Sheets (152-FZ). */
async function cancelSheetsJob(
  db: AppDb,
  job: typeof deliveryJobs.$inferSelect,
  leaseToken: string,
  owner: string,
  now: Date,
): Promise<void> {
  await db.transaction(async (tx) => {
    const fenced = await tx
      .update(deliveryJobs)
      .set({
        status: "cancelled_policy",
        attempts: job.attempts + 1,
        lastError: "sheets_cancelled_152fz",
        leaseOwner: null,
        leaseToken: null,
        leaseExpiresAt: null,
        updatedAt: new Date(),
      })
      .where(leaseFence(job.id, leaseToken, owner))
      .returning();

    if (!fenced[0]) return; // stale lease — drop

    await tx.insert(deliveryAttempts).values({
      jobId: job.id,
      attemptNo: job.attempts + 1,
      outcome: "cancelled_policy",
      sanitizedError: "sheets_cancelled_152fz",
      leaseToken,
      startedAt: now,
      finishedAt: new Date(),
    });
  });
}

/** Exported for fencing tests (stale lease must not finalize). */
export async function finishAttempt(
  db: AppDb,
  job: typeof deliveryJobs.$inferSelect,
  leaseToken: string,
  owner: string,
  result: DeliveryAttemptResult,
  now: Date,
): Promise<{ applied: boolean }> {
  const attemptNo = job.attempts + 1;
  const fence = leaseFence(job.id, leaseToken, owner);

  return db.transaction(async (tx) => {
    // R01 fencing: atomic UPDATE WHERE lease — stale ack cannot finalize.
    let patch: Partial<typeof deliveryJobs.$inferInsert>;

    if (result.outcome === "delivered") {
      patch = {
        status: "delivered",
        attempts: attemptNo,
        remoteReference: result.remoteReference,
        lastError: null,
        leaseOwner: null,
        leaseToken: null,
        leaseExpiresAt: null,
        updatedAt: new Date(),
      };
    } else if (result.outcome === "config_required") {
      patch = {
        status: "blocked_config",
        attempts: attemptNo,
        lastError: result.sanitizedError,
        leaseOwner: null,
        leaseToken: null,
        leaseExpiresAt: null,
        updatedAt: new Date(),
      };
    } else if (result.outcome === "failed" || attemptNo >= MAX_ATTEMPTS) {
      patch = {
        status: "failed",
        attempts: attemptNo,
        lastError: result.sanitizedError,
        leaseOwner: null,
        leaseToken: null,
        leaseExpiresAt: null,
        updatedAt: new Date(),
      };
    } else {
      const delay = backoffMs(
        attemptNo,
        result.outcome === "retryable" ? result.retryAfterMs : undefined,
      );
      patch = {
        status: "retry",
        attempts: attemptNo,
        nextAttemptAt: new Date(Date.now() + delay),
        lastError: result.sanitizedError,
        leaseOwner: null,
        leaseToken: null,
        leaseExpiresAt: null,
        updatedAt: new Date(),
      };
    }

    const fenced = await tx
      .update(deliveryJobs)
      .set(patch)
      .where(fence)
      .returning();

    if (!fenced[0]) {
      return { applied: false };
    }

    await tx.insert(deliveryAttempts).values({
      jobId: job.id,
      attemptNo,
      outcome: result.outcome,
      sanitizedError:
        result.outcome === "delivered" ? null : result.sanitizedError,
      remoteReference:
        result.outcome === "delivered" || result.outcome === "ambiguous"
          ? result.remoteReference ?? null
          : null,
      leaseToken,
      startedAt: now,
      finishedAt: new Date(),
    });

    return { applied: true };
  });
}

export async function processDeliveryBatch(
  options: WorkerLoopOptions,
): Promise<{ processed: number; results: { jobId: string; outcome: string; applied?: boolean }[] }> {
  const owner = options.owner ?? `worker-${process.pid}`;
  const leaseToken = randomUUID();
  const now = options.now?.() ?? new Date();
  const batchSize = options.batchSize ?? 10;
  const adapters =
    options.adapters ?? buildDefaultAdapters(options.db);
  const byDest = new Map(adapters.map((a) => [a.destination, a]));

  const claimed = await claimJobs(
    options.db,
    owner,
    leaseToken,
    batchSize,
    now,
  );

  const results: { jobId: string; outcome: string; applied?: boolean }[] = [];

  for (const job of claimed) {
    if (job.destination === "sheets") {
      await cancelSheetsJob(options.db, job, leaseToken, owner, now);
      results.push({ jobId: job.id, outcome: "cancelled_policy" });
      continue;
    }

    const adapter = byDest.get(
      job.destination as "telegram" | "telegram_agent",
    );
    let result: DeliveryAttemptResult;
    if (!adapter) {
      result = {
        outcome: "failed",
        sanitizedError: `unknown_destination:${job.destination}`,
      };
    } else {
      result = await adapter.deliver({
        id: job.id,
        submissionId: job.submissionId,
        sourceKind: job.sourceKind,
        sourceId: job.sourceId,
        destination: job.destination as "telegram" | "telegram_agent",
        status: job.status,
        attempts: job.attempts,
      });
    }
    const { applied } = await finishAttempt(
      options.db,
      job,
      leaseToken,
      owner,
      result,
      now,
    );
    results.push({
      jobId: job.id,
      outcome: applied ? result.outcome : "stale_lease_dropped",
      applied,
    });
  }

  return { processed: claimed.length, results };
}

/** Poll until idle or maxRounds. */
export async function runDeliveryWorkerLoop(
  options: WorkerLoopOptions & { intervalMs?: number; maxRounds?: number },
): Promise<void> {
  const intervalMs = options.intervalMs ?? 2_000;
  const maxRounds = options.maxRounds ?? Infinity;
  const { touchWorkerHeartbeat } = await import("@/server/ops/worker-heartbeat");
  for (let round = 0; round < maxRounds; round++) {
    try {
      await touchWorkerHeartbeat();
    } catch {
      /* non-fatal: health may show stale */
    }
    const { processed, results } = await processDeliveryBatch(options);
    if (processed > 0) {
      const summary = results.map((r) => r.outcome).join(",");
      console.log(`[delivery-worker] processed=${processed} outcomes=${summary}`);
    }
    if (maxRounds === Infinity) {
      await new Promise((r) => setTimeout(r, intervalMs));
    } else if (processed === 0) {
      break;
    }
  }
}
