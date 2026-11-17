import { NextResponse } from "next/server";
import { getDb } from "@/server/db/client";
import { getQueueSnapshot } from "@/server/ops/queue-snapshot";
import { readWorkerHeartbeat } from "@/server/ops/worker-heartbeat";
import {
  requireStaffAuth,
  requireStaffRole,
} from "@/server/staff/request-auth";
import { LEADS_STAFF_ROLES } from "@/server/staff/roles";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Staff queue observability — counts/ages only, no delivery payloads/PII. */
export async function GET(request: Request) {
  const auth = await requireStaffAuth(request);
  if (!auth.ok) return auth.response;
  const roleGate = requireStaffRole(auth, LEADS_STAFF_ROLES);
  if (roleGate) return roleGate.response;

  try {
    const at = new Date();
    const [queue, worker] = await Promise.all([
      getQueueSnapshot(getDb(), at),
      readWorkerHeartbeat(at),
    ]);
    return NextResponse.json({
      ok: true,
      queue,
      worker: {
        present: worker.present,
        heartbeatAt: worker.at,
        ageSec: worker.ageSec,
        stale: worker.stale,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown";
    console.error("[staff/ops/queue]", message);
    return NextResponse.json(
      { ok: false, code: "db_error", message: "Failed to load queue snapshot" },
      { status: 503 },
    );
  }
}
