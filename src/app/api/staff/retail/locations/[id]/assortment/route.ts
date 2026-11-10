import { NextResponse } from "next/server";
import { getDb } from "@/server/db/client";
import {
  getLocationAssortment,
  setLocationAssortmentMode,
  setLocationProductAvailability,
} from "@/server/retail/location-assortment";
import { requireStaffAuth } from "@/server/staff/request-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(request: Request, ctx: Ctx) {
  const auth = await requireStaffAuth(request);
  if (!auth.ok) return auth.response;
  const { id } = await ctx.params;

  try {
    const detail = await getLocationAssortment(getDb(), id);
    if (!detail) {
      return NextResponse.json(
        { ok: false, code: "not_found", message: "Location not found" },
        { status: 404 },
      );
    }
    return NextResponse.json({ ok: true, location: detail });
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown";
    console.error("[staff/retail/locations/assortment GET]", message);
    return NextResponse.json(
      { ok: false, code: "db_error", message: "Failed to load location assortment" },
      { status: 503 },
    );
  }
}

export async function PATCH(request: Request, ctx: Ctx) {
  const auth = await requireStaffAuth(request);
  if (!auth.ok) return auth.response;
  const { id } = await ctx.params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, code: "invalid_json", message: "Malformed JSON" },
      { status: 400 },
    );
  }

  const actor =
    request.headers.get("x-staff-actor")?.trim() ||
    auth.actor.id ||
    "staff";

  const db = getDb();
  const record = body as Record<string, unknown>;

  try {
    if (record.mode === "inherit" || record.mode === "override") {
      const result = await setLocationAssortmentMode(db, {
        locationId: id,
        mode: record.mode,
        actor,
      });
      if (!result.ok) {
        return NextResponse.json(result, { status: 400 });
      }
      const location = await getLocationAssortment(db, id);
      return NextResponse.json({ ok: true, location });
    }

    if (
      typeof record.productSlug === "string" &&
      typeof record.available === "boolean"
    ) {
      const result = await setLocationProductAvailability(db, {
        locationId: id,
        productSlug: record.productSlug,
        available: record.available,
        actor,
      });
      if (!result.ok) {
        return NextResponse.json(result, { status: 400 });
      }
      const location = await getLocationAssortment(db, id);
      return NextResponse.json({ ok: true, location });
    }

    return NextResponse.json(
      {
        ok: false,
        code: "invalid_body",
        message: "Expected { mode } or { productSlug, available }",
      },
      { status: 400 },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown";
    console.error("[staff/retail/locations/assortment PATCH]", message);
    return NextResponse.json(
      { ok: false, code: "db_error", message: "Failed to update location assortment" },
      { status: 503 },
    );
  }
}
