import { NextResponse } from "next/server";
import { getDb } from "@/server/db/client";
import { replayDeliveryJob } from "@/server/staff/commands";
import { requireStaffAuth } from "@/server/staff/request-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: RouteParams) {
  const auth = await requireStaffAuth(request);
  if (!auth.ok) return auth.response;

  const { id } = await params;
  if (!id || !/^[0-9a-f-]{36}$/i.test(id)) {
    return NextResponse.json(
      { ok: false, code: "invalid_id", message: "Expected UUID" },
      { status: 400 },
    );
  }

  try {
    const db = getDb();
    const result = await replayDeliveryJob(db, id, auth.actor);
    if (!result.ok) {
      const status =
        result.code === "not_found"
          ? 404
          : result.code === "not_replayable"
            ? 409
            : 400;
      return NextResponse.json(
        { ok: false, code: result.code, message: result.message },
        { status },
      );
    }
    return NextResponse.json({
      ok: true,
      jobId: result.jobId,
      previousStatus: result.previousStatus,
      status: "pending",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown";
    console.error("[staff/delivery-jobs/:id/replay]", message);
    return NextResponse.json(
      { ok: false, code: "db_error", message: "Failed to replay job" },
      { status: 503 },
    );
  }
}
