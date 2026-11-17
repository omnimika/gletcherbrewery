import { NextResponse } from "next/server";
import { getDb } from "@/server/db/client";
import {
  listRecentTilesetPublishRuns,
  runTilesetPublish,
} from "@/server/retail/tileset-publish";
import { requireStaffAuth, requireStaffRole } from "@/server/staff/request-auth";
import { RETAIL_STAFF_ROLES } from "@/server/staff/roles";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = await requireStaffAuth(request);
  if (!auth.ok) return auth.response;
  const roleGate = requireStaffRole(auth, RETAIL_STAFF_ROLES);
  if (roleGate) return roleGate.response;

  try {
    const runs = await listRecentTilesetPublishRuns(getDb(), 8);
    return NextResponse.json({ ok: true, runs });
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown";
    console.error("[staff/retail/tileset-publish GET]", message);
    return NextResponse.json(
      { ok: false, code: "db_error", message: "Failed to load publish runs" },
      { status: 503 },
    );
  }
}

export async function POST(request: Request) {
  const auth = await requireStaffAuth(request);
  if (!auth.ok) return auth.response;
  const roleGate = requireStaffRole(auth, RETAIL_STAFF_ROLES);
  if (roleGate) return roleGate.response;

  let body: unknown = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const mode =
    body &&
    typeof body === "object" &&
    (body as { mode?: unknown }).mode === "live"
      ? "live"
      : "dry_run";

  try {
    const result = await runTilesetPublish(getDb(), {
      mode,
      actor: auth.actor.id,
    });
    if (!result.ok) {
      const status =
        result.code === "publish_blocked"
          ? 409
          : result.code === "uploader_pending"
            ? 501
            : 400;
      return NextResponse.json(
        {
          ok: false,
          code: result.code,
          message: result.message,
          run: result.run ?? null,
        },
        { status },
      );
    }
    return NextResponse.json({ ok: true, run: result.run });
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown";
    console.error("[staff/retail/tileset-publish POST]", message);
    return NextResponse.json(
      { ok: false, code: "db_error", message: "Failed to run publish" },
      { status: 503 },
    );
  }
}
