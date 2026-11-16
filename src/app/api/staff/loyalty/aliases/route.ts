import { NextResponse } from "next/server";
import { normalizeGtinDigits } from "@/content/product-gtins";
import { getDb } from "@/server/db/client";
import {
  loadActiveAliases,
  upsertReceiptAlias,
} from "@/server/loyalty/aliases";
import { normalizeReceiptAlias } from "@/server/loyalty/normalize-alias";
import { requireStaffAuth } from "@/server/staff/request-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = await requireStaffAuth(request);
  if (!auth.ok) return auth.response;
  try {
    const aliases = await loadActiveAliases(getDb());
    return NextResponse.json({ ok: true, aliases, count: aliases.length });
  } catch (err) {
    console.error(
      "[staff/loyalty/aliases GET]",
      err instanceof Error ? err.message : err,
    );
    return NextResponse.json(
      { ok: false, code: "db_error" },
      { status: 503 },
    );
  }
}

/**
 * Upsert alias and/or GTIN mapping.
 * Body: { alias?: string, gtin?: string, productSlug?: string, active?: boolean }
 */
export async function POST(request: Request) {
  const auth = await requireStaffAuth(request);
  if (!auth.ok) return auth.response;

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json(
      { ok: false, code: "invalid_body" },
      { status: 400 },
    );
  }

  const rawAlias = body.alias != null ? String(body.alias) : "";
  const rawGtin = body.gtin != null ? String(body.gtin) : "";
  const gtin = rawGtin ? normalizeGtinDigits(rawGtin) : null;
  if (rawGtin && !gtin) {
    return NextResponse.json(
      { ok: false, code: "invalid_gtin" },
      { status: 400 },
    );
  }

  const aliasNormalized = rawAlias
    ? normalizeReceiptAlias(rawAlias)
    : gtin
      ? `gtin ${gtin}`
      : "";
  if (!aliasNormalized) {
    return NextResponse.json(
      { ok: false, code: "alias_or_gtin_required" },
      { status: 400 },
    );
  }

  try {
    const result = await upsertReceiptAlias(getDb(), {
      aliasNormalized,
      productSlug: body.productSlug ? String(body.productSlug) : null,
      gtin,
      active: body.active === false ? false : true,
    });
    if (!result.ok) {
      return NextResponse.json(
        { ok: false, code: result.code },
        { status: 400 },
      );
    }
    return NextResponse.json({
      ok: true,
      created: result.created,
      alias: result.alias,
    });
  } catch (err) {
    console.error(
      "[staff/loyalty/aliases POST]",
      err instanceof Error ? err.message : err,
    );
    return NextResponse.json(
      { ok: false, code: "db_error" },
      { status: 503 },
    );
  }
}
