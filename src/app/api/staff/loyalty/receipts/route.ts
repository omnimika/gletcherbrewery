import { NextResponse } from "next/server";
import { getDb } from "@/server/db/client";
import { loadActiveAliases } from "@/server/loyalty/aliases";
import { proposeEarnFromOcrText } from "@/server/loyalty/ocr";
import { getOcrProvider } from "@/server/loyalty/ocr-provider";
import { storeReceiptPhotoLocal } from "@/server/loyalty/photo-store";
import { decodeFiscalQrFromImage } from "@/server/loyalty/qr-decode";
import {
  createManualReceipt,
  listPendingReceipts,
} from "@/server/loyalty/receipts";
import { requireStaffAuth } from "@/server/staff/request-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function parseOptionalSum(raw: unknown): number | null {
  if (raw == null) return null;
  const s = String(raw).trim();
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

export async function GET(request: Request) {
  const auth = await requireStaffAuth(request);
  if (!auth.ok) return auth.response;

  try {
    const rows = await listPendingReceipts(getDb(), 100);
    return NextResponse.json({
      ok: true,
      receipts: rows.map((r) => ({
        ...r.receipt,
        memberEmail: r.email,
        memberName: r.displayName,
      })),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown";
    console.error("[staff/loyalty/receipts GET]", message);
    return NextResponse.json(
      { ok: false, code: "db_error", message: "Failed to list receipts" },
      { status: 503 },
    );
  }
}

/**
 * Staff creates a manual / QR/OCR-assisted receipt for a member (email).
 * multipart: email, city, purchaseAt, venueNetwork|venueName,
 * optional gletcherSumRub, qrPayload, photo.
 * On photo: decode QR; run OCR provider; propose earn from aliases when sum omitted.
 */
export async function POST(request: Request) {
  const auth = await requireStaffAuth(request);
  if (!auth.ok) return auth.response;

  let email = "";
  let gletcherSumRub: number | null = null;
  let city = "";
  let purchaseAt = "";
  let venueNetwork: string | null = null;
  let venueName: string | null = null;
  let qrPayload: string | null = null;
  let displayName: string | null = null;
  let photoObjectKey: string | null = null;
  let ocrText: string | null = null;
  let ocrLines: unknown[] = [];
  let ocrEligibleSum: number | null = null;
  let ocrProviderId: string | null = null;
  let photoBuf: Buffer | null = null;
  let photoContentType: string | null = null;

  const contentType = request.headers.get("content-type") || "";
  try {
    if (contentType.includes("multipart/form-data")) {
      const form = await request.formData();
      email = String(form.get("email") ?? "");
      gletcherSumRub = parseOptionalSum(form.get("gletcherSumRub"));
      city = String(form.get("city") ?? "");
      purchaseAt = String(form.get("purchaseAt") ?? "");
      venueNetwork = String(form.get("venueNetwork") ?? "") || null;
      venueName = String(form.get("venueName") ?? "") || null;
      qrPayload = String(form.get("qrPayload") ?? "") || null;
      displayName = String(form.get("displayName") ?? "") || null;
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
    } else {
      const raw = (await request.json()) as Record<string, unknown>;
      email = String(raw.email ?? "");
      gletcherSumRub = parseOptionalSum(raw.gletcherSumRub);
      city = String(raw.city ?? "");
      purchaseAt = String(raw.purchaseAt ?? "");
      venueNetwork = raw.venueNetwork ? String(raw.venueNetwork) : null;
      venueName = raw.venueName ? String(raw.venueName) : null;
      qrPayload = raw.qrPayload ? String(raw.qrPayload) : null;
      displayName = raw.displayName ? String(raw.displayName) : null;
      if (typeof raw.ocrText === "string" && raw.ocrText.trim()) {
        ocrText = raw.ocrText;
      }
    }
  } catch {
    return NextResponse.json(
      { ok: false, code: "invalid_body", message: "Malformed body" },
      { status: 400 },
    );
  }

  try {
    const db = getDb();

    if (photoBuf && !ocrText) {
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
      email,
      gletcherSumRub,
      city,
      purchaseAt,
      venueNetwork,
      venueName,
      qrPayload,
      photoObjectKey,
      displayName,
      ocrText,
      ocrLines,
      ocrEligibleSum,
      sourceHint: qrPayload
        ? "qr"
        : ocrText
          ? "ocr"
          : "manual",
    });
    if (!result.ok) {
      const status =
        result.code === "duplicate_receipt"
          ? 409
          : result.code === "invalid_email"
            ? 400
            : 400;
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
    const message = err instanceof Error ? err.message : "unknown";
    console.error("[staff/loyalty/receipts POST]", message);
    return NextResponse.json(
      { ok: false, code: "db_error", message: "Failed to create receipt" },
      { status: 503 },
    );
  }
}
