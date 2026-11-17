import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/server/db/client";
import { loyaltyReceipts } from "@/server/db/schema";
import { readReceiptPhotoLocal } from "@/server/loyalty/photo-store";
import {
  requireStaffAuth,
  requireStaffRole,
} from "@/server/staff/request-auth";
import { LOYALTY_STAFF_ROLES } from "@/server/staff/roles";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

/**
 * Staff-only receipt photo stream.
 * Today: local `.tmp/loyalty-receipts/{objectKey}`.
 * Later: same route, swap reader to Yandex Object Storage GetObject / signed URL.
 */
export async function GET(request: Request, ctx: Ctx) {
  const auth = await requireStaffAuth(request);
  if (!auth.ok) return auth.response;
  const roleGate = requireStaffRole(auth, LOYALTY_STAFF_ROLES);
  if (roleGate) return roleGate.response;

  const { id } = await ctx.params;
  if (!id) {
    return NextResponse.json({ ok: false, code: "invalid_id" }, { status: 400 });
  }

  try {
    const [row] = await getDb()
      .select({
        photoObjectKey: loyaltyReceipts.photoObjectKey,
      })
      .from(loyaltyReceipts)
      .where(eq(loyaltyReceipts.id, id))
      .limit(1);

    if (!row?.photoObjectKey) {
      return NextResponse.json({ ok: false, code: "not_found" }, { status: 404 });
    }

    const file = await readReceiptPhotoLocal(row.photoObjectKey);
    if (!file) {
      return NextResponse.json({ ok: false, code: "missing_file" }, { status: 404 });
    }

    return new NextResponse(new Uint8Array(file.bytes), {
      status: 200,
      headers: {
        "content-type": file.contentType,
        "cache-control": "private, no-store",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown";
    console.error("[staff/loyalty/receipts/:id/photo]", message);
    return NextResponse.json(
      { ok: false, code: "db_error", message: "Failed to load photo" },
      { status: 503 },
    );
  }
}
