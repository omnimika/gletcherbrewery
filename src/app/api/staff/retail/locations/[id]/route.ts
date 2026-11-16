import { NextResponse } from "next/server";
import { getDb } from "@/server/db/client";
import { deleteLocation } from "@/server/retail/location-mutations";
import { requireStaffAuth } from "@/server/staff/request-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function DELETE(request: Request, ctx: Ctx) {
  const auth = await requireStaffAuth(request);
  if (!auth.ok) return auth.response;
  const { id } = await ctx.params;

  const url = new URL(request.url);
  const syncGeoJson = url.searchParams.get("syncGeoJson") !== "0";
  const actor =
    request.headers.get("x-staff-actor")?.trim() || auth.actor.id || "staff";

  try {
    const result = await deleteLocation(getDb(), {
      locationId: id,
      syncGeoJson,
      actor,
    });
    if (!result.ok) {
      return NextResponse.json(result, {
        status: result.code === "not_found" ? 404 : 400,
      });
    }
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown";
    console.error("[staff/retail/locations DELETE]", message);
    return NextResponse.json(
      { ok: false, code: "db_error", message: "Failed to delete location" },
      { status: 503 },
    );
  }
}
