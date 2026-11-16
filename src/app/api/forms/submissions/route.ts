import { NextResponse } from "next/server";
import { getDb } from "@/server/db/client";
import { submitForm } from "@/server/forms/submit";
import { parseEnvelopeMeta, validateEnvelope } from "@/server/forms/validate";
import {
  boundaryJsonResponse,
  checkRateLimit,
  clientIpFromRequest,
  FORM_JSON_MAX_BYTES,
  FORM_RATE,
  readJsonBody,
} from "@/server/http/public-boundary";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function errorResponse(
  status: number,
  code: string,
  message: string,
  details?: Record<string, string>,
) {
  return NextResponse.json(
    { ok: false, code, message, ...(details ? { details } : {}) },
    { status },
  );
}

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    return errorResponse(415, "unsupported_media", "Expected application/json");
  }

  const limited = checkRateLimit({
    key: `forms:${clientIpFromRequest(request)}`,
    ...FORM_RATE,
  });
  if (!limited.ok) return boundaryJsonResponse(limited);

  const body = await readJsonBody(request, FORM_JSON_MAX_BYTES);
  if (!body.ok) {
    return errorResponse(body.status, body.code, body.message);
  }

  const validated = validateEnvelope(body.value, body.bytes);
  if (!validated.ok) {
    const status =
      validated.code === "payload_too_large"
        ? 413
        : validated.code === "unknown_form" || validated.code === "form_disabled"
          ? 404
          : 400;
    return errorResponse(status, validated.code, validated.message, validated.details);
  }

  const meta = parseEnvelopeMeta(body.value);
  if (!meta) {
    return errorResponse(400, "invalid_payload", "Missing envelope fields");
  }

  let db;
  try {
    db = getDb();
  } catch {
    return errorResponse(503, "db_unavailable", "Database is not configured");
  }

  try {
    const result = await submitForm(db, {
      def: validated.def,
      locale: meta.locale,
      sourcePath: meta.sourcePath,
      placement: meta.placement,
      idempotencyKey: meta.idempotencyKey,
      fields: validated.fields,
    });

    if (result.kind === "conflict") {
      return errorResponse(409, result.code, result.message);
    }

    // 202 Accepted: durable commit done; downstream delivery is async (B2).
    return NextResponse.json(
      {
        ok: true,
        status: result.status,
        submissionId: result.submissionId,
        replay: result.kind === "replay",
      },
      { status: 202 },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown";
    console.error("[forms/submissions]", message);
    // Do not leak SQL details / PII
    const safe =
      message.includes("connect") || message.includes("ECONNREFUSED")
        ? "Database unavailable"
        : "Failed to persist submission";
    return errorResponse(503, "db_error", safe);
  }
}

/** Public GET by ID is intentionally not offered (no PII leak surface). */
export async function GET() {
  return errorResponse(405, "method_not_allowed", "GET is not supported");
}
