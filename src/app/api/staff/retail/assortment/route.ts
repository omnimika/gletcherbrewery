import { NextResponse } from "next/server";
import { getDb } from "@/server/db/client";
import {
  getAssortmentMatrix,
  setChainProductAvailability,
} from "@/server/retail/assortment";
import { requireStaffAuth } from "@/server/staff/request-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = await requireStaffAuth(request);
  if (!auth.ok) return auth.response;

  try {
    const matrix = await getAssortmentMatrix(getDb());
    return NextResponse.json({ ok: true, ...matrix });
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown";
    console.error("[staff/retail/assortment GET]", message);
    return NextResponse.json(
      { ok: false, code: "db_error", message: "Failed to load assortment" },
      { status: 503 },
    );
  }
}

export async function PATCH(request: Request) {
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

  if (!body || typeof body !== "object") {
    return NextResponse.json(
      { ok: false, code: "invalid_body", message: "Expected object" },
      { status: 400 },
    );
  }

  const { chainId, productSlug, available } = body as {
    chainId?: unknown;
    productSlug?: unknown;
    available?: unknown;
  };

  if (
    typeof chainId !== "string" ||
    !/^[0-9a-f-]{36}$/i.test(chainId) ||
    typeof productSlug !== "string" ||
    typeof available !== "boolean"
  ) {
    return NextResponse.json(
      {
        ok: false,
        code: "invalid_body",
        message: "chainId (uuid), productSlug, available (boolean) required",
      },
      { status: 400 },
    );
  }

  try {
    const result = await setChainProductAvailability(getDb(), {
      chainId,
      productSlug,
      available,
      actor: auth.actor.id,
    });
    if (!result.ok) {
      const status = result.code === "not_found" ? 404 : 400;
      return NextResponse.json(
        { ok: false, code: result.code, message: result.message },
        { status },
      );
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown";
    console.error("[staff/retail/assortment PATCH]", message);
    return NextResponse.json(
      { ok: false, code: "db_error", message: "Failed to update cell" },
      { status: 503 },
    );
  }
}
