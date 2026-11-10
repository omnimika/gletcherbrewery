import { NextResponse } from "next/server";
import { getDb } from "@/server/db/client";
import { loadActiveAliases } from "@/server/loyalty/aliases";
import { requireMemberSession } from "@/server/loyalty/member-auth";
import { proposeEarnFromOcrText } from "@/server/loyalty/ocr";
import { getOcrProvider } from "@/server/loyalty/ocr-provider";
import { storeReceiptPhotoLocal } from "@/server/loyalty/photo-store";
import { decodeFiscalQrFromImage } from "@/server/loyalty/qr-decode";
import {
  createManualReceipt,
  listReceiptsForMember,
} from "@/server/loyalty/receipts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function parseOptionalSum(raw: unknown): number | null {
  if (raw == null) return null;
  const s = String(raw).trim();
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

export async function GET() {
  const auth = await requireMemberSession();
  if (!auth.ok) return auth.response;

  try {
    const rows = await listReceiptsForMember(getDb(), auth.member.id, 50);
    return NextResponse.json({ ok: true, receipts: rows });
  } catch (err) {
    console.error(
      "[loyalty/receipts GET]",
      err instanceof Error ? err.message : err,
    );
    return NextResponse.json(
      { ok: false, code: "db_error" },
      { status: 503 },
    );
  }
}

/**
 * Member uploads a check (photo / QR / manual fallback).
 * Email is always taken from the session — never from the form.
 */
export async function POST(request: Request) {
  const auth = await requireMemberSession();
  if (!auth.ok) return auth.response;

  let gletcherSumRub: number | null = null;
  let city = auth.member.city?.trim() || "";
  let purchaseAt = "";
  let venueNetwork: string | null = null;
  let venueName: string | null = null;
  let qrPayload: string | null = null;
  let photoObjectKey: string | null = null;
  let ocrText: string | null = null;
  let ocrLines: unknown[] = [];
  let ocrEligibleSum: number | null = null;
  let ocrProviderId: string | null = null;
  let photoBuf: Buffer | null = null;
  let photoContentType: string | null = null;

  const contentType = request.headers.get("content-type") || "";
  try {
    if (!contentType.includes("multipart/form-data")) {
      return NextResponse.json(
        { ok: false, code: "expected_multipart" },
        { status: 400 },
      );
    }
    const form = await request.formData();
    gletcherSumRub = parseOptionalSum(form.get("gletcherSumRub"));
    city = String(form.get("city") ?? city).trim();
    purchaseAt = String(form.get("purchaseAt") ?? "");
    venueNetwork = String(form.get("venueNetwork") ?? "") || null;
    venueName = String(form.get("venueName") ?? "") || null;
    qrPayload = String(form.get("qrPayload") ?? "") || null;

    const photo = form.get("photo");
    if (photo && typeof photo !== "string" && "arrayBuffer" in photo) {
      photoBuf = Buffer.from(await photo.arrayBuffer());
      if (photoBuf.length > 8_000_000) {
        return NextResponse.json(
          { ok: false, code: "photo_too_large", message: "Max 8MB" },
          { status: 400 },
        );
      }
      photoContentType = photo.type || "image/jpeg";
      const stored = await storeReceiptPhotoLocal({
        bytes: photoBuf,
        contentType: photoContentType,
        originalName: photo.name,
      });
      photoObjectKey = stored.objectKey;
      if (!qrPayload) {
        const decoded = decodeFiscalQrFromImage(photoBuf, photoContentType);
        if (decoded) qrPayload = decoded.payload;
      }
    }
  } catch {
    return NextResponse.json(
      { ok: false, code: "invalid_body" },
      { status: 400 },
    );
  }

  try {
    const db = getDb();

    if (photoBuf) {
      const provider = getOcrProvider();
      ocrProviderId = provider.id;
      const extracted = await provider.extractText(
        photoBuf,
        photoContentType || undefined,
      );
      if (extracted) ocrText = extracted;
    }

    if (ocrText) {
      const aliases = await loadActiveAliases(db);
      const proposal = proposeEarnFromOcrText(ocrText, aliases);
      ocrLines = proposal.lines;
      ocrEligibleSum =
        proposal.eligibleSum > 0 ? proposal.eligibleSum : null;
    }

    const result = await createManualReceipt(db, {
      email: auth.member.emailNormalized,
      displayName: auth.member.displayName,
      gletcherSumRub,
      city,
      purchaseAt,
      venueNetwork,
      venueName,
      qrPayload,
      photoObjectKey,
      ocrText,
      ocrLines,
      ocrEligibleSum,
      sourceHint: qrPayload ? "qr" : ocrText ? "ocr" : "manual",
    });

    if (!result.ok) {
      const status = result.code === "duplicate_receipt" ? 409 : 400;
      return NextResponse.json(
        {
          ok: false,
          code: result.code,
          existingId:
            result.code === "duplicate_receipt" ? result.existingId : undefined,
        },
        { status },
      );
    }

    return NextResponse.json({
      ok: true,
      receipt: result.receipt,
      ocr: ocrText
        ? {
            provider: ocrProviderId,
            eligibleSum: ocrEligibleSum,
            lineCount: ocrLines.length,
          }
        : null,
    });
  } catch (err) {
    console.error(
      "[loyalty/receipts POST]",
      err instanceof Error ? err.message : err,
    );
    return NextResponse.json(
      { ok: false, code: "db_error" },
      { status: 503 },
    );
  }
}
