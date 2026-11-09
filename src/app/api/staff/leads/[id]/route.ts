import { NextResponse } from "next/server";
import { getDb } from "@/server/db/client";
import { getStaffLeadDetail } from "@/server/staff/commands";
import { requireStaffAuth } from "@/server/staff/request-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: RouteParams) {
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
    const detail = await getStaffLeadDetail(db, id);
    if (!detail) {
      return NextResponse.json(
        { ok: false, code: "not_found", message: "Lead not found" },
        { status: 404 },
      );
    }
    return NextResponse.json({ ok: true, ...detail });
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown";
    console.error("[staff/leads/:id]", message);
    return NextResponse.json(
      { ok: false, code: "db_error", message: "Failed to load lead" },
      { status: 503 },
    );
  }
}
