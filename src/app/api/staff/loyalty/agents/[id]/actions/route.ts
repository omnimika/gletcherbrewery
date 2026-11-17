import { NextResponse } from "next/server";
import { getDb } from "@/server/db/client";
import {
  listAgentApplicationEvents,
  setAgentApplicationStatus,
} from "@/server/loyalty/agent-applications";
import { requireStaffAuth, requireStaffRole } from "@/server/staff/request-auth";
import { LOYALTY_STAFF_ROLES } from "@/server/staff/roles";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: RouteParams) {
  const auth = await requireStaffAuth(request);
  if (!auth.ok) return auth.response;
  const roleGate = requireStaffRole(auth, LOYALTY_STAFF_ROLES);
  if (roleGate) return roleGate.response;

  const { id } = await params;
  if (!id || !/^[0-9a-f-]{36}$/i.test(id)) {
    return NextResponse.json(
      { ok: false, code: "invalid_id" },
      { status: 400 },
    );
  }

  try {
    const events = await listAgentApplicationEvents(getDb(), id);
    return NextResponse.json({ ok: true, events });
  } catch (err) {
    console.error(
      "[staff/loyalty/agents/:id/actions GET]",
      err instanceof Error ? err.message : err,
    );
    return NextResponse.json(
      { ok: false, code: "db_error" },
      { status: 503 },
    );
  }
}

export async function POST(request: Request, { params }: RouteParams) {
  const auth = await requireStaffAuth(request);
  if (!auth.ok) return auth.response;
  const roleGate = requireStaffRole(auth, LOYALTY_STAFF_ROLES);
  if (roleGate) return roleGate.response;

  const { id } = await params;
  if (!id || !/^[0-9a-f-]{36}$/i.test(id)) {
    return NextResponse.json(
      { ok: false, code: "invalid_id", message: "Expected UUID" },
      { status: 400 },
    );
  }

  let status = "";
  let publicNote: string | null | undefined;
  let reason: string | null = null;
  try {
    const raw = (await request.json()) as {
      action?: string;
      status?: string;
      publicNote?: string | null;
      reason?: string | null;
    };
    if (raw.action && raw.action !== "set_status") {
      return NextResponse.json(
        { ok: false, code: "invalid_action", message: "set_status" },
        { status: 400 },
      );
    }
    status = String(raw.status ?? "");
    if ("publicNote" in raw) {
      publicNote = raw.publicNote == null ? null : String(raw.publicNote);
    }
    reason = raw.reason ? String(raw.reason) : null;
  } catch {
    return NextResponse.json(
      { ok: false, code: "invalid_json", message: "Malformed JSON" },
      { status: 400 },
    );
  }

  try {
    const result = await setAgentApplicationStatus(getDb(), {
      applicationId: id,
      status,
      actor: auth.actor.id,
      publicNote,
      reason,
    });

    if (!result.ok) {
      const http =
        result.code === "not_found"
          ? 404
          : result.code === "invalid_status" || result.code === "invalid_note"
            ? 400
            : 400;
      return NextResponse.json({ ok: false, code: result.code }, { status: http });
    }

    return NextResponse.json({
      ok: true,
      already: result.already,
      application: {
        id: result.application.id,
        status: result.application.status,
        publicNote: result.application.publicNote,
        reviewedBy: result.application.reviewedBy,
        reviewedAt: result.application.reviewedAt,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown";
    console.error("[staff/loyalty/agents/:id/actions]", message);
    return NextResponse.json(
      { ok: false, code: "db_error", message: "Failed to apply action" },
      { status: 503 },
    );
  }
}
