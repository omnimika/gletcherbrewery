import { NextResponse } from "next/server";
import { getDb } from "@/server/db/client";
import {
  getLocationSummary,
  listLocations,
} from "@/server/retail/locations";
import { createLocation } from "@/server/retail/location-mutations";
import { requireStaffAuth } from "@/server/staff/request-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = await requireStaffAuth(request);
  if (!auth.ok) return auth.response;

  try {
    const url = new URL(request.url);
    const summaryOnly = url.searchParams.get("summary") === "1";
    if (summaryOnly) {
      const summary = await getLocationSummary(getDb());
      return NextResponse.json({ ok: true, summary });
    }

    const list = await listLocations(getDb(), {
      chainId: url.searchParams.get("chainId"),
      status: url.searchParams.get("status"),
      q: url.searchParams.get("q"),
      limit: Number(url.searchParams.get("limit") || 100),
      offset: Number(url.searchParams.get("offset") || 0),
    });
    return NextResponse.json({ ok: true, ...list });
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown";
    console.error("[staff/retail/locations GET]", message);
    return NextResponse.json(
      { ok: false, code: "db_error", message: "Failed to load locations" },
      { status: 503 },
    );
  }
}

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
  const chainId =
    typeof record.chainId === "string" && record.chainId.trim()
      ? record.chainId.trim()
      : null;
  const chainTitle =
    typeof record.chainTitle === "string" && record.chainTitle.trim()
      ? record.chainTitle.trim()
      : null;
  const adress = typeof record.adress === "string" ? record.adress : "";
  const longitude = Number(record.longitude);
  const latitude = Number(record.latitude);
  const actor =
    request.headers.get("x-staff-actor")?.trim() || auth.actor.id || "staff";

  try {
    const result = await createLocation(getDb(), {
      chainId,
      chainTitle,
      adress,
      longitude,
      latitude,
      city: typeof record.city === "string" ? record.city : null,
      type: typeof record.type === "string" ? record.type : null,
      packing: typeof record.packing === "string" ? record.packing : null,
      syncGeoJson: record.syncGeoJson !== false,
      actor,
    });
    if (!result.ok) {
      return NextResponse.json(result, { status: 400 });
    }
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown";
    console.error("[staff/retail/locations POST]", message);
    return NextResponse.json(
      { ok: false, code: "db_error", message: "Failed to create location" },
      { status: 503 },
    );
  }
}
