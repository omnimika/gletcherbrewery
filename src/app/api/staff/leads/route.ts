import { NextResponse } from "next/server";
import { getDb } from "@/server/db/client";
import { isWorkflowStatus } from "@/server/staff/contracts";
import { listStaffLeads } from "@/server/staff/commands";
import { requireStaffAuth } from "@/server/staff/request-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = await requireStaffAuth(request);
  if (!auth.ok) return auth.response;

  const url = new URL(request.url);
  const workflowStatusRaw = url.searchParams.get("workflowStatus");
  const formId = url.searchParams.get("formId") ?? undefined;
  const page = url.searchParams.get("page");
  const pageSize = url.searchParams.get("pageSize");
  const limit = Number(url.searchParams.get("limit") ?? "50");
  const offset = Number(url.searchParams.get("offset") ?? "0");

  const workflowStatus =
    workflowStatusRaw && isWorkflowStatus(workflowStatusRaw)
      ? workflowStatusRaw
      : undefined;

  try {
    const db = getDb();
    const result = await listStaffLeads(db, {
      workflowStatus,
      formId,
      page: page ?? undefined,
      pageSize: pageSize ?? undefined,
      limit: Number.isFinite(limit) ? limit : 50,
      offset: Number.isFinite(offset) ? offset : 0,
    });
    return NextResponse.json({
      ok: true,
      leads: result.rows,
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
      totalPages: result.totalPages,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown";
    console.error("[staff/leads]", message);
    return NextResponse.json(
      { ok: false, code: "db_error", message: "Failed to list leads" },
      { status: 503 },
    );
  }
}
