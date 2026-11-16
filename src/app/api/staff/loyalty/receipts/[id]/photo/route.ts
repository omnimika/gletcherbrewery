import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/server/db/client";
import { loyaltyReceipts } from "@/server/db/schema";
import { readReceiptPhotoLocal } from "@/server/loyalty/photo-store";
import {
  STAFF_COOKIE_NAME,
  verifyStaffToken,
} from "@/server/staff/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

/**
 * Staff-only receipt photo stream.
 * Today: local `.tmp/loyalty-receipts/{objectKey}`.
 * Later: same route, swap reader to Yandex Object Storage GetObject / signed URL.
 */
export async function GET(_request: Request, ctx: Ctx) {
  const token = (await cookies()).get(STAFF_COOKIE_NAME)?.value;
  if (!verifyStaffToken(token)) {
    return NextResponse.json({ ok: false, code: "unauthorized" }, { status: 401 });
  }

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
      return NextResponse.json({ ok: false, code: "no_photo" }, { status: 404 });
    }

    const photo = await readReceiptPhotoLocal(row.photoObjectKey);
    if (!photo) {
      return NextResponse.json(
        { ok: false, code: "photo_missing" },
        { status: 404 },
      );
    }

    return new NextResponse(new Uint8Array(photo.bytes), {
      status: 200,
      headers: {
        "Content-Type": photo.contentType,
        "Cache-Control": "private, max-age=60",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (err) {
    console.error(
      "[staff/loyalty/receipts/:id/photo]",
      err instanceof Error ? err.message : err,
    );
    return NextResponse.json({ ok: false, code: "db_error" }, { status: 503 });
  }
}
