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
  const page = url.searchParams.get("page");
  const pageSize = url.searchParams.get("pageSize");
  const sort = url.searchParams.get("sort");
  const dir = url.searchParams.get("dir");

  try {
    const result = await listAgentApplicationsForStaff(getDb(), {
      status,
      page: page ?? undefined,
      pageSize: pageSize ?? 50,
      sort,
      dir,
    });
    return NextResponse.json({
      ok: true,
      applications: result.rows.map(
        ({ application, email, displayName, statusLabel }) => ({
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
        }),
      ),
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
      totalPages: result.totalPages,
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
