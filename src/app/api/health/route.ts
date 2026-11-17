import { NextResponse } from "next/server";
import { getDb } from "@/server/db/client";
import {
  getQueueSnapshot,
  publicQueueSignals,
} from "@/server/ops/queue-snapshot";
import { readWorkerHeartbeat } from "@/server/ops/worker-heartbeat";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Public liveness — no secrets, no PII.
 * 503 only when DB unreachable. Worker missing/stale → degraded flag (200).
 * Full queue dump: GET /api/staff/ops/queue (staff auth).
 */
export async function GET() {
  const at = new Date();
  let dbOk = false;
  let queue: ReturnType<typeof publicQueueSignals> | null = null;
  try {
    const snap = await getQueueSnapshot(getDb(), at);
    dbOk = true;
    queue = publicQueueSignals(snap);
  } catch {
    dbOk = false;
  }

  const worker = await readWorkerHeartbeat(at);
  const workerState = !worker.present
    ? "missing"
    : worker.stale
      ? "stale"
      : "up";
  const degraded = dbOk && workerState !== "up";

  return NextResponse.json(
    {
      ok: dbOk,
      degraded,
      at: at.toISOString(),
      checks: {
        db: dbOk ? "up" : "down",
        worker: workerState,
      },
      worker: {
        heartbeatAt: worker.at,
        ageSec: worker.ageSec,
        stale: worker.stale,
      },
      queue,
    },
    {
      status: dbOk ? 200 : 503,
      headers: { "cache-control": "no-store" },
    },
  );
}
