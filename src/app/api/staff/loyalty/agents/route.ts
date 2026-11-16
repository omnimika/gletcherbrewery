import { NextResponse } from "next/server";
import { getDb } from "@/server/db/client";
import { listAgentApplicationsForStaff } from "@/server/loyalty/agent-applications";
import { requireStaffAuth } from "@/server/staff/request-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = await requireStaffAuth(request);
  if (!auth.ok) return auth.response;

  const url = new URL(request.url);
  const status = url.searchParams.get("status");
  const limitRaw = Number(url.searchParams.get("limit") ?? "100");
  const limit = Number.isFinite(limitRaw) ? limitRaw : 100;

  try {
    const rows = await listAgentApplicationsForStaff(getDb(), {
      status,
      limit,
    });
    return NextResponse.json({
      ok: true,
      applications: rows.map(({ application, email, displayName, statusLabel }) => ({
        id: application.id,
        status: application.status,
        statusLabel,
        phone: application.phone,
        city: application.city,
        venueName: application.venueName,
        venueType: application.venueType,
        venueAddress: application.venueAddress,
        venueBoss: application.venueBoss,
        comment: application.comment,
        publicNote: application.publicNote,
        reviewedBy: application.reviewedBy,
        reviewedAt: application.reviewedAt,
        createdAt: application.createdAt,
        member: { email, displayName },
      })),
    });
  } catch (err) {
    console.error(
      "[staff/loyalty/agents GET]",
      err instanceof Error ? err.message : err,
    );
    return NextResponse.json(
      { ok: false, code: "db_error" },
      { status: 503 },
    );
  }
}
