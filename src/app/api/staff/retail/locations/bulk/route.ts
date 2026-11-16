import { NextResponse } from "next/server";
import { getDb } from "@/server/db/client";
import {
  bulkDeleteLocations,
  bulkUpdateLocations,
} from "@/server/retail/location-mutations";
import { requireStaffAuth } from "@/server/staff/request-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const auth = await requireStaffAuth(request);
  if (!auth.ok) return auth.response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, code: "invalid_json", message: "Malformed JSON" },
      { status: 400 },
    );
  }

  const record = body as Record<string, unknown>;
  const action = record.action;
  const locationIds = Array.isArray(record.locationIds)
    ? record.locationIds.filter((id): id is string => typeof id === "string")
    : [];
  const syncGeoJson = record.syncGeoJson !== false;
  const actor =
    request.headers.get("x-staff-actor")?.trim() || auth.actor.id || "staff";

  if (
    action !== "delete" &&
    action !== "set_chain" &&
    action !== "set_city"
  ) {
    return NextResponse.json(
      {
        ok: false,
        code: "invalid_action",
        message: "action: delete | set_chain | set_city",
      },
      { status: 400 },
    );
  }

  try {
    const db = getDb();
    if (action === "delete") {
      const result = await bulkDeleteLocations(db, {
        locationIds,
        syncGeoJson,
        actor,
      });
      if (!result.ok) {
        return NextResponse.json(result, { status: 400 });
      }
      return NextResponse.json(result);
    }

    const result = await bulkUpdateLocations(db, {
      locationIds,
      action,
      chainId:
        typeof record.chainId === "string" && record.chainId.trim()
          ? record.chainId.trim()
          : null,
      chainTitle:
        typeof record.chainTitle === "string" && record.chainTitle.trim()
          ? record.chainTitle.trim()
          : null,
      city: typeof record.city === "string" ? record.city : null,
      syncGeoJson,
      actor,
    });
    if (!result.ok) {
      return NextResponse.json(result, { status: 400 });
    }
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown";
    console.error("[staff/retail/locations/bulk POST]", message);
    return NextResponse.json(
      { ok: false, code: "db_error", message: "Failed to apply bulk action" },
      { status: 503 },
    );
  }
}
