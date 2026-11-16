import { NextResponse } from "next/server";
import { getDb } from "@/server/db/client";
import {
  createAgentApplication,
  latestOpenAgentApplication,
  listAgentApplicationsForMember,
} from "@/server/loyalty/agent-applications";
import { requireMemberSession } from "@/server/loyalty/member-auth";
import {
  AGENT_APP_JSON_MAX_BYTES,
  AGENT_APP_RATE,
  boundaryJsonResponse,
  checkRateLimit,
  clientIpFromRequest,
  readJsonBody,
} from "@/server/http/public-boundary";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireMemberSession();
  if (!auth.ok) return auth.response;
  try {
    const applications = await listAgentApplicationsForMember(
      getDb(),
      auth.member.id,
    );
    return NextResponse.json({ ok: true, applications });
  } catch (err) {
    console.error(
      "[loyalty/agent-applications GET]",
      err instanceof Error ? err.message : err,
    );
    return NextResponse.json(
      { ok: false, code: "db_error" },
      { status: 503 },
    );
  }
}

export async function POST(request: Request) {
  const auth = await requireMemberSession();
  if (!auth.ok) return auth.response;

  const limited = checkRateLimit({
    key: `agent-app:${auth.member.id}:${clientIpFromRequest(request)}`,
    ...AGENT_APP_RATE,
  });
  if (!limited.ok) return boundaryJsonResponse(limited);

  const parsed = await readJsonBody(request, AGENT_APP_JSON_MAX_BYTES);
  if (!parsed.ok) {
    return NextResponse.json(
      { ok: false, code: parsed.code, message: parsed.message },
      { status: parsed.status },
    );
  }
  if (!parsed.value || typeof parsed.value !== "object") {
    return NextResponse.json(
      { ok: false, code: "invalid_json" },
      { status: 400 },
    );
  }
  const body = parsed.value as Record<string, unknown>;

  const phone = String(body.phone ?? auth.member.phone ?? "").trim();
  const city = String(body.city ?? auth.member.city ?? "").trim();
  const venueName = String(body.venueName ?? "").trim();
  const venueType = String(body.venueType ?? "").trim();
  const venueAddress = String(body.venueAddress ?? "").trim();
  const venueBoss = String(body.venueBoss ?? "").trim() || null;
  const comment = String(body.comment ?? "").trim() || null;

  if (!phone || !city || !venueName || !venueType || !venueAddress) {
    return NextResponse.json(
      { ok: false, code: "missing_fields" },
      { status: 400 },
    );
  }

  try {
    const result = await createAgentApplication(getDb(), {
      memberId: auth.member.id,
      phone,
      city,
      venueName,
      venueType,
      venueAddress,
      venueBoss,
      comment,
    });

    if (!result.ok) {
      if (result.code === "already_pending") {
        return NextResponse.json(
          {
            ok: false,
            code: "already_pending",
            application: result.application,
          },
          { status: 409 },
        );
      }
      return NextResponse.json(
        { ok: false, code: "invalid_fields" },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        ok: true,
        replay: result.replay,
        application: {
          id: result.application.id,
          status: result.application.status,
          statusLabel: result.application.statusLabel,
          venueName: result.application.venueName,
          publicNote: result.application.publicNote,
          createdAt: result.application.createdAt,
        },
      },
      { status: result.replay ? 200 : 201 },
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[loyalty/agent-applications POST]", msg);
    return NextResponse.json(
      { ok: false, code: "db_error" },
      { status: 503 },
    );
  }
}
