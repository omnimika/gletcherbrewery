import { NextResponse } from "next/server";
import { getDb } from "@/server/db/client";
import {
  applyStaffCommand,
  parseStaffCommandBody,
} from "@/server/staff/commands";
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

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, code: "invalid_json", message: "Malformed JSON" },
      { status: 400 },
    );
  }

  const parsed = parseStaffCommandBody(raw);
  if (!parsed.ok) {
    return NextResponse.json(
      { ok: false, code: parsed.code, message: parsed.message },
      { status: 400 },
    );
  }

  try {
    const db = getDb();
    const result = await applyStaffCommand(db, id, auth.actor, parsed.input);
    if (!result.ok) {
      const status = result.code === "not_found" ? 404 : 400;
      return NextResponse.json(
        { ok: false, code: result.code, message: result.message },
        { status },
      );
    }
    return NextResponse.json({ ok: true, lead: result.lead });
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown";
    console.error("[staff/leads/:id/actions]", message);
    return NextResponse.json(
      { ok: false, code: "db_error", message: "Failed to apply action" },
      { status: 503 },
    );
  }
}
