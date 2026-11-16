import { NextResponse } from "next/server";
import { getDb } from "@/server/db/client";
import { approveReceipt, rejectReceipt } from "@/server/loyalty/receipts";
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

  let action = "";
  let note: string | null = null;
  try {
    const raw = (await request.json()) as { action?: string; note?: string };
    action = String(raw.action ?? "");
    note = raw.note ? String(raw.note) : null;
  } catch {
    return NextResponse.json(
      { ok: false, code: "invalid_json", message: "Malformed JSON" },
      { status: 400 },
    );
  }

  try {
    const db = getDb();
    if (action === "approve") {
      const result = await approveReceipt(db, {
        receiptId: id,
        actor: auth.actor.id,
        note,
      });
      if (!result.ok) {
        const status = result.code === "not_found" ? 404 : 400;
        return NextResponse.json(
          { ok: false, code: result.code },
          { status },
        );
      }
      return NextResponse.json({
        ok: true,
        receipt: result.receipt,
        already: result.already,
      });
    }
    if (action === "reject") {
      const result = await rejectReceipt(db, {
        receiptId: id,
        actor: auth.actor.id,
        note,
      });
      if (!result.ok) {
        const status = result.code === "not_found" ? 404 : 400;
        return NextResponse.json(
          { ok: false, code: result.code },
          { status },
        );
      }
      return NextResponse.json({ ok: true, receipt: result.receipt });
    }
    return NextResponse.json(
      { ok: false, code: "invalid_action", message: "approve|reject" },
      { status: 400 },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown";
    console.error("[staff/loyalty/receipts/:id/actions]", message);
    return NextResponse.json(
      { ok: false, code: "db_error", message: "Failed to apply action" },
      { status: 503 },
    );
  }
}
